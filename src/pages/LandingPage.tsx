import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Shield,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Layers3,
  Bot,
  CheckCircle,
  ArrowRight,
  Calculator,
  Lock,
  ChevronRight,
  Building2,
  Users,
} from 'lucide-react';
import { Button } from '../components/common/Button';

export const LandingPage: React.FC = () => {
  // Interactive Fee Realization ROI Calculator
  const [scholarCount, setScholarCount] = useState(250);
  const [avgTuition, setAvgTuition] = useState(120000);

  const totalGrossAnnual = scholarCount * avgTuition;
  const estimatedUncollectedWithoutEduTrack = totalGrossAnnual * 0.14; // typically 14% uncollected/slippage
  const recoveredWithEduTrack = estimatedUncollectedWithoutEduTrack * 0.82; // 82% recovered through proactive aging alerts & Razorpay

  return (
    <div className="min-h-screen bg-background text-slate-100 selection:bg-brand-500 selection:text-white font-sans">
      {/* Top Navigation */}
      <nav className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-electric-cyan flex items-center justify-center text-white shadow-glow">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white font-heading">
                EduTrack<span className="text-electric-cyan font-light">.AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-semibold uppercase tracking-wider">
                Enterprise SaaS
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#early-warning" className="hover:text-white transition-colors">Early Warning</a>
            <a href="#fees" className="hover:text-white transition-colors">Fee Intelligence</a>
            <a href="#roi-calculator" className="hover:text-white transition-colors">ROI Calculator</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/auth/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="gradient" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Launch Platform
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Background Gradients & Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-brand-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[300px] bg-electric-cyan/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-white/10 text-xs font-semibold text-slate-300 mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-electric-cyan animate-pulse" />
            <span>Next-Generation AI Coaching Institute Infrastructure</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1] font-heading">
            Understand Performance. <br className="hidden sm:inline" />
            <span className="text-gradient-electric">Predict Risk.</span> Simplify Fees.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            The all-in-one intelligence platform built for premier IIT-JEE, NEET, and STEM coaching institutions.
            Combine deterministic fee ledgers, explainable student risk indicators, and grounded Google Gemini AI into one unified dashboard.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button variant="gradient" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Explore Live Dashboard Demo
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="outline" size="lg">
                View Role Personas (Admin / Faculty / Accounts)
              </Button>
            </Link>
          </div>

          {/* Key Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl glass-card border-white/10">
              <div className="text-2xl font-black text-white font-heading">0 to 100</div>
              <div className="text-xs text-slate-400 mt-1">Deterministic Early-Warning Score</div>
            </div>
            <div className="p-4 rounded-2xl glass-card border-white/10">
              <div className="text-2xl font-black text-electric-cyan font-heading">Integer Paise</div>
              <div className="text-xs text-slate-400 mt-1">Zero Floating-Point Fee Errors</div>
            </div>
            <div className="p-4 rounded-2xl glass-card border-white/10">
              <div className="text-2xl font-black text-electric-violet font-heading">Gemini AI</div>
              <div className="text-xs text-slate-400 mt-1">Strict Database Grounded Answers</div>
            </div>
            <div className="p-4 rounded-2xl glass-card border-white/10">
              <div className="text-2xl font-black text-emerald-400 font-heading">Razorpay INR</div>
              <div className="text-xs text-slate-400 mt-1">Cryptographic Webhook Verification</div>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Feature: Early Warning Intelligence Section */}
      <section id="early-warning" className="py-20 border-t border-white/10 bg-slate-950/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-electric-cyan block mb-2">
              SIGNATURE CAPABILITY
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-heading">
              Explainable Early Warning Intelligence
            </h2>
            <p className="mt-4 text-slate-400 text-base leading-relaxed">
              No black-box guesses. Our deterministic multi-signal engine cross-correlates attendance deficits, score decline trajectories, and consecutive absences into transparent, actionable interventions.
            </p>
          </div>

          {/* Interactive Simulated Student Flag Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student 1: High Risk */}
            <div className="glass-card p-6 border-rose-500/30 bg-rose-950/10 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">Rahul Sharma</h4>
                  <p className="text-xs text-slate-400">JEE Adv 2026 Pinnacle Batch B</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                  HIGH RISK (82)
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded bg-slate-900/80">
                  <span className="text-slate-400">Attendance:</span>
                  <span className="font-bold text-rose-400">62.5% (Threshold: 75%)</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-900/80">
                  <span className="text-slate-400">Score Trend:</span>
                  <span className="font-bold text-rose-400">78% → 54% (-24.0% drop)</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-900/80">
                  <span className="text-slate-400">Absence Streak:</span>
                  <span className="font-bold text-amber-400">5 consecutive sessions</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/5 text-xs text-slate-300">
                <strong className="text-brand-300 block mb-1">Recommended Action:</strong>
                Urgent parent-faculty consultation with Prof. Ananya Sen; assign 1-on-1 Calculus doubt mentor.
              </div>
            </div>

            {/* Student 2: High Risk */}
            <div className="glass-card p-6 border-rose-500/30 bg-rose-950/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">Karan Singhania</h4>
                  <p className="text-xs text-slate-400">JEE Adv 2027 Super-30 Batch A</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  HIGH RISK (89)
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded bg-slate-900/80">
                  <span className="text-slate-400">Attendance:</span>
                  <span className="font-bold text-rose-400">58.0% (Critical deficit)</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-900/80">
                  <span className="text-slate-400">Score Trend:</span>
                  <span className="font-bold text-rose-400">66% → 38% (Sub-par test)</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-900/80">
                  <span className="text-slate-400">Unexcused Misses:</span>
                  <span className="font-bold text-amber-400">4 missed lectures</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/5 text-xs text-slate-300">
                <strong className="text-brand-300 block mb-1">Recommended Action:</strong>
                Review medical justification, schedule compensatory thermodynamics class, verify fee status.
              </div>
            </div>

            {/* Student 3: Low Risk Top Scholar */}
            <div className="glass-card p-6 border-emerald-500/30 bg-emerald-950/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">Priya Patel</h4>
                  <p className="text-xs text-slate-400">NEET 2026 Achievers Alpha</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LOW RISK (12)
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded bg-slate-900/80">
                  <span className="text-slate-400">Attendance:</span>
                  <span className="font-bold text-emerald-400">96.0% (Consistent)</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-900/80">
                  <span className="text-slate-400">Score Trend:</span>
                  <span className="font-bold text-emerald-400">89% → 92.5% (+3.5% gain)</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-900/80">
                  <span className="text-slate-400">Fee Status:</span>
                  <span className="font-bold text-emerald-400">100% Paid (Receipt Stored)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/5 text-xs text-slate-300">
                <strong className="text-brand-300 block mb-1">Recommended Action:</strong>
                Fast-track into National Top-100 NEET revision cohort; candidate for Olympiad mock testing.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive ROI Fee Calculator Section */}
      <section id="roi-calculator" className="py-20 border-t border-white/10 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-8 sm:p-12 border-brand-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                Fee Realization & Recovery Simulator
              </h3>
            </div>
            <p className="text-slate-400 text-sm mb-8">
              Coaching institutes routinely suffer from 12% to 18% fee leakage due to untracked installment due dates, unnotified parents, and payment reconciliation delays. Calculate your projected recovery with EduTrack.AI.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sliders */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-300">Total Enrolled Scholars:</span>
                    <span className="text-electric-cyan font-bold">{scholarCount} Students</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    step="25"
                    value={scholarCount}
                    onChange={e => setScholarCount(Number(e.target.value))}
                    className="w-full accent-brand-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-300">Average Annual Package:</span>
                    <span className="text-electric-cyan font-bold">₹{(avgTuition / 1000).toLocaleString('en-IN')}k</span>
                  </div>
                  <input
                    type="range"
                    min="40000"
                    max="300000"
                    step="5000"
                    value={avgTuition}
                    onChange={e => setAvgTuition(Number(e.target.value))}
                    className="w-full accent-brand-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Total Annual Gross Billing:</span>
                    <span className="font-semibold text-white">₹{(totalGrossAnnual / 100000).toFixed(1)} Lakhs</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Baseline Slippage (14%):</span>
                    <span className="font-semibold text-rose-400">₹{(estimatedUncollectedWithoutEduTrack / 100000).toFixed(1)} Lakhs</span>
                  </div>
                </div>
              </div>

              {/* Recovery Impact Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-950/40 via-slate-900/80 to-slate-950/90 border border-brand-500/30 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-400 block mb-1">
                    PROJECTED ANNUAL CASHFLOW RECOVERY
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-white font-heading mt-2">
                    ₹{(recoveredWithEduTrack / 100000).toFixed(2)} <span className="text-xl font-normal text-slate-400">Lakhs</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    Through automated Razorpay payment reminder webhooks, deterministic aging brackets, and real-time guardian follow-ups.
                  </p>
                </div>

                <div className="pt-6 border-t border-white/10 mt-6">
                  <Link to="/dashboard">
                    <Button variant="gradient" className="w-full">
                      Test Razorpay Checkout in Demo Mode
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Data Protection */}
      <section id="security" className="py-20 border-t border-white/10 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Shield className="w-10 h-10 text-electric-cyan mx-auto mb-3" />
            <h2 className="text-3xl font-extrabold text-white font-heading">
              Enterprise Institutional Security
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Engineered with strict tenant isolation, immutable audit trails, and cryptographic verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl glass-card space-y-3">
              <Lock className="w-6 h-6 text-brand-400" />
              <h4 className="font-bold text-white text-base">Zero Floating-Point Financials</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                All course plans, invoices, discounts, and payments are stored and processed strictly using integer paise, eliminating round-off drift.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card space-y-3">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <h4 className="font-bold text-white text-base">HMAC-SHA256 Webhook Verification</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every payment confirmation from Razorpay is verified cryptographically on the backend server before crediting student ledgers.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card space-y-3">
              <Bot className="w-6 h-6 text-electric-violet" />
              <h4 className="font-bold text-white text-base">Grounded AI Safety</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Google Gemini API receives minimum required statistics. AI is strictly constrained from altering records or fabricating numbers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-electric-cyan flex items-center justify-center text-white font-bold text-sm">
              E
            </div>
            <span className="font-bold text-white tracking-tight">EduTrack.AI</span>
            <span className="text-xs text-slate-500">
              © 2026 AI Coaching Institute Performance & Fee Intelligence
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link to="/auth/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/reports" className="hover:text-white transition-colors">Reports</Link>
            <Link to="/settings" className="hover:text-white transition-colors">Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
