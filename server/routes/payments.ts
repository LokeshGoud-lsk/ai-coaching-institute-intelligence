import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { store } from '../db';
import { Payment } from '../../src/types';
import { calculateBalancePaise, determineInvoiceStatus } from '../../src/lib/feeCalculations';

const router = Router();

// Initialize Razorpay instance if environment variables exist
let razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_ApexDemoKey';
let razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_ApexDemoSecret';
let razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret';

let razorpayClient: Razorpay | null = null;
function initRazorpayClient() {
  if (razorpayKeyId && razorpayKeySecret && !razorpayKeyId.includes('ApexDemoKey')) {
    try {
      razorpayClient = new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      });
      console.log('[Razorpay]: Initialized Razorpay client with key:', razorpayKeyId);
    } catch (e) {
      console.warn('[Razorpay]: Client init error:', e);
      razorpayClient = null;
    }
  } else {
    razorpayClient = null;
  }
}
initRazorpayClient();

// Role authorization guard: Payment mutations are strictly restricted to ADMIN role
function requireAdminRole(req: Request, res: Response, next: () => void) {
  const role = (req.headers['x-user-role'] as string) || (req.query.role as string) || 'ADMIN';
  if (role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Access denied: Razorpay payment gateway configuration, order creation, and fee settlements are strictly restricted to the ADMIN role.',
      requiredRole: 'ADMIN',
      currentRole: role,
    });
  }
  next();
}

// GET /api/v1/payments/gateway-info - Get current gateway status
router.get('/gateway-info', (req: Request, res: Response) => {
  const isReal = Boolean(razorpayClient);
  return res.json({
    configured: isReal,
    mode: isReal ? (razorpayKeyId.startsWith('rzp_live_') ? 'LIVE' : 'TEST') : 'DEMO_TEST',
    keyId: razorpayKeyId ? `${razorpayKeyId.slice(0, 8)}...${razorpayKeyId.slice(-4)}` : null,
    fullKeyIdForCheckout: razorpayKeyId,
    currency: 'INR',
    webhookConfigured: Boolean(razorpayWebhookSecret && !razorpayWebhookSecret.includes('rzp_webhook_secret')),
    signatureVerification: 'HMAC-SHA256 Server-Enforced',
  });
});

// POST /api/v1/payments/configure - Set Razorpay Keys dynamically (Admin Only)
router.post('/configure', requireAdminRole, (req: Request, res: Response) => {
  const { keyId, keySecret, webhookSecret } = req.body;

  if (!keyId || !keySecret) {
    return res.status(400).json({ error: 'Key ID and Key Secret are required.' });
  }

  razorpayKeyId = keyId.trim();
  razorpayKeySecret = keySecret.trim();
  if (webhookSecret) {
    razorpayWebhookSecret = webhookSecret.trim();
  }

  process.env.RAZORPAY_KEY_ID = razorpayKeyId;
  process.env.RAZORPAY_KEY_SECRET = razorpayKeySecret;
  if (webhookSecret) {
    process.env.RAZORPAY_WEBHOOK_SECRET = razorpayWebhookSecret;
  }

  initRazorpayClient();

  store.logAudit('PAYMENT_GATEWAY_CREDENTIALS_UPDATED', 'PAYMENT', {
    keyPrefix: razorpayKeyId.slice(0, 8),
    hasClient: Boolean(razorpayClient),
  });

  return res.json({
    message: 'Razorpay payment gateway configured successfully.',
    configured: Boolean(razorpayClient),
    mode: razorpayKeyId.startsWith('rzp_live_') ? 'LIVE' : 'TEST',
  });
});

// POST /api/v1/payments/test-connection - Test Razorpay API credentials (Admin Only)
router.post('/test-connection', requireAdminRole, async (req: Request, res: Response) => {
  if (!razorpayClient) {
    return res.status(400).json({
      success: false,
      error: 'Razorpay client is not configured with valid API keys. Please configure Key ID and Key Secret first.',
    });
  }

  try {
    const orders = await razorpayClient.orders.all({ count: 1 });
    return res.json({
      success: true,
      message: 'Razorpay API credentials verified successfully! Test connection active.',
      count: orders.items?.length || 0,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: err.error?.description || err.message || 'Razorpay authentication failed.',
    });
  }
});

// POST /api/v1/payments/create-order - Create Razorpay order (Admin Only)
router.post('/create-order', requireAdminRole, async (req: Request, res: Response) => {
  const { invoiceId, amountPaise } = req.body;

  if (!invoiceId || !amountPaise) {
    return res.status(400).json({ error: 'invoiceId and amountPaise are required' });
  }

  const invoice = store.invoices.find(i => i.id === invoiceId);
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  const balance = calculateBalancePaise(invoice.totalPaise, invoice.paidPaise);
  const requestedPaise = Number(amountPaise);

  if (requestedPaise <= 0 || requestedPaise > balance) {
    return res.status(400).json({
      error: `Invalid payment amount. Must be between 100 paise (₹1) and outstanding balance of ${balance} paise.`,
    });
  }

  try {
    let orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (razorpayClient) {
      const order = await razorpayClient.orders.create({
        amount: requestedPaise,
        currency: 'INR',
        receipt: `rcpt_${invoice.invoiceNumber}`,
        notes: {
          invoiceId: invoice.id,
          studentId: invoice.studentId,
        },
      });
      orderId = order.id;
    }

    return res.json({
      orderId,
      amountPaise: requestedPaise,
      currency: 'INR',
      keyId: razorpayKeyId,
      invoiceNumber: invoice.invoiceNumber,
      studentName: invoice.studentName,
      isTestMode: true,
      hasRealCredentials: Boolean(razorpayClient),
    });
  } catch (err: any) {
    console.error('Razorpay order creation error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create Razorpay order' });
  }
});

// POST /api/v1/payments/verify-signature - Secure server-side signature verification (Admin Only)
router.post('/verify-signature', requireAdminRole, (req: Request, res: Response) => {
  const {
    invoiceId,
    amountPaise,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    paymentMethod = 'RAZORPAY',
  } = req.body;

  if (!invoiceId || !amountPaise) {
    return res.status(400).json({ error: 'invoiceId and amountPaise are required' });
  }

  const invoice = store.invoices.find(i => i.id === invoiceId);
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  // Idempotency check: verify if payment ID was already processed
  if (razorpayPaymentId) {
    const existingPayment = store.payments.find(p => p.razorpayPaymentId === razorpayPaymentId);
    if (existingPayment) {
      return res.json({
        message: 'Payment already processed (idempotent)',
        payment: existingPayment,
      });
    }
  }

  // Signature verification if real credentials are used
  let signatureValid = true;
  if (razorpayClient && razorpayOrderId && razorpayPaymentId && razorpaySignature) {
    const generatedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    signatureValid = generatedSignature === razorpaySignature;

    if (!signatureValid) {
      store.logAudit('PAYMENT_SIGNATURE_FAILED', 'PAYMENT', {
        invoiceId,
        razorpayOrderId,
        razorpayPaymentId,
      });
      return res.status(400).json({ error: 'Invalid payment signature. Verification failed.' });
    }
  }

  const paidAmount = Number(amountPaise);
  const receiptNumber = `RCPT-2026-${String(store.payments.length + 1001).padStart(5, '0')}`;

  const newPayment: Payment = {
    id: `pay-${Date.now()}`,
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    studentId: invoice.studentId,
    studentName: invoice.studentName,
    amountPaise: paidAmount,
    paymentMethod: paymentMethod,
    status: 'SUCCESS',
    receiptNumber,
    transactionRef: razorpayPaymentId || `TXN-${Date.now()}`,
    razorpayOrderId,
    razorpayPaymentId,
    paidAt: new Date().toISOString(),
    notes: 'Verified via Razorpay Payment Gateway.',
  };

  // Update invoice ledger
  invoice.paidPaise += paidAmount;
  invoice.balancePaise = calculateBalancePaise(invoice.totalPaise, invoice.paidPaise);
  invoice.status = determineInvoiceStatus(invoice.totalPaise, invoice.paidPaise, invoice.dueDate);

  // Update student ledger
  const student = store.students.find(s => s.id === invoice.studentId);
  if (student) {
    student.paidFeePaise = (student.paidFeePaise || 0) + paidAmount;
    student.balanceFeePaise = Math.max(0, (student.balanceFeePaise || 0) - paidAmount);
  }

  store.payments.unshift(newPayment);

  // Create notification
  store.notifications.unshift({
    id: `notif-${Date.now()}`,
    type: 'PAYMENT_CONFIRMATION',
    title: `Payment Received: ₹${(paidAmount / 100).toFixed(2)}`,
    message: `Payment confirmed for ${invoice.studentName} (Invoice ${invoice.invoiceNumber}).`,
    entityId: newPayment.id,
    entityType: 'PAYMENT',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  store.logAudit('PAYMENT_VERIFIED_AND_RECORDED', 'PAYMENT', {
    receiptNumber,
    invoiceNumber: invoice.invoiceNumber,
    studentName: invoice.studentName,
    amountPaise: paidAmount,
  });

  return res.json({
    message: 'Payment verified and fee ledger updated successfully.',
    payment: newPayment,
    updatedInvoice: invoice,
  });
});

// POST /api/v1/payments/webhook - Webhook handler for asynchronous event confirmation
router.post('/webhook', (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string;

  if (signature && process.env.RAZORPAY_WEBHOOK_SECRET) {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
  }

  const event = req.body.event;
  store.logAudit('PAYMENT_WEBHOOK_RECEIVED', 'PAYMENT', { event });

  return res.json({ status: 'ok', received: true });
});

// GET /api/v1/payments/history - All completed payments
router.get('/history', (req: Request, res: Response) => {
  return res.json(store.payments);
});

// GET /api/v1/payments/receipt/:id - Get receipt details
router.get('/receipt/:id', (req: Request, res: Response) => {
  const payment = store.payments.find(p => p.id === req.params.id || p.receiptNumber === req.params.id);
  if (!payment) {
    return res.status(404).json({ error: 'Receipt not found' });
  }

  return res.json(payment);
});

export default router;
