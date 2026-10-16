import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Download,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Invoice, Payment } from '../../types';
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
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}) => {
  if (!invoice) return null;

  const [amountRupees, setAmountRupees] = useState<string>(
    String(invoice.balancePaise > 0 ? invoice.balancePaise / 100 : 0)
  );
  const [selectedMethod, setSelectedMethod] = useState<'RAZORPAY' | 'UPI' | 'NET_BANKING' | 'CARD'>('RAZORPAY');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedPayment, setCompletedPayment] = useState<Payment | null>(null);

  const balanceRupees = invoice.balancePaise / 100;
  const currentAmountRupees = parseFloat(amountRupees) || 0;

  const handleInitiatePayment = async () => {
    setErrorMsg(null);
    if (currentAmountRupees <= 0) {
      setErrorMsg('Please enter a payment amount greater than ₹0.');
      return;
    }

    if (currentAmountRupees > balanceRupees) {
      setErrorMsg(`Payment amount cannot exceed the outstanding balance of ₹${balanceRupees.toLocaleString('en-IN')}.`);
      return;
    }

    const amountPaise = rupeesToPaise(amountRupees);
    setIsProcessing(true);

    try {
      // 1. Create Order on Backend
      const order = await api.createPaymentOrder(invoice.id, amountPaise);

      // 2. Razorpay Standard Checkout options
      const options = {
        key: order.keyId,
        amount: order.amountPaise,
        currency: 'INR',
        name: 'Apex Academy of Science',
        description: `Fee Settle - ${order.invoiceNumber} (${order.studentName})`,
        image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=128&q=80',
        order_id: order.orderId,
        prefill: {
          name: order.studentName,
          email: 'accounts@apexacademy.edu.in',
          contact: '+919876543210',
        },
        theme: {
          color: '#4f46e5',
        },
        handler: async (response: any) => {
          try {
            // 3. Verify Signature on Server
            const verifyRes = await api.verifyPaymentSignature({
              invoiceId: invoice.id,
              amountPaise,
              razorpayOrderId: response.razorpay_order_id || order.orderId,
              razorpayPaymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
              razorpaySignature: response.razorpay_signature || 'simulated_test_sig',
              paymentMethod: selectedMethod,
            });

            setCompletedPayment(verifyRes.payment);
            onSuccess(verifyRes.payment);
          } catch (vErr: any) {
            setErrorMsg(`Signature verification failed: ${vErr.message}`);
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      // 3. Launch Razorpay Checkout if window.Razorpay is loaded
      if (typeof (window as any).Razorpay !== 'undefined') {
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (failRes: any) => {
          setErrorMsg(`Payment failed: ${failRes.error?.description || 'Transaction cancelled or declined'}`);
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        // Fallback demo simulation (e.g. offline/ad-blocker environments)
        setTimeout(async () => {
          try {
            const verifyRes = await api.verifyPaymentSignature({
              invoiceId: invoice.id,
              amountPaise,
              razorpayOrderId: order.orderId,
              razorpayPaymentId: `pay_test_${Date.now()}`,
              razorpaySignature: 'simulated_test_sig',
              paymentMethod: selectedMethod,
            });

            setCompletedPayment(verifyRes.payment);
            onSuccess(verifyRes.payment);
          } catch (vErr: any) {
            setErrorMsg(vErr.message || 'Payment simulation failed');
          } finally {
            setIsProcessing(false);
          }
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initiate Razorpay payment order');
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={completedPayment ? 'Payment Successful' : 'Razorpay Secure Fee Checkout'}
      maxWidth="lg"
    >
      {completedPayment ? (
        <div className="space-y-6 text-center py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-in zoom-in">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">Payment Confirmed & Verified!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Transaction successfully settled and credited to scholar fee ledger.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 text-left space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Receipt Number</span>
              <span className="text-white font-mono font-bold">{completedPayment.receiptNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Transaction Reference</span>
              <span className="text-white font-mono">{completedPayment.transactionRef}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Scholar</span>
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
        <div className="space-y-5">
          {/* Invoice Summary Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Invoice Number</span>
                <span className="text-sm font-mono font-bold text-white">{invoice.invoiceNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Scholar Name</span>
                <span className="text-sm font-bold text-white">{invoice.studentName}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Total Applicable</span>
                <span className="font-semibold text-slate-200">{formatPaiseToINR(invoice.totalPaise)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Paid to Date</span>
                <span className="font-semibold text-emerald-400">{formatPaiseToINR(invoice.paidPaise)}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Outstanding Balance</span>
                <span className="font-bold text-rose-400">{formatPaiseToINR(invoice.balancePaise)}</span>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Amount to Pay */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Amount to Pay (INR ₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                min="1"
                max={balanceRupees}
                value={amountRupees}
                onChange={e => setAmountRupees(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Enter amount"
              />
            </div>

            {/* Quick Amount Presets */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAmountRupees(String(balanceRupees))}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-white/5 transition-colors"
              >
                Full Balance (₹{balanceRupees.toLocaleString('en-IN')})
              </button>
              {balanceRupees > 10000 && (
                <button
                  type="button"
                  onClick={() => setAmountRupees(String(Math.round(balanceRupees / 2)))}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-white/5 transition-colors"
                >
                  50% Partial (₹{Math.round(balanceRupees / 2).toLocaleString('en-IN')})
                </button>
              )}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Payment Gateway Mode
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'RAZORPAY', label: 'Razorpay All', icon: Zap },
                { id: 'UPI', label: 'UPI / QR', icon: Sparkles },
                { id: 'CARD', label: 'Debit/Credit', icon: CreditCard },
                { id: 'NET_BANKING', label: 'NetBanking', icon: ShieldCheck },
              ].map(method => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-brand-500/20 border-brand-500 text-white shadow-lg shadow-brand-500/10'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-400' : 'text-slate-400'}`} />
                    <span>{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Security Guarantee */}
          <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Razorpay 256-Bit SSL Encrypted Checkout</span>
            </div>
            <span className="text-[10px] text-brand-400 font-mono">HMAC-SHA256 Verified</span>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <Button variant="ghost" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleInitiatePayment}
              isLoading={isProcessing}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Pay ₹{currentAmountRupees.toLocaleString('en-IN')} via Razorpay
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
