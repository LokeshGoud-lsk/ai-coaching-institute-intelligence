import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
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
          Password Recovery
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter your registered institutional email to receive a secure recovery token
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="glass-card p-6 sm:p-8 border-white/10 shadow-2xl space-y-4">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base">Reset Instructions Dispatched</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                If an institutional record exists for <strong className="text-white">{email}</strong>, you will receive a secure password reset link via Supabase Auth.
              </p>
              <Link to="/auth/login" className="inline-block mt-4">
                <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Institutional Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@apexacademy.edu.in"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                isLoading={isLoading}
              >
                Send Recovery Instructions
              </Button>

              <div className="text-center pt-3 border-t border-white/5">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
