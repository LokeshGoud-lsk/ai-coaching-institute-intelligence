import React from 'react';
import { cn } from '../../lib/utils';
import { RiskCategory, InvoiceStatus, AttendanceStatus, StudentStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border-slate-700/60',
    success: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-950/70 text-amber-300 border-amber-500/30',
    danger: 'bg-rose-950/70 text-rose-300 border-rose-500/30',
    info: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/30',
    purple: 'bg-violet-950/70 text-violet-300 border-violet-500/30',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded-md font-medium',
    md: 'text-xs px-2.5 py-1 rounded-full font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border leading-none tracking-wide transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export const RiskBadge: React.FC<{ category: RiskCategory; score?: number; className?: string }> = ({
  category,
  score,
  className,
}) => {
  if (category === 'HIGH') {
    return (
      <Badge variant="danger" className={cn('font-bold', className)}>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
        HIGH RISK {score !== undefined && `(${score})`}
      </Badge>
    );
  }
  if (category === 'MEDIUM') {
    return (
      <Badge variant="warning" className={className}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        MEDIUM RISK {score !== undefined && `(${score})`}
      </Badge>
    );
  }
  return (
    <Badge variant="success" className={className}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      LOW RISK {score !== undefined && `(${score})`}
    </Badge>
  );
};

export const InvoiceStatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
  switch (status) {
    case 'PAID':
      return <Badge variant="success">PAID</Badge>;
    case 'PARTIALLY_PAID':
      return <Badge variant="info">PARTIALLY PAID</Badge>;
    case 'OVERDUE':
      return <Badge variant="danger">OVERDUE</Badge>;
    case 'ISSUED':
      return <Badge variant="purple">ISSUED</Badge>;
    case 'DRAFT':
    default:
      return <Badge variant="default">DRAFT</Badge>;
  }
};

export const AttendanceBadge: React.FC<{ status: AttendanceStatus }> = ({ status }) => {
  switch (status) {
    case 'PRESENT':
      return <Badge variant="success">Present</Badge>;
    case 'ABSENT':
      return <Badge variant="danger">Absent</Badge>;
    case 'LATE':
      return <Badge variant="warning">Late</Badge>;
    case 'EXCUSED':
      return <Badge variant="info">Excused</Badge>;
  }
};
