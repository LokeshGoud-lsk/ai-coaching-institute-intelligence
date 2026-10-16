import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  Play,
  CheckCircle,
  Clock,
  Filter,
  UserCheck,
  Eye,
  FileText,
  Sparkles,
} from 'lucide-react';
import { api } from '../lib/api';
import { EarlyWarningAlert, Faculty, AlertStatus } from '../types';
import { Button } from '../components/common/Button';
import { RiskBadge } from '../components/common/Badge';
import { RiskEvidenceModal } from '../components/earlyWarning/RiskEvidenceModal';

export const EarlyWarningPage: React.FC = () => {
  const [alerts, setAlerts] = useState<EarlyWarningAlert[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [activeModalAlert, setActiveModalAlert] = useState<EarlyWarningAlert | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [alertsRes, facultyRes] = await Promise.all([
        api.getEarlyWarningAlerts({
          category: selectedCategory || undefined,
          status: selectedStatus || undefined,
        }),
        api.getFaculty(),
      ]);
      setAlerts(alertsRes);
      setFaculty(facultyRes);
    } catch (err) {
      console.error('Failed to load early warning alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedStatus]);

  const handleRunEvaluation = async () => {
    setIsEvaluating(true);
    try {
      await api.evaluateAllRisks();
      await fetchData();
    } catch (err) {
      console.error('Evaluation run failed:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveReview = async (
    alertId: string,
    status: AlertStatus,
    notes: string,
    assignedFacultyId?: string
  ) => {
    await api.reviewAlert(alertId, {
      status,
      reviewNotes: notes,
      assignedFacultyId,
    });
    fetchData();
  };

  const highCount = alerts.filter(a => a.riskCategory === 'HIGH').length;
  const mediumCount = alerts.filter(a => a.riskCategory === 'MEDIUM').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-rose-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
              Early Warning Intelligence Console
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explainable, deterministic multi-signal risk detection for proactive pedagogical intervention
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="gradient"
            size="sm"
            leftIcon={<Play className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />}
            isLoading={isEvaluating}
            onClick={handleRunEvaluation}
          >
            Execute Engine Evaluation
          </Button>
        </div>
      </div>

      {/* Summary Vitals Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 border-rose-500/30 bg-rose-950/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-300 uppercase tracking-wider block">
              High Risk Scholars
            </span>
            <span className="text-2xl font-black text-rose-400 font-heading mt-1 block">
              {highCount} Flagged
            </span>
            <span className="text-[11px] text-slate-400">Score &gt; 70 (Urgent review)</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold">
            !
          </div>
        </div>

        <div className="glass-card p-4 border-amber-500/30 bg-amber-950/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
              Medium Risk Scholars
            </span>
            <span className="text-2xl font-black text-amber-400 font-heading mt-1 block">
              {mediumCount} Monitored
            </span>
            <span className="text-[11px] text-slate-400">Score 40-69 (Variance noted)</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            ~
          </div>
        </div>

        <div className="glass-card p-4 border-electric-cyan/30 bg-slate-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-electric-cyan uppercase tracking-wider block">
              Evaluation Model
            </span>
            <span className="text-lg font-bold text-white mt-1 block">Deterministic v2.4</span>
            <span className="text-[11px] text-slate-400">Multi-Signal Correlated Filter</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <Filter className="w-3.5 h-3.5 text-brand-400" />
            <span>Filter Alerts:</span>
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Risk Tiers</option>
            <option value="HIGH">High Risk Tier</option>
            <option value="MEDIUM">Medium Risk Tier</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Workflow Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="INTERVENTION_SCHEDULED">Intervention Scheduled</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Showing <strong className="text-white">{alerts.length}</strong> Active Early-Warning Flags
        </div>
      </div>

      {/* Flagged Alerts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-2 p-12 text-center text-slate-400 glass-card">
            Scanning institutional signals...
          </div>
        ) : alerts.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-400 glass-card">
            No early-warning alerts currently open. All scholars are performing within configured thresholds.
          </div>
        ) : (
          alerts.map(alert => (
            <div
              key={alert.id}
              className={`glass-card p-5 space-y-4 border transition-all ${
                alert.riskCategory === 'HIGH'
                  ? 'border-rose-500/30 hover:border-rose-500/50'
                  : 'border-amber-500/30 hover:border-amber-500/50'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {alert.studentName}
                    </h3>
                    <RiskBadge category={alert.riskCategory} score={alert.riskScore} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {alert.studentCode} | {alert.batchName}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block">Status</span>
                  <span
                    className={`text-xs font-bold ${
                      alert.status === 'RESOLVED'
                        ? 'text-emerald-400'
                        : alert.status === 'UNDER_REVIEW'
                        ? 'text-amber-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {alert.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Evidence Factor List */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Identified Contributing Signals:
                </span>
                {alert.primaryFactors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 text-xs text-slate-200 flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>

              {/* Recommended Action */}
              <div className="p-3 rounded-xl bg-brand-950/20 border border-brand-500/20 text-xs text-slate-300 space-y-1">
                <strong className="text-brand-300 block">Recommended Intervention:</strong>
                <p>{alert.recommendedAction}</p>
              </div>

              {/* Assignment & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/10 text-xs">
                <div>
                  <span className="text-slate-400">Assigned Mentor:</span>{' '}
                  <strong className="text-white font-medium">
                    {alert.assignedFacultyName || 'Unassigned'}
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/students/${alert.studentId}`}>
                    <Button variant="ghost" size="sm">
                      Dossier
                    </Button>
                  </Link>
                  <Button
                    variant="gradient"
                    size="sm"
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => setActiveModalAlert(alert)}
                  >
                    Audit & Review
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Early Warning Review Modal */}
      <RiskEvidenceModal
        alert={activeModalAlert}
        isOpen={Boolean(activeModalAlert)}
        onClose={() => setActiveModalAlert(null)}
        facultyList={faculty}
        onSaveReview={handleSaveReview}
      />
    </div>
  );
};
