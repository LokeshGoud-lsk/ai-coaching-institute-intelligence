import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  Plus,
  CreditCard,
  Calendar,
  Clock,
  Layers,
  ChevronRight,
  FileCheck,
} from 'lucide-react';
import { api } from '../lib/api';
import { FeePlan, Invoice, Student, Course } from '../types';
import { Button } from '../components/common/Button';
import { InvoiceStatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { formatPaiseToINR, rupeesToPaise } from '../lib/feeCalculations';

export const FeePlansPage: React.FC = () => {
  const [plans, setPlans] = useState<FeePlan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Invoice Modal
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    studentId: '',
    subtotalRupees: '90000',
    discountRupees: '0',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    description: 'Term 2 Academic Coaching & Study Kit',
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [plansRes, invoicesRes, studentsRes] = await Promise.all([
        api.getFeePlans(),
        api.getInvoices(),
        api.getStudents({ limit: 100 }),
      ]);
      setPlans(plansRes);
      setInvoices(invoicesRes);
      setStudents(studentsRes.data);
    } catch (err) {
      console.error('Failed to load fee plans and invoices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.studentId) return;

    try {
      const subtotalPaise = rupeesToPaise(newInvoice.subtotalRupees);
      const discountPaise = rupeesToPaise(newInvoice.discountRupees);

      await api.createInvoice({
        studentId: newInvoice.studentId,
        subtotalPaise,
        discountPaise,
        dueDate: newInvoice.dueDate,
        lineItems: [
          {
            id: `li-${Date.now()}`,
            description: newInvoice.description,
            amountPaise: subtotalPaise - discountPaise,
            quantity: 1,
          },
        ],
      });

      setIsAddInvoiceOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to issue invoice:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            Fee Plans & Institutional Invoices
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Deterministic integer-paise financial structures, installment schedules, and billing ledgers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="gradient"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddInvoiceOpen(true)}
          >
            Issue New Invoice
          </Button>
        </div>
      </div>

      {/* Standard Fee Packages Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-400" />
          Active Course Fee Plans
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className="glass-card p-5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-base">{plan.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-semibold">
                    {plan.installments} Installment{plan.installments > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{plan.courseName}</p>
                <div className="mt-3 text-2xl font-black text-electric-cyan font-heading">
                  {formatPaiseToINR(plan.totalPaise)}
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{plan.description}</p>
              </div>

              <div className="pt-3 border-t border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Per Installment:</span>
                <strong className="text-white">
                  {formatPaiseToINR(Math.round(plan.totalPaise / plan.installments))}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices Ledger Table */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              Institutional Invoices Ledger
            </h3>
            <p className="text-xs text-slate-400">All issued fee obligations with balances</p>
          </div>
          <span className="text-xs text-slate-400">{invoices.length} Invoices</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 uppercase text-[10px] text-slate-400 border-b border-white/10">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Scholar</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Paid Amount</th>
                <th className="p-3">Balance Remaining</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                  <td className="p-3">
                    <span className="font-bold text-white block">{inv.studentName}</span>
                    <span className="text-[10px] text-slate-400">{inv.studentCode}</span>
                  </td>
                  <td className="p-3 font-semibold text-slate-200">
                    {formatPaiseToINR(inv.totalPaise)}
                  </td>
                  <td className="p-3 font-semibold text-emerald-400">
                    {formatPaiseToINR(inv.paidPaise)}
                  </td>
                  <td className="p-3 font-bold">
                    {inv.balancePaise > 0 ? (
                      <span className="text-amber-400">{formatPaiseToINR(inv.balancePaise)}</span>
                    ) : (
                      <span className="text-emerald-400">Cleared</span>
                    )}
                  </td>
                  <td className="p-3 text-slate-400">{inv.dueDate}</td>
                  <td className="p-3">
                    <InvoiceStatusBadge status={inv.status} />
                  </td>
                  <td className="p-3 text-right">
                    <Link to="/fees/payments">
                      <Button variant="outline" size="sm">
                        Pay / Settle
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Invoice Modal */}
      <Modal
        isOpen={isAddInvoiceOpen}
        onClose={() => setIsAddInvoiceOpen(false)}
        title="Issue Institutional Invoice"
        subtitle="Generate an auditable fee charge with specified due date and line items"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select Scholar</label>
            <select
              required
              value={newInvoice.studentId}
              onChange={e => setNewInvoice({ ...newInvoice, studentId: e.target.value })}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select Enrolled Student</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.studentCode} - {s.batchName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Gross Subtotal (₹)</label>
              <input
                type="number"
                required
                value={newInvoice.subtotalRupees}
                onChange={e => setNewInvoice({ ...newInvoice, subtotalRupees: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Scholarship Discount (₹)</label>
              <input
                type="number"
                value={newInvoice.discountRupees}
                onChange={e => setNewInvoice({ ...newInvoice, discountRupees: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Due Date</label>
            <input
              type="date"
              required
              value={newInvoice.dueDate}
              onChange={e => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Line Item Description</label>
            <input
              type="text"
              value={newInvoice.description}
              onChange={e => setNewInvoice({ ...newInvoice, description: e.target.value })}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="outline" type="button" onClick={() => setIsAddInvoiceOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" type="submit">
              Issue Invoice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
