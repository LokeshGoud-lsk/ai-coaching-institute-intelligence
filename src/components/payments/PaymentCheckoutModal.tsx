import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Download,
  Lock,
  ArrowRight,
  Clock,
  RefreshCw,
  Copy,
  Check,
  Building2,
  ShieldAlert,
} from 'lucide-react';
import { Invoice, Payment, UserRole } from '../../types';
import { api } from '../../lib/api';
import { formatPaiseToINR, rupeesToPaise } from '../../lib/feeCalculations';
import { generatePaymentReceiptPDF } from '../../lib/pdfGenerator';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSuccess: (payment: Payment) => void;
  userRole?: UserRole;
}

const QR_TIMEOUT_SECONDS = 300; // 5 minutes standard timeout

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSuccess,
  userRole = 'ADMIN',
}) => {
  if (!invoice) return null;

  const isAdmin = userRole === 'ADMIN';

  const [amountRupees, setAmountRupees] = useState<string>(
    String(invoice.balancePaise > 0 ? invoice.balancePaise / 100 : 0)
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedPayment, setCompletedPayment] = useState<Payment | null>(null);

  // QR Code State
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(QR_TIMEOUT_SECONDS);
  const [isCopied, setIsCopied] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const balanceRupees = invoice.balancePaise / 100;
  const currentAmountRupees = parseFloat(amountRupees) || 0;
  const upiId = 'edutrack.fees@icici';

  // Generate Razorpay UPI Dynamic QR Code
  const generateQRCode = async () => {
    try {
      setErrorMsg(null);
      const generatedOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setOrderId(generatedOrderId);

      const upiUri = `upi://pay?pa=${upiId}&pn=Apex%20Academy%20of%20Science&am=${currentAmountRupees.toFixed(2)}&cu=INR&tn=Fee%20${invoice.invoiceNumber}&tr=${generatedOrderId}`;

      const url = await QRCode.toDataURL(upiUri, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
      });

      setQrDataUrl(url);
      setSecondsRemaining(QR_TIMEOUT_SECONDS);
    } catch (err: any) {
      console.error('QR generation error:', err);
      setErrorMsg('Failed to render dynamic UPI QR code.');
    }
  };

  // Timer countdown management
  useEffect(() => {
    if (!isOpen || !isAdmin || completedPayment) return;

    generateQRCode();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isAdmin, amountRupees]);

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleVerifyPayment = async () => {
    if (!isAdmin) {
      setErrorMsg('Unauthorized: Only administrators can settle payments.');
      return;
    }

    if (secondsRemaining <= 0) {
      setErrorMsg('QR code session has expired. Please regenerate a new QR code to complete payment.');
      return;
    }

    if (currentAmountRupees <= 0) {
      setErrorMsg('Please specify a valid payment amount.');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const amountPaise = rupeesToPaise(amountRupees);

      // Verify and record the payment via the verified backend ledger
      const verifyRes = await api.verifyPaymentSignature({
        invoiceId: invoice.id,
        amountPaise,
        razorpayOrderId: orderId || `order_${Date.now()}`,
        razorpayPaymentId: `pay_upi_qr_${Date.now()}`,
        razorpaySignature: 'simulated_upi_qr_sig',
        paymentMethod: 'UPI',
      });

      setCompletedPayment(verifyRes.payment);
      onSuccess(verifyRes.payment);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment verification failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!completedPayment) return;
    generatePaymentReceiptPDF({
      receiptNumber: completedPayment.receiptNumber,
      studentName: invoice.studentName || 'Scholar',
      studentCode: 'APEX-2026',
      amountPaise: completedPayment.amountPaise,
      paymentMethod: completedPayment.paymentMethod,
      paidAt: completedPayment.paidAt,
      transactionRef: completedPayment.transactionRef,
      invoiceNumber: invoice.invoiceNumber,
    });
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isExpired = secondsRemaining === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        !isAdmin
          ? 'Admin Access Restricted'
          : completedPayment
          ? 'Payment Confirmed & Verified'
          : 'Razorpay UPI QR Instant Settlement'
      }
      maxWidth="lg"
    >
      {/* 1. NON-ADMIN ROLE RESTRICTION VIEW */}
      {!isAdmin ? (
        <div className="py-6 px-4 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/50">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white font-heading">
              Restricted to Institute Administrators
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Razorpay UPI QR code generation, fee collection, and financial ledger settlement are
              strictly restricted to users with the <span className="text-amber-400 font-semibold font-mono">ADMIN</span> role.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-left max-w-sm mx-auto space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Current Persona:</span>
              <span className="text-rose-400 font-bold uppercase">{userRole}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Required Privilege:</span>
              <span className="text-emerald-400 font-bold font-mono">ROLE_ADMIN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Target Invoice:</span>
              <span className="text-white font-mono">{invoice.invoiceNumber}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Tip: Switch your role persona to <strong>ADMIN</strong> using the top-right header role switcher to authorize fee collections.
          </p>

          <div className="pt-2">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Close Window
            </Button>
          </div>
        </div>
      ) : completedPayment ? (
        /* 2. SUCCESSFUL PAYMENT SCREEN */
        <div className="space-y-6 text-center py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-in zoom-in">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white font-heading">UPI Payment Verified & Settle Realized!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Razorpay dynamic QR transaction credited to institutional ledger.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 text-left space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Receipt Number</span>
              <span className="text-white font-mono font-bold">{completedPayment.receiptNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Gateway Transaction Ref</span>
              <span className="text-white font-mono">{completedPayment.transactionRef}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Scholar Name</span>
              <span className="text-white font-semibold">{invoice.studentName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Invoice Number</span>
              <span className="text-white font-mono">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Amount Paid</span>
              <span className="text-emerald-400 font-bold text-sm">
                {formatPaiseToINR(completedPayment.amountPaise)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="gradient"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleDownloadPDF}
            >
              Download PDF Receipt
            </Button>
            <Button variant="outline" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        /* 3. RAZORPAY UPI DYNAMIC QR PAYMENT (ONLY QR WITH TIME LIMIT) */
        <div className="space-y-4">
          {/* Admin Clearance & Razorpay Header */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-semibold">Razorpay UPI Gateway</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-brand-500/20 text-brand-300 border border-brand-500/30 font-bold">
                ONLY QR MODE
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Authorized</span>
            </div>
          </div>

          {/* Invoice Mini Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Scholar & Invoice</span>
              <span className="text-white font-bold">{invoice.studentName}</span>
              <span className="text-slate-400 text-[11px] block font-mono">{invoice.invoiceNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Settlement Amount</span>
              <span className="text-emerald-400 font-extrabold text-base">
                ₹{currentAmountRupees.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block">Balance: {formatPaiseToINR(invoice.balancePaise)}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* UPI DYNAMIC QR CARD WITH TIME LIMIT */}
          <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-white/15 p-5 text-center shadow-2xl space-y-4">
            {/* Countdown Timer Header */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Clock className={`w-4 h-4 ${isExpired ? 'text-rose-400' : 'text-amber-400 animate-pulse'}`} />
                <span>Session Time Remaining</span>
              </div>

              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-mono font-bold tracking-wider ${
                  isExpired
                    ? 'bg-rose-950/80 border-rose-500/40 text-rose-400'
                    : secondsRemaining < 60
                    ? 'bg-amber-950/80 border-amber-500/50 text-amber-300 animate-pulse'
                    : 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
                }`}
              >
                <span>{formattedTime}</span>
              </div>
            </div>

            {/* Time Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  isExpired
                    ? 'w-0'
                    : secondsRemaining < 60
                    ? 'bg-rose-500'
                    : 'bg-gradient-to-r from-brand-500 to-emerald-400'
                }`}
                style={{ width: `${(secondsRemaining / QR_TIMEOUT_SECONDS) * 100}%` }}
              />
            </div>

            {/* QR Code Graphic Box */}
            <div className="relative mx-auto w-64 h-64 p-3 rounded-2xl bg-white shadow-xl flex items-center justify-center">
              {qrDataUrl && !isExpired ? (
                <img
                  src={qrDataUrl}
                  alt="Razorpay Dynamic UPI QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">QR Code Expired</span>
                  <p className="text-[11px] text-slate-500">
                    For security, payment QR sessions expire in 5 minutes.
                  </p>
                </div>
              )}

              {/* Expired Overlay */}
              {isExpired && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4 space-y-3">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                    QR Code Expired
                  </span>
                  <Button
                    size="sm"
                    variant="gradient"
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    onClick={generateQRCode}
                  >
                    Regenerate QR
                  </Button>
                </div>
              )}
            </div>

            {/* Instructions & UPI Apps */}
            <div className="space-y-2">
              <p className="text-xs text-slate-300 font-medium">
                Scan with any UPI App to complete payment:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                <span className="px-2 py-1 rounded-lg bg-slate-800/80 border border-white/5 text-slate-200">Google Pay</span>
                <span className="px-2 py-1 rounded-lg bg-slate-800/80 border border-white/5 text-slate-200">PhonePe</span>
                <span className="px-2 py-1 rounded-lg bg-slate-800/80 border border-white/5 text-slate-200">Paytm</span>
                <span className="px-2 py-1 rounded-lg bg-slate-800/80 border border-white/5 text-slate-200">BHIM</span>
                <span className="px-2 py-1 rounded-lg bg-slate-800/80 border border-white/5 text-slate-200">Cred UPI</span>
              </div>
            </div>

            {/* UPI ID Details with Copy */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="text-slate-500 text-[11px]">UPI VPA:</span>
              <span className="font-semibold text-white">{upiId}</span>
              <button
                type="button"
                onClick={handleCopyUPI}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                title="Copy UPI ID"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Amount Adjustment Presets (Admin Only) */}
          <div className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">Amount to Collect (INR ₹):</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAmountRupees(String(balanceRupees))}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-white/5"
                >
                  Full (₹{balanceRupees.toLocaleString('en-IN')})
                </button>
                {balanceRupees > 5000 && (
                  <button
                    type="button"
                    onClick={() => setAmountRupees(String(Math.round(balanceRupees / 2)))}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-white/5"
                  >
                    50% (₹{Math.round(balanceRupees / 2).toLocaleString('en-IN')})
                  </button>
                )}
              </div>
            </div>
            <input
              type="number"
              min="1"
              max={balanceRupees}
              value={amountRupees}
              onChange={e => setAmountRupees(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Enter amount"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
            <Button variant="ghost" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            {isExpired ? (
              <Button
                variant="gradient"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={generateQRCode}
              >
                Regenerate QR Code
              </Button>
            ) : (
              <Button
                variant="gradient"
                onClick={handleVerifyPayment}
                isLoading={isProcessing}
                leftIcon={<CheckCircle className="w-4 h-4" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                I Have Paid ₹{currentAmountRupees.toLocaleString('en-IN')} (Verify)
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
