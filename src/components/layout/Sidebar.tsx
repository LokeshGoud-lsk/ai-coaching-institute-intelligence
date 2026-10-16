import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  GraduationCap,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Bot,
  FileSpreadsheet,
  Bell,
  Settings,
  User,
  Layers,
  Clock,
  Briefcase,
  Layers3,
  Receipt,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { UserRole } from '../../types';

interface SidebarProps {
  role: UserRole;
  unreadNotificationsCount?: number;
  openAlertsCount?: number;
  onLogout: () => void;
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  unreadNotificationsCount = 2,
  openAlertsCount = 3,
  onLogout,
}) => {
  const navSections = [
    {
      title: 'CORE PLATFORM',
      items: [
        { label: 'Overview Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Students Directory', path: '/students', icon: Users },
        { label: 'Attendance Tracking', path: '/attendance', icon: CalendarCheck },
        { label: 'Tests & Examinations', path: '/assessments', icon: GraduationCap },
        { label: 'Academic Performance', path: '/performance', icon: TrendingUp },
        { label: '3D Visual Analytics', path: '/visualizations-3d', icon: Layers3 },
      ],
    },
    {
      title: 'INTELLIGENCE & AI',
      items: [
        {
          label: 'Early Warning Intelligence',
          path: '/early-warning',
          icon: AlertTriangle,
          badge: openAlertsCount > 0 ? `${openAlertsCount} Alert${openAlertsCount > 1 ? 's' : ''}` : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse',
        },
        { label: 'AI Institute Assistant', path: '/ai-assistant', icon: Bot, isNew: true },
        { label: 'Reports & Exports', path: '/reports', icon: FileSpreadsheet },
      ],
    },
    {
      title: 'FINANCIAL INTELLIGENCE',
      items: [
        { label: 'Fee Plans & Invoices', path: '/fees/plans', icon: Receipt },
        { label: 'Payments & Razorpay', path: '/fees/payments', icon: CreditCard },
        { label: 'Overdue Fees Console', path: '/fees/overdue', icon: Clock },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { label: 'Batches & Timetable', path: '/batches', icon: Layers },
        { label: 'Faculty Directory', path: '/faculty', icon: Briefcase },
        {
          label: 'Notifications',
          path: '/notifications',
          icon: Bell,
          badge: unreadNotificationsCount > 0 ? String(unreadNotificationsCount) : undefined,
          badgeColor: 'bg-brand-500/20 text-brand-300 border-brand-500/30',
        },
        { label: 'Institute Settings', path: '/settings', icon: Settings },
        { label: 'Profile & Security', path: '/profile', icon: User },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-950/90 border-r border-white/10 flex flex-col h-screen select-none shrink-0 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <NavLink to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-electric-cyan flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-white text-base tracking-tight font-heading">
              EduTrack<span className="text-electric-cyan font-light">.AI</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
              Premier Intelligence
            </div>
          </div>
        </NavLink>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {section.title}
            </div>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={i}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group',
                        isActive
                          ? 'bg-gradient-to-r from-brand-600/30 to-brand-500/10 text-white border border-brand-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                      )
                    }
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-electric-cyan transition-colors shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge && (
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded-full border font-bold leading-none',
                            item.badgeColor
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                      {item.isNew && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                          AI
                        </span>
                      )}
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Session Footer */}
      <div className="p-3 border-t border-white/10 bg-slate-900/60 space-y-2">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center font-bold text-xs border border-brand-500/30">
              {role.slice(0, 2)}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                {role}
                <ShieldCheck className="w-3 h-3 text-electric-cyan" />
              </div>
              <div className="text-[10px] text-slate-400">Apex Academy</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
