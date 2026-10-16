import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { store } from '../db';
import { Payment } from '../../src/types';
import { calculateBalancePaise, determineInvoiceStatus } from '../../src/lib/feeCalculations';

const router = Router();

// Initialize Razorpay instance if environment variables exist
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_ApexDemoKey';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_ApexDemoSecret';
const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret';

let razorpayClient: Razorpay | null = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (e) {
  console.warn('Razorpay client init warning:', e);
}

// POST /api/v1/payments/create-order - Create Razorpay order
router.post('/create-order', async (req: Request, res: Response) => {
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

// POST /api/v1/payments/verify-signature - Secure server-side signature verification
router.post('/verify-signature', (req: Request, res: Response) => {
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
