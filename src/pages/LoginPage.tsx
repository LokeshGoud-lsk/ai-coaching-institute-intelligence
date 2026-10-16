import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Shield,
  ArrowRight,
  Sparkles,
  Database,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Check,
  Server,
  Lock,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { api } from '../lib/api';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@apexacademy.edu.in');
  const [password, setPassword] = useState('ApexSecureDemo2026!');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Database Connection State
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    message: string;
    provider: string;
    databaseUrlConfigured: boolean;
    totalUsers: number;
    institutesCount: number;
    latencyMs: number;
    activeInstituteName: string;
  } | null>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [customDbUrl, setCustomDbUrl] = useState('');
  const [isConnectingDb, setIsConnectingDb] = useState(false);
  const [dbActionMsg, setDbActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const demoPersonas: { role: UserRole; name: string; email: string; label: string }[] = [
    {
      role: 'ADMIN',
      name: 'Dr. Vikram Malhotra',
      email: 'admin@apexacademy.edu.in',
      label: 'Institute Administrator',
    },
    {
      role: 'FACULTY',
      name: 'Prof. Ananya Sen',
      email: 'faculty@apexacademy.edu.in',
      label: 'Senior Physics Faculty',
    },
    {
      role: 'ACCOUNTANT',
      name: 'Ramesh Kulkarni',
      email: 'accounts@apexacademy.edu.in',
      label: 'Financial Controller',
    },
    {
      role: 'VIEWER',
      name: 'Divya Nair',
      email: 'viewer@apexacademy.edu.in',
      label: 'Read-only Auditor',
    },
  ];

  const fetchDatabaseStatus = async () => {
    try {
      const status = await api.getDatabaseStatus();
      setDbStatus(status);
    } catch (e) {
      console.warn('Failed to fetch database status:', e);
    }
  };

  useEffect(() => {
    fetchDatabaseStatus();
  }, []);

  const handlePersonaSelect = (persona: typeof demoPersonas[0]) => {
    setEmail(persona.email);
    setSelectedRole(persona.role);
    setPassword('ApexSecureDemo2026!');
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.login(email, password, selectedRole);
      localStorage.setItem('edutrack_auth_token', res.token);
      localStorage.setItem('edutrack_current_role', res.user.role);

      const dbLabel = res.database?.authenticatedViaPostgres
        ? 'Authenticated via PostgreSQL (Prisma ORM)'
        : 'Authenticated via Persistent Store';
      setSuccessMsg(`${dbLabel}. Entering intelligence console...`);

      setTimeout(() => {
        navigate('/dashboard');
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
      setIsLoading(false);
    }
  };

  const handleConnectCustomDb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDbUrl.trim()) return;

    setIsConnectingDb(true);
    setDbActionMsg(null);

    try {
      const res = await api.connectDatabase(customDbUrl.trim());
      if (res.connected) {
        setDbActionMsg({
          type: 'success',
          text: 'Successfully connected to PostgreSQL database! Prisma client is live.',
        });
        fetchDatabaseStatus();
      } else {
        setDbActionMsg({
          type: 'error',
          text: res.message || 'Failed to verify database connection.',
        });
      }
    } catch (err: any) {
      setDbActionMsg({
        type: 'error',
        text: err.message || 'Could not connect to database URL.',
      });
    } finally {
      setIsConnectingDb(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 to-electric-cyan flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white font-heading">
            EduTrack<span className="text-electric-cyan font-light">.AI</span>
          </span>
        </Link>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-white font-heading">
          Coaching Intelligence Authentication
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Sign in to access your institutional performance & fee portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="glass-card p-6 sm:p-8 border-white/10 shadow-2xl space-y-5">
          {/* Live Database Connectivity Pill */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  dbStatus?.connected
                    ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : 'bg-cyan-400'
                }`}
              />
              <span className="text-slate-300 font-semibold flex items-center gap-1.5 text-[11px]">
                <Database className="w-3.5 h-3.5 text-slate-400" />
                {dbStatus?.connected
                  ? `DB: PostgreSQL Connected (${dbStatus.latencyMs}ms)`
                  : 'DB: Persistent Store Active'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsDbModalOpen(true)}
              className="text-[11px] text-electric-cyan hover:underline font-semibold flex items-center gap-1"
            >
              DB Details
            </button>
          </div>

          {/* Quick Demo Role Buttons */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Quick Login Demo Personas</span>
              <span className="text-electric-cyan flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> One-Click Fill
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {demoPersonas.map(persona => (
                <button
                  key={persona.role}
                  type="button"
                  onClick={() => handlePersonaSelect(persona)}
                  className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                    selectedRole === persona.role && email === persona.email
                      ? 'bg-brand-600/30 border-brand-500 text-white shadow-sm ring-1 ring-brand-500'
                      : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800/60 hover:border-white/15'
                  }`}
                >
                  <div className="font-bold truncate">{persona.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{persona.label}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Official Institutional Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@apexacademy.edu.in"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <Link
                  to="/auth/forgot-password"
                  className="text-xs text-electric-cyan hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
              />
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Authenticate & Enter Console
            </Button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/5">
            Onboarding a new institution?{' '}
            <Link to="/auth/register" className="text-electric-cyan font-semibold hover:underline">
              Register Institute
            </Link>
          </div>
        </div>
      </div>

      {/* Database Connection & Architecture Diagnostic Modal */}
      <Modal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        title="Database Architecture & Status"
        subtitle="PostgreSQL via Prisma ORM & Resilient Zero-Downtime Store"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          {/* Status Overview Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Connection State:</span>
              <span
                className={`font-semibold px-2.5 py-0.5 rounded-full text-[11px] ${
                  dbStatus?.connected
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                {dbStatus?.connected ? 'PostgreSQL Live (Connected)' : 'Persistent Store Engine (Standby)'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Active ORM Provider:</span>
              <span className="font-semibold text-white">{dbStatus?.provider || 'PostgreSQL (Prisma)'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Query Latency:</span>
              <span className="font-semibold text-emerald-400">{dbStatus?.latencyMs || 0} ms</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Users in Database:</span>
              <span className="font-semibold text-white">{dbStatus?.totalUsers || 0} Profiles</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Active Tenant:</span>
              <span className="font-semibold text-white">{dbStatus?.activeInstituteName || 'Apex Academy'}</span>
            </div>
          </div>

          {/* Connect Custom Database Form */}
          <form onSubmit={handleConnectCustomDb} className="space-y-3 pt-2">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Connect Custom PostgreSQL / Supabase Database URL:
              </label>
              <input
                type="text"
                placeholder="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres?sslmode=require"
                value={customDbUrl}
                onChange={e => setCustomDbUrl(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                You can also configure <code className="text-electric-cyan font-mono">DATABASE_URL</code> in your Vercel Dashboard or <code className="text-electric-cyan font-mono">.env</code> file.
              </p>
            </div>

            {dbActionMsg && (
              <div
                className={`p-2.5 rounded-lg text-xs ${
                  dbActionMsg.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/60 border border-rose-500/30 text-rose-300'
                }`}
              >
                {dbActionMsg.text}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={fetchDatabaseStatus}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Refresh Ping
              </Button>
              <Button
                variant="gradient"
                size="sm"
                type="submit"
                isLoading={isConnectingDb}
                leftIcon={<Database className="w-3.5 h-3.5" />}
              >
                Verify & Connect
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
