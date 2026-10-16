import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  FileText,
  CalendarCheck,
  CreditCard,
  AlertTriangle,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { generatePDFReport } from '../lib/pdfGenerator';
import { exportToCSV } from '../lib/utils';
import { api } from '../lib/api';

export const ReportsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('progress');
  const [isExporting, setIsExporting] = useState(false);

  const reportTypes = [
    {
      id: 'progress',
      title: 'Comprehensive Scholar Progress Report',
      desc: 'Individual test trajectories, attendance rates, and risk indices across all batches.',
      icon: GraduationCap,
      color: 'text-brand-400',
    },
    {
      id: 'attendance',
      title: 'Monthly Attendance & Stability Register',
      desc: 'Session attendance percentages, unexcused streaks, and threshold compliance.',
      icon: CalendarCheck,
      color: 'text-emerald-400',
    },
    {
      id: 'early_warning',
      title: 'Early Warning Audit & Intervention Log',
      desc: 'Evidence breakdown for flagged students, assigned mentors, and review history.',
      icon: AlertTriangle,
      color: 'text-rose-400',
    },
    {
      id: 'fee_collection',
      title: 'Fee Realization & Payments Reconciliation',
      desc: 'Completed transaction ledger, payment methods, and Razorpay gateway IDs.',
      icon: CreditCard,
      color: 'text-electric-cyan',
    },
    {
      id: 'outstanding',
      title: 'Overdue Arrears & Aging Defaulters Report',
      desc: 'Arrears aging brackets (1-30, 31-60, 60+ days) and pending installment balances.',
      icon: FileSpreadsheet,
      color: 'text-amber-400',
    },
  ];

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const [studentsRes, invoicesRes, paymentsRes, alertsRes] = await Promise.all([
        api.getStudents({ limit: 100 }),
        api.getInvoices(),
        api.getPaymentHistory(),
        api.getEarlyWarningAlerts(),
      ]);

      if (selectedReport === 'progress') {
        generatePDFReport({
          title: 'Comprehensive Scholar Academic Performance Register',
          subtitle: 'Official Academic Progression Audit — Class of 2026/2027',
          headers: ['Roll Code', 'Scholar Name', 'Batch', 'Attendance', 'Score', 'Risk Tier'],
          rows: studentsRes.data.map(s => [
            s.studentCode,
            s.fullName,
            s.batchName || '',
            `${s.attendancePercentage}%`,
            s.latestScore ? `${s.latestScore}%` : 'N/A',
            s.riskCategory || 'LOW',
          ]),
          summaryNotes: [
            `Total active enrolled scholars evaluated: ${studentsRes.data.length}`,
            `Scholars maintaining 75%+ attendance: ${studentsRes.data.filter(s => (s.attendancePercentage || 0) >= 75).length}`,
            `Scholars requiring academic tutoring: ${alertsRes.filter(a => a.riskCategory === 'HIGH').length}`,
          ],
        });
      } else if (selectedReport === 'fee_collection') {
        generatePDFReport({
          title: 'Fee Realization & Reconciliation Ledger',
          subtitle: 'Audited Financial Transactions — Razorpay & Gateway Reconciled',
          headers: ['Receipt #', 'Scholar Name', 'Amount (INR)', 'Method', 'Gateway Ref', 'Timestamp'],
          rows: paymentsRes.map(p => [
            p.receiptNumber,
            p.studentName || 'Scholar',
            `₹${(p.amountPaise / 100).toLocaleString('en-IN')}`,
            p.paymentMethod,
            p.transactionRef || 'Direct',
            new Date(p.paidAt).toLocaleDateString('en-IN'),
          ]),
          summaryNotes: [
            `Total payments verified: ${paymentsRes.length}`,
            `Gross realization to date: ₹${(paymentsRes.reduce((sum, p) => sum + p.amountPaise, 0) / 100).toLocaleString('en-IN')}`,
          ],
        });
      } else if (selectedReport === 'early_warning') {
        generatePDFReport({
          title: 'Early Warning Intelligence & Intervention Audit Report',
          subtitle: 'Multi-Signal Risk Diagnostic Roster for Educator Consultation',
          headers: ['Roll Code', 'Scholar', 'Batch', 'Risk Score', 'Tier', 'Assigned Mentor'],
          rows: alertsRes.map(a => [
            a.studentCode,
            a.studentName,
            a.batchName,
            `${a.riskScore}/100`,
            a.riskCategory,
            a.assignedFacultyName || 'Dean',
          ]),
          summaryNotes: [
            `Total students flagged for review: ${alertsRes.length}`,
            `Critical High Risk tier cases: ${alertsRes.filter(a => a.riskCategory === 'HIGH').length}`,
            'All risk recommendations are explainable indicators and require educator consultation.',
          ],
        });
      } else {
        generatePDFReport({
          title: 'Overdue Arrears & Defaulters Ledger',
          subtitle: 'Institutional Arrears Aging & Balance Analysis',
          headers: ['Invoice #', 'Scholar', 'Balance Due (INR)', 'Due Date', 'Status'],
          rows: invoicesRes.filter(i => i.balancePaise > 0).map(i => [
            i.invoiceNumber,
            i.studentName || '',
            `₹${(i.balancePaise / 100).toLocaleString('en-IN')}`,
            i.dueDate,
            i.status,
          ]),
        });
      }
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const [studentsRes, invoicesRes, paymentsRes] = await Promise.all([
        api.getStudents({ limit: 100 }),
        api.getInvoices(),
        api.getPaymentHistory(),
      ]);

      if (selectedReport === 'fee_collection') {
        const headers = ['Receipt', 'Student Name', 'Amount (INR)', 'Method', 'Date', 'Transaction Ref'];
        const rows = paymentsRes.map(p => [
          p.receiptNumber,
          p.studentName || '',
          (p.amountPaise / 100).toFixed(2),
          p.paymentMethod,
          p.paidAt,
          p.transactionRef || '',
        ]);
        exportToCSV('Fee_Collection_Reconciliation', headers, rows);
      } else {
        const headers = ['Student ID', 'Full Name', 'Batch', 'Attendance %', 'Latest Score %', 'Risk Tier', 'Balance (INR)'];
        const rows = studentsRes.data.map(s => [
          s.studentCode,
          s.fullName,
          s.batchName || '',
          s.attendancePercentage || 0,
          s.latestScore || 0,
          s.riskCategory || 'LOW',
          ((s.balanceFeePaise || 0) / 100).toFixed(2),
        ]);
        exportToCSV('Apex_Academy_Progress_Report', headers, rows);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            Institutional Reports & Formal Audits
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate printable PDF transcripts and raw CSV spreadsheets with institutional branding
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            isLoading={isExporting}
            onClick={handleExportCSV}
          >
            Export Raw CSV
          </Button>
          <Button
            variant="gradient"
            size="sm"
            leftIcon={<Printer className="w-4 h-4" />}
            isLoading={isExporting}
            onClick={handleExportPDF}
          >
            Download Official PDF
          </Button>
        </div>
      </div>

      {/* Report Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map(report => {
          const Icon = report.icon;
          const isSelected = selectedReport === report.id;
          return (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`glass-card p-5 cursor-pointer transition-all space-y-3 border ${
                isSelected
                  ? 'border-brand-500 bg-brand-600/15 shadow-glow'
                  : 'border-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center ${report.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isSelected && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500 text-white">
                    Selected
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-white text-sm">{report.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{report.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Export Preview Callout */}
      <div className="glass-card p-6 border-brand-500/30 bg-gradient-to-r from-brand-950/20 to-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">Ready for Official Audit & Board Meeting Review</h4>
          <p className="text-xs text-slate-400">
            Click &quot;Download Official PDF&quot; above to render the selected audit document with header bars, pagination, and cryptographic verification notes.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="gradient" size="sm" onClick={handleExportPDF} isLoading={isExporting}>
            Generate PDF Report Now
          </Button>
        </div>
      </div>
    </div>
  );
};
