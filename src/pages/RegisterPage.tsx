import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  ArrowRight,
  CheckCircle2,
  Database,
  ShieldCheck,
  AlertCircle,
  Lock,
  Mail,
  User,
  Phone,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { api } from '../lib/api';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [instituteName, setInstituteName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    message: string;
    savedToDatabase: boolean;
  } | null>(null);

  // Database Connection Status
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    provider: string;
    latencyMs: number;
  } | null>(null);

  useEffect(() => {
    api.getDatabaseStatus()
      .then(res => setDbStatus({
        connected: res.connected,
        provider: res.provider,
        latencyMs: res.latencyMs,
      }))
      .catch(err => console.warn('Database status check failed:', err));
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Password confirmation does not match.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.register({
        instituteName: instituteName.trim(),
        adminName: adminName.trim(),
        adminEmail: adminEmail.trim(),
        password: password,
        phoneNumber: phone.trim() || undefined,
      });

      localStorage.setItem('edutrack_auth_token', res.token);
      localStorage.setItem('edutrack_current_role', res.user.role);

      setSuccessInfo({
        message: res.message,
        savedToDatabase: Boolean(res.database?.savedToPostgres),
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check form details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 to-electric-cyan flex items-center justify-center text-white shadow-glow">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white font-heading">
            EduTrack<span className="text-electric-cyan font-light">.AI</span>
          </span>
        </Link>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-white font-heading">
          Register New Coaching Institute
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Provision institutional tenant, PostgreSQL database models, and administrator credentials
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="glass-card p-6 sm:p-8 border-white/10 shadow-2xl space-y-4">
          {/* Live Database Target Pill */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  dbStatus?.connected
                    ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : 'bg-cyan-400'
                }`}
              />
              <span className="text-slate-300 font-semibold text-[11px] flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-slate-400" />
                {dbStatus?.connected ? 'Target DB: PostgreSQL Ready' : 'Target DB: Persistent Store Ready'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {dbStatus?.connected ? `${dbStatus.latencyMs}ms ping` : 'Zero-Downtime'}
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successInfo ? (
            <div className="text-center py-6 space-y-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white font-heading">
                Institute Successfully Provisioned
              </h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                {successInfo.message}
              </p>
              <div className="text-[11px] text-emerald-400 font-semibold">
                Redirecting to intelligence dashboard...
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Institute / Academy Legal Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={instituteName}
                    onChange={e => setInstituteName(e.target.value)}
                    placeholder="e.g. Paramount IIT & Medical Academy"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Principal Administrator Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    placeholder="e.g. Dr. Ramesh Singhal"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Official Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    placeholder="admin@academy.in"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Contact Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Security Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-brand-950/20 border border-brand-500/20 text-[11px] text-slate-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-electric-cyan shrink-0 mt-0.5" />
                <span>
                  Passwords are securely salted & hashed with PBKDF2 (SHA-512) before persistence in database records.
                </span>
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Provision Institute in Database
              </Button>
            </form>
          )}

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/5">
            Already have an active institute account?{' '}
            <Link to="/auth/login" className="text-electric-cyan font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
