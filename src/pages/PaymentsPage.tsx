import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Download,
  ShieldCheck,
  Receipt,
  Plus,
} from 'lucide-react';
import { api } from '../lib/api';
import { Payment, Invoice } from '../types';
import { Button } from '../components/common/Button';
import { PaymentCheckoutModal } from '../components/payments/PaymentCheckoutModal';
import { formatPaiseToINR } from '../lib/feeCalculations';
import { generatePaymentReceiptPDF } from '../lib/pdfGenerator';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pay Invoice Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [paymentsRes, invoicesRes] = await Promise.all([
        api.getPaymentHistory(),
        api.getInvoices(),
      ]);
      setPayments(paymentsRes);
      setInvoices(invoicesRes);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenPayModal = (inv: Invoice) => {
    setSelectedInvoice(inv);
  };

  const handleDownloadReceipt = (payment: Payment) => {
    generatePaymentReceiptPDF({
      receiptNumber: payment.receiptNumber,
      studentName: payment.studentName || 'Scholar',
      studentCode: 'APEX-2026',
      amountPaise: payment.amountPaise,
      paymentMethod: payment.paymentMethod,
      paidAt: payment.paidAt,
      transactionRef: payment.transactionRef,
      invoiceNumber: payment.invoiceNumber,
    });
  };

  const pendingInvoices = invoices.filter(i => i.balancePaise > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
              Payments & Razorpay Gateway Ledger
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Server-side order creation, HMAC-SHA256 signature verification, and idempotent fee ledger realization
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Test Mode Ready
          </span>
          {pendingInvoices.length > 0 && (
            <Button
              size="sm"
              variant="gradient"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setSelectedInvoice(pendingInvoices[0])}
            >
              Settle Fee via Razorpay
            </Button>
          )}
        </div>
      </div>

      {/* Pending Invoices for Quick Collection */}
      {pendingInvoices.length > 0 && (
        <div className="glass-card p-5 space-y-3 border-amber-500/30 bg-amber-950/10">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-amber-400" />
            Outstanding Invoices Awaiting Settlement ({pendingInvoices.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {pendingInvoices.slice(0, 3).map(inv => (
              <div
                key={inv.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-white block">{inv.studentName}</span>
                  <span className="text-[11px] text-slate-400">{inv.invoiceNumber}</span>
                  <span className="text-amber-400 font-bold block mt-1">
                    Balance: {formatPaiseToINR(inv.balancePaise)}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="gradient"
                  onClick={() => handleOpenPayModal(inv)}
                >
                  Collect
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Transactions Ledger */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Transaction History
            </h3>
            <p className="text-xs text-slate-400">All cryptographically verified payments</p>
          </div>
          <span className="text-xs text-slate-400">{payments.length} Transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 uppercase text-[10px] text-slate-400 border-b border-white/10">
              <tr>
                <th className="p-3">Receipt #</th>
                <th className="p-3">Scholar</th>
                <th className="p-3">Invoice Ref</th>
                <th className="p-3">Amount Realized</th>
                <th className="p-3">Method</th>
                <th className="p-3">Gateway Ref</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3 text-right">Receipt PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.map(pay => (
                <tr key={pay.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-white">{pay.receiptNumber}</td>
                  <td className="p-3 font-bold text-white">{pay.studentName}</td>
                  <td className="p-3 font-mono text-slate-400">{pay.invoiceNumber || 'INV-2026'}</td>
                  <td className="p-3 font-bold text-emerald-400">
                    {formatPaiseToINR(pay.amountPaise)}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-white/10 text-slate-300">
                      {pay.paymentMethod}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-400 truncate max-w-[140px]">
                    {pay.transactionRef || 'Direct'}
                  </td>
                  <td className="p-3 text-slate-400">
                    {new Date(pay.paidAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDownloadReceipt(pay)}
                      title="Download PDF Receipt"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Razorpay Payment Checkout Modal */}
      <PaymentCheckoutModal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
        onSuccess={() => {
          setSelectedInvoice(null);
          fetchData();
        }}
      />
    </div>
  );
};
