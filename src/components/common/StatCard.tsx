import React from 'react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    isNeutral?: boolean;
    label?: string;
  };
  icon: React.ReactNode;
  iconBgColor?: string;
  accentColor?: 'blue' | 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose';
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconBgColor = 'bg-brand-500/10 text-brand-400 border-brand-500/20',
  accentColor = 'blue',
  className,
  onClick,
}) => {
  const accentBorders = {
    blue: 'hover:border-electric-blue/40',
    violet: 'hover:border-electric-violet/40',
    cyan: 'hover:border-electric-cyan/40',
    emerald: 'hover:border-emerald-500/40',
    amber: 'hover:border-amber-500/40',
    rose: 'hover:border-rose-500/40',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-card p-5 relative overflow-hidden transition-all duration-300 group',
        onClick && 'cursor-pointer hover:-translate-y-1',
        accentBorders[accentColor],
        className
      )}
    >
      {/* Subtle background glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-colors pointer-events-none" />

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight text-white font-sans">{value}</h3>
        </div>
        <div
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105',
            iconBgColor
          )}
        >
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md border',
                trend.isNeutral
                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                  : trend.isPositive
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-950/60 text-rose-400 border-rose-500/30'
              )}
            >
              {trend.isNeutral ? (
                <Minus className="w-3 h-3" />
              ) : trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend.value}
            </span>
          )}
          {subtitle && <span className="text-slate-400 truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
