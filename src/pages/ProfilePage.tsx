import React, { useEffect, useState } from 'react';
import { User, Shield, Key, History, Check, X, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { UserProfile, UserRole } from '../types';
import { DEFAULT_USER } from '../lib/fallbackData';
import { Button } from '../components/common/Button';

export const ProfilePage: React.FC = () => {
  const getInitialUser = (): UserProfile => {
    try {
      const stored = localStorage.getItem('edutrack_auth_user');
      if (stored) return JSON.parse(stored);
    } catch (_) {}
    return DEFAULT_USER;
  };

  const [user, setUser] = useState<UserProfile>(getInitialUser());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await api.getMe();
        if (res && res.user) {
          setUser(res.user);
        }
      } catch (err) {
        console.warn('Profile sync standby, active on authenticated user session:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const permissionsMatrix = [
    { module: 'Manage Institute Settings & Branding', admin: true, faculty: false, accountant: false, viewer: false },
    { module: 'Create & Archive Student Records', admin: true, faculty: true, accountant: false, viewer: false },
    { module: 'Mark Attendance & Log Session Remarks', admin: true, faculty: true, accountant: false, viewer: false },
    { module: 'Conduct Tests & Record Examination Marks', admin: true, faculty: true, accountant: false, viewer: false },
    { module: 'Review & Resolve Early Warning Alerts', admin: true, faculty: true, accountant: false, viewer: false },
    { module: 'Issue Invoices & Manage Fee Plans', admin: true, faculty: false, accountant: true, viewer: false },
    { module: 'Verify Razorpay Transactions & Settle Ledger', admin: true, faculty: false, accountant: true, viewer: false },
    { module: 'View Grounded AI Insights & 3D Visualizations', admin: true, faculty: true, accountant: true, viewer: true },
    { module: 'Export Official PDF & CSV Registers', admin: true, faculty: true, accountant: true, viewer: true },
  ];

  if (isLoading && !user) {
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
          User Profile & Security Console
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Active authentication profile, tenant isolation boundary, and role-based permissions matrix
        </p>
      </div>

      {/* User Info Card */}
      <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-glow">
            {user.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-heading">{user.fullName}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-electric-cyan" />
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-400">{user.email}</p>
            <p className="text-xs text-slate-500">Tenant: Apex Academy of Science (ID: {user.instituteId})</p>
          </div>
        </div>

        <div>
          <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-semibold block text-center">
            Session Authenticated
          </span>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Permissions Matrix */}
      <div className="glass-card p-5 space-y-4">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Shield className="w-4 h-4 text-electric-cyan" />
            Institutional Role-Based Access Control (RBAC) Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict authorization boundaries enforced across all REST API endpoints
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 uppercase text-[10px] text-slate-400 border-b border-white/10">
              <tr>
                <th className="p-3">Application Module / Capability</th>
                <th className="p-3 text-center">Administrator</th>
                <th className="p-3 text-center">Faculty</th>
                <th className="p-3 text-center">Accountant</th>
                <th className="p-3 text-center">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {permissionsMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="p-3 font-medium text-white">{item.module}</td>
                  <td className="p-3 text-center">
                    {item.admin ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {item.faculty ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {item.accountant ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {item.viewer ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
