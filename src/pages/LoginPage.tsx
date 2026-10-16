import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Shield, ArrowRight, UserCheck, KeyRound, Sparkles } from 'lucide-react';
import { Button } from '../components/common/Button';
import { api } from '../lib/api';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@apexacademy.edu.in');
  const [password, setPassword] = useState('ApexSecureDemo2026!');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handlePersonaSelect = (persona: typeof demoPersonas[0]) => {
    setEmail(persona.email);
    setSelectedRole(persona.role);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.login(email, selectedRole);
      localStorage.setItem('edutrack_auth_token', res.token);
      localStorage.setItem('edutrack_current_role', res.user.role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
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
        <div className="glass-card p-6 sm:p-8 border-white/10 shadow-2xl space-y-6">
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
                      ? 'bg-brand-600/30 border-brand-500 text-white shadow-sm'
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
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
              {error}
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
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
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
    </div>
  );
};
