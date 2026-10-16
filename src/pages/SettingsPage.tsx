import React, { useEffect, useState } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, Key, Database, Building2 } from 'lucide-react';
import { api } from '../lib/api';
import { Institute } from '../types';
import { Button } from '../components/common/Button';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<{
    institute: Institute;
    razorpayConfigured: boolean;
    geminiConfigured: boolean;
    databaseProvider: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    minAttendance: 75,
    scoreDeclinePct: 15,
    contactEmail: '',
    contactPhone: '',
    address: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getSettings();
        setSettings(res);
        setFormData({
          name: res.institute.name,
          minAttendance: res.institute.minAttendance,
          scoreDeclinePct: res.institute.scoreDeclinePct,
          contactEmail: res.institute.contactEmail,
          contactPhone: res.institute.contactPhone || '',
          address: res.institute.address || '',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(false);
    try {
      await api.updateSettings(formData);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
          Institute Intelligence Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure algorithmic early-warning thresholds, institutional profile, and external service credentials
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Institutional configurations updated and applied to rule engines.</span>
        </div>
      )}

      {/* Integration Diagnostics Card */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
          <ShieldCheck className="w-4 h-4 text-electric-cyan" />
          Service Integrations & Backend Environment Diagnostics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-1">
            <span className="text-slate-400 block font-semibold">Database Engine</span>
            <span className="text-white font-bold block">{settings.databaseProvider}</span>
            <span className="text-[10px] text-emerald-400">Zero-downtime persistence active</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-1">
            <span className="text-slate-400 block font-semibold">Razorpay Payment Gateway</span>
            <span className="text-white font-bold block">
              {settings.razorpayConfigured ? 'Test Keys Active' : 'Demo Test Mode Active'}
            </span>
            <span className="text-[10px] text-emerald-400">HMAC-SHA256 signature verification enabled</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-1">
            <span className="text-slate-400 block font-semibold">Google Gemini GenAI SDK</span>
            <span className="text-white font-bold block">
              {settings.geminiConfigured ? 'Gemini 1.5 Flash Connected' : 'Grounded Engine Active'}
            </span>
            <span className="text-[10px] text-brand-300">Strict database grounding enforced</span>
          </div>
        </div>
      </div>

      {/* Institute Configuration Form */}
      <form onSubmit={handleSave} className="glass-card p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
            <Building2 className="w-4 h-4 text-brand-400" />
            Institutional Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Academy Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Official Contact Email</label>
              <input
                type="email"
                required
                value={formData.contactEmail}
                onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Early Warning Engine Configurable Thresholds */}
        <div className="pt-4 border-t border-white/10">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
            <Settings className="w-4 h-4 text-amber-400" />
            Early Warning Intelligence Threshold Parameters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Minimum Attendance Alert Threshold (%)
              </label>
              <input
                type="number"
                min="50"
                max="95"
                required
                value={formData.minAttendance}
                onChange={e => setFormData({ ...formData, minAttendance: parseFloat(e.target.value) })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Scholars falling below this attendance level are flagged in the risk calculation.
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Score Decline Sensitivity Trigger (%)
              </label>
              <input
                type="number"
                min="5"
                max="40"
                required
                value={formData.scoreDeclinePct}
                onChange={e => setFormData({ ...formData, scoreDeclinePct: parseFloat(e.target.value) })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Triggers an academic risk alert if consecutive test performance drops by this percentage.
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <Button variant="gradient" type="submit" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
            Save All Institutional Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
