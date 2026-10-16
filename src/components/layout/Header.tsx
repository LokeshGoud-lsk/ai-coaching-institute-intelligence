import React, { useState } from 'react';
import {
  Bell,
  Search,
  Sparkles,
  Shield,
  Menu,
  ChevronDown,
  User,
  ExternalLink,
} from 'lucide-react';
import { UserRole } from '../../types';
import { Button } from '../common/Button';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenAIChat: () => void;
  onToggleMobileSidebar?: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onOpenAIChat,
  onToggleMobileSidebar,
  unreadCount = 2,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'ADMIN', label: 'Administrator', desc: 'Full institutional management & settings' },
    { role: 'FACULTY', label: 'Faculty / Teacher', desc: 'Attendance, tests, marks & student mentorship' },
    { role: 'ACCOUNTANT', label: 'Accountant', desc: 'Fee plans, invoices, payments & ledger' },
    { role: 'VIEWER', label: 'Read-only Viewer', desc: 'Executive read-only analytics inspection' },
  ];

  return (
    <header className="h-16 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile trigger & breadcrumb / title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-white/5"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-200">Apex Academy of Science</span>
          <span>/</span>
          <span className="text-electric-cyan font-medium">IIT-JEE & NEET Intelligence Portal</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-brand-500/40 text-xs font-semibold text-white transition-all shadow-sm"
          >
            <Shield className="w-3.5 h-3.5 text-electric-cyan" />
            <span>Role: {currentRole}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 glass-card border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
                Switch Demo Persona
              </div>
              {roles.map(r => (
                <button
                  key={r.role}
                  onClick={() => {
                    onRoleChange(r.role);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex flex-col ${
                    currentRole === r.role
                      ? 'bg-brand-600/30 text-white border border-brand-500/40'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="font-bold flex items-center justify-between">
                    {r.label}
                    {currentRole === r.role && (
                      <span className="text-[10px] text-electric-cyan">Active</span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">{r.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI Assistant Quick Trigger */}
        <Button
          size="sm"
          variant="gradient"
          leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          onClick={onOpenAIChat}
          className="shadow-glow"
        >
          <span className="hidden sm:inline">Ask AI Assistant</span>
          <span className="sm:hidden">AI</span>
        </Button>

        {/* Notifications Icon */}
        <a
          href="/notifications"
          className="relative p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </a>

        {/* User Avatar */}
        <a
          href="/profile"
          className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs border border-white/10 shadow-sm"
        >
          <User className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
};
