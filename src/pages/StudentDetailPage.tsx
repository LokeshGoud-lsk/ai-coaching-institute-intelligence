import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  GraduationCap,
  CreditCard,
  FileText,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Clock,
  ShieldAlert,
  Download,
} from 'lucide-react';
import { api } from '../lib/api';
import { Student, AttendanceRecord, Invoice, Payment } from '../types';
import { RiskBadge, AttendanceBadge, InvoiceStatusBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { formatPaiseToINR } from '../lib/feeCalculations';
import { generatePaymentReceiptPDF } from '../lib/pdfGenerator';
import { PaymentCheckoutModal } from '../components/payments/PaymentCheckoutModal';

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{
    student: Student;
    attendance: AttendanceRecord[];
    assessmentResults: any[];
    invoices: Invoice[];
    payments: Payment[];
    earlyWarningEvaluation: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiDraft, setAiDraft] = useState<{ subject: string; body: string } | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchStudent = async () => {
      try {
        setIsLoading(true);
        const res = await api.getStudentById(id);
        setData(res);
      } catch (err) {
        console.error('Failed to load student detail:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  const handleGenerateAIDraft = async () => {
    if (!id) return;
    try {
      const type = data?.student.riskCategory === 'HIGH' ? 'ATTENDANCE_DROP' : 'ACADEMIC_SUPPORT';
      const draft = await api.draftAIMessage(id, type);
      setAiDraft({ subject: draft.subject, body: draft.body });
    } catch (err) {
      console.error('Failed to generate draft:', err);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading comprehensive scholar dossier...</p>
        </div>
      </div>
    );
  }

  const { student, attendance, assessmentResults, invoices, payments, earlyWarningEvaluation } = data;

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/students">
            <button className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white font-heading">{student.fullName}</h1>
              <RiskBadge category={student.riskCategory || 'LOW'} score={student.riskScore} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Roll ID: <span className="text-slate-200 font-mono">{student.studentCode}</span> | Batch:{' '}
              <span className="text-slate-200">{student.batchName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="gradient"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            onClick={handleGenerateAIDraft}
          >
            Generate AI Parent Consultation Draft
          </Button>
        </div>
      </div>

      {/* AI Draft Box if generated */}
      {aiDraft && (
        <div className="p-5 rounded-2xl glass-card border-brand-500/40 bg-gradient-to-r from-brand-950/40 to-slate-900/80 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-electric-cyan" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                AI Generated Parent Consultation Draft (Requires Human Review)
              </h4>
            </div>
            <button
              onClick={() => setAiDraft(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 space-y-2 text-xs">
            <div className="font-bold text-slate-300">Subject: {aiDraft.subject}</div>
            <div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-sans">
              {aiDraft.body}
            </div>
          </div>
        </div>
      )}

      {/* Top Profile Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Personal & Guardian Details */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-white/10 pb-3">
            <User className="w-4 h-4 text-brand-400" />
            Scholar & Guardian Contact
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Email:</span>
              <span className="font-semibold text-white">{student.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Phone:</span>
              <span className="font-semibold text-white">{student.phone || '+91 98765 00000'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Enrolled Course:</span>
              <span className="font-semibold text-white">{student.courseName}</span>
            </div>
            <div className="pt-2 border-t border-white/5">
              <span className="text-slate-400 block mb-1">Guardian:</span>
              <span className="font-bold text-white block">
                {student.guardian?.name || 'Not Recorded'} ({student.guardian?.relationship || 'Guardian'})
              </span>
              <span className="text-slate-400 text-[11px] block mt-0.5">
                {student.guardian?.phone || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Academic & Attendance Performance */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-white/10 pb-3">
            <GraduationCap className="w-4 h-4 text-electric-cyan" />
            Performance & Attendance Vitals
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase block">Attendance Rate</span>
              <span
                className={`text-xl font-bold mt-1 block ${
                  (student.attendancePercentage || 0) < 75 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {student.attendancePercentage}%
              </span>
              <span className="text-[10px] text-slate-500">Min Threshold: 75%</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase block">Latest Test</span>
              <span className="text-xl font-bold text-white mt-1 block">
                {student.latestScore !== undefined ? `${student.latestScore}%` : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-400">
                Prev: {student.previousScore ? `${student.previousScore}%` : '—'}
              </span>
            </div>
          </div>

          {student.scoreChange !== undefined && student.scoreChange < -15 && (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs text-rose-300">
              Significant academic drop of {Math.abs(student.scoreChange)}% detected across consecutive examinations.
            </div>
          )}
        </div>

        {/* Card 3: Fee Ledger Overview */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-white/10 pb-3">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Financial & Fee Ledger
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Program Fee:</span>
              <span className="font-semibold text-white">{formatPaiseToINR(student.totalFeePaise)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Paid to Date:</span>
              <span className="font-semibold text-emerald-400">{formatPaiseToINR(student.paidFeePaise)}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-white/5 font-bold">
              <span className="text-slate-300">Outstanding Balance:</span>
              <span className={(student.balanceFeePaise || 0) > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                {formatPaiseToINR(student.balanceFeePaise)}
              </span>
            </div>
          </div>
          <Link to="/fees/payments">
            <Button variant="outline" size="sm" className="w-full mt-2">
              Collect / Settle via Razorpay
            </Button>
          </Link>
        </div>
      </div>

      {/* Early Warning Diagnostics Card (If flagged) */}
      {earlyWarningEvaluation && earlyWarningEvaluation.riskCategory !== 'LOW' && (
        <div className="glass-card p-5 border-rose-500/40 bg-rose-950/15 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Active Early-Warning Indicator Diagnostics
            </h3>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            {earlyWarningEvaluation.primaryFactors.map((f: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div className="pt-2 text-xs text-brand-300">
            <strong>Recommended Action:</strong> {earlyWarningEvaluation.recommendedAction}
          </div>
        </div>
      )}

      {/* Tabs: Attendance History & Examination Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance History */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-electric-cyan" />
              Recorded Attendance History
            </h3>
            <span className="text-xs text-slate-400">{attendance.length} Sessions Logged</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {attendance.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No attendance records logged.</p>
            ) : (
              attendance.slice(0, 10).map(rec => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs"
                >
                  <span className="text-slate-300 font-medium">{rec.date}</span>
                  <AttendanceBadge status={rec.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Assessment Marks History */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-electric-violet" />
              Assessment Marks & Grades
            </h3>
            <span className="text-xs text-slate-400">{assessmentResults.length} Tests</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {assessmentResults.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No assessment results recorded.</p>
            ) : (
              assessmentResults.map(res => (
                <div
                  key={res.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs"
                >
                  <div>
                    <span className="text-white font-bold block">{res.assessmentId}</span>
                    <span className="text-[10px] text-slate-400">
                      {res.isAbsent ? 'Absent from test' : `Score: ${res.marksObtained} Marks`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white">{res.percentage ? `${res.percentage}%` : 'ABSENT'}</span>
                    <span className="text-[10px] text-slate-400 block">Grade: {res.grade || '—'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Fee Ledger & Invoices Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoices */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Fee Invoices & Outstanding Due
            </h3>
            <span className="text-xs text-slate-400">{invoices.length} Invoices</span>
          </div>

          <div className="space-y-3">
            {invoices.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No fee invoices assigned.</p>
            ) : (
              invoices.map(inv => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-white text-sm">{inv.invoiceNumber}</span>
                      <span className="text-[10px] text-slate-400 block">Due Date: {inv.dueDate}</span>
                    </div>
                    <InvoiceStatusBadge status={inv.status} />
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Balance Due</span>
                      <span className="font-bold text-rose-400">{formatPaiseToINR(inv.balancePaise)}</span>
                    </div>

                    {inv.balancePaise > 0 && (
                      <Button
                        size="sm"
                        variant="gradient"
                        leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedInvoiceForPayment(inv)}
                      >
                        Pay via Razorpay
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payments History */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-400" />
              Verified Payment Receipts
            </h3>
            <span className="text-xs text-slate-400">{payments.length} Transactions</span>
          </div>

          <div className="space-y-3">
            {payments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No payments recorded yet.</p>
            ) : (
              payments.map(pay => (
                <div
                  key={pay.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-white block">{pay.receiptNumber}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(pay.paidAt).toLocaleDateString()} | {pay.paymentMethod}
                    </span>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <span className="font-bold text-emerald-400 block">{formatPaiseToINR(pay.amountPaise)}</span>
                      <span className="text-[9px] text-emerald-500/80 font-mono">VERIFIED</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        generatePaymentReceiptPDF({
                          receiptNumber: pay.receiptNumber,
                          studentName: student.fullName,
                          studentCode: student.studentCode,
                          amountPaise: pay.amountPaise,
                          paymentMethod: pay.paymentMethod,
                          paidAt: pay.paidAt,
                          transactionRef: pay.transactionRef,
                          invoiceNumber: pay.invoiceNumber,
                        })
                      }
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Payment Checkout Modal */}
      <PaymentCheckoutModal
        isOpen={Boolean(selectedInvoiceForPayment)}
        onClose={() => setSelectedInvoiceForPayment(null)}
        invoice={selectedInvoiceForPayment}
        onSuccess={() => {
          setSelectedInvoiceForPayment(null);
          if (id) {
            api.getStudentById(id).then(setData).catch(console.error);
          }
        }}
      />
    </div>
  );
};
