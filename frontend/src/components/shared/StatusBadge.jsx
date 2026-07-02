import React from 'react';
import { Badge } from '@/components/ui/badge';

const statusStyles = {
  todo: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  in_review: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-slate-100 text-slate-500',
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-500',
  on_hold: 'bg-amber-100 text-amber-700',
  present: 'bg-emerald-100 text-emerald-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-amber-100 text-amber-700',
  half_day: 'bg-orange-100 text-orange-700',
  wfh: 'bg-purple-100 text-purple-700',
  leave: 'bg-slate-100 text-slate-600',
  on_leave: 'bg-amber-100 text-amber-700',
  terminated: 'bg-red-100 text-red-700',
  scheduled: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  expired: 'bg-slate-100 text-slate-500',
  available: 'bg-emerald-100 text-emerald-700',
  in_use: 'bg-blue-100 text-blue-700',
  maintenance: 'bg-amber-100 text-amber-700',
  retired: 'bg-slate-100 text-slate-500',
};

const priorityStyles = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
};

export default function StatusBadge({ status, type = 'status' }) {
  const styles = type === 'priority' ? priorityStyles : statusStyles;
  const style = styles[status] || 'bg-slate-100 text-slate-600';
  const label = status?.replace(/_/g, ' ') || 'unknown';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}>
      {label}
    </span>
  );
}