import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { RiskBadge } from '../common/Badge';
import { EarlyWarningAlert, AlertStatus, Faculty } from '../../types';
import { AlertTriangle, CheckCircle, UserCheck, ShieldAlert, FileText, ArrowDownRight } from 'lucide-react';

interface RiskEvidenceModalProps {
  alert: EarlyWarningAlert | null;
  isOpen: boolean;
  onClose: () => void;
  facultyList: Faculty[];
  onSaveReview: (alertId: string, status: AlertStatus, notes: string, assignedFacultyId?: string) => Promise<void>;
}

export const RiskEvidenceModal: React.FC<RiskEvidenceModalProps> = ({
  alert,
  isOpen,
  onClose,
  facultyList,
  onSaveReview,
}) => {
  if (!alert) return null;

  const [status, setStatus] = useState<AlertStatus>(alert.status);
  const [assignedFacultyId, setAssignedFacultyId] = useState<string>(alert.assignedFacultyId || (facultyList[0]?.id || ''));
  const [notes, setNotes] = useState<string>(alert.reviewNotes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveReview(alert.id, status, notes, assignedFacultyId);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Early Warning Intelligence Audit & Evidence"
      subtitle={`Explainable risk diagnostics for ${alert.studentName} (${alert.studentCode})`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Risk Score Banner */}
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-300">Deterministic Risk Assessment:</span>
                <RiskBadge category={alert.riskCategory} score={alert.riskScore} />
              </div>
              <p className="text-xs text-slate-400 mt-1">Batch: {alert.batchName}</p>
            </div>
          </div>
          <div className="text-right sm:border-l sm:border-rose-500/20 sm:pl-4">
            <div className="text-xs text-slate-400">Calculated Score</div>
            <div className="text-2xl font-black text-rose-400">{alert.riskScore}/100</div>
          </div>
        </div>

        {/* Contributing Factors & Factual Evidence */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Primary Contributing Evidence Signals
          </h4>
          <div className="space-y-2">
            {alert.primaryFactors.map((factor, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-900/60 border border-white/5 text-sm text-slate-200 flex items-start gap-2.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span>{factor}</span>
              </div>
            ))}
          </div>

          {/* Factual Data Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-xs text-slate-400 block">Attendance Rate</span>
              <span className="text-lg font-bold text-white mt-1 block">
                {alert.evidenceData.attendancePct}%
              </span>
              <span className="text-[10px] text-rose-400">Threshold: 75%</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-xs text-slate-400 block">Latest Score</span>
              <span className="text-lg font-bold text-white mt-1 block">
                {alert.evidenceData.latestScore !== undefined ? `${alert.evidenceData.latestScore}%` : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-400">
                Prev: {alert.evidenceData.prevScore !== undefined ? `${alert.evidenceData.prevScore}%` : 'N/A'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-xs text-slate-400 block">Score Drop</span>
              <span className="text-lg font-bold text-rose-400 mt-1 flex items-center gap-1">
                {alert.evidenceData.scoreDeclinePct ? (
                  <>
                    <ArrowDownRight className="w-4 h-4" />
                    -{alert.evidenceData.scoreDeclinePct}%
                  </>
                ) : (
                  'None'
                )}
              </span>
              <span className="text-[10px] text-slate-400">Decline trigger: 15%</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-xs text-slate-400 block">Consecutive Absences</span>
              <span className="text-lg font-bold text-amber-400 mt-1 block">
                {alert.evidenceData.repeatedAbsences || 0}
              </span>
              <span className="text-[10px] text-slate-400">Recent Sessions</span>
            </div>
          </div>
        </div>

        {/* Recommended Intervention Strategy */}
        <div className="p-4 rounded-xl bg-brand-950/20 border border-brand-500/20 space-y-1.5">
          <h5 className="text-xs font-semibold text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-brand-400" />
            Recommended Pedagogical Intervention
          </h5>
          <p className="text-sm text-slate-300 leading-relaxed">{alert.recommendedAction}</p>
          <p className="text-[11px] text-slate-400 italic pt-1">
            * This indicator is designed for supportive academic intervention and mentoring. It does not penalize students or restrict enrollment.
          </p>
        </div>

        {/* Educator Intervention Action & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              Assigned Faculty Mentor
            </label>
            <select
              value={assignedFacultyId}
              onChange={e => setAssignedFacultyId(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {facultyList.map(f => (
                <option key={f.id} value={f.id}>
                  {f.fullName} ({f.specialization.split('&')[0]})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Follow-up Review Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as AlertStatus)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="PENDING">Pending Initial Review</option>
              <option value="UNDER_REVIEW">Under Active Review</option>
              <option value="INTERVENTION_SCHEDULED">Intervention / 1-on-1 Scheduled</option>
              <option value="RESOLVED">Resolved (Student Stabilized)</option>
              <option value="DISMISSED">Dismissed with Justification</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Intervention & Consultation Notes (Recorded in Audit Trail)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Document parent meeting outcomes, remedial tutorial plan, or medical leave notes..."
            className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gradient" type="submit" isLoading={isSubmitting}>
            Save Review & Update Trail
          </Button>
        </div>
      </form>
    </Modal>
  );
};
