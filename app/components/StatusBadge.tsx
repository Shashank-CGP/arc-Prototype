'use client';
import { QuoteStatus } from '../data/mockData';

const config: Record<QuoteStatus, { label: string; className: string }> = {
  'Auto-Approved': { label: 'Auto-Approved', className: 'bg-green-100 text-green-800 ring-1 ring-green-300' },
  'Approved':      { label: 'Approved',      className: 'bg-green-100 text-green-800 ring-1 ring-green-300' },
  'Manual Review': { label: 'Manual Review', className: 'bg-amber-100 text-amber-800 ring-1 ring-amber-300' },
  'Pending':       { label: 'Pending',       className: 'bg-slate-100 text-slate-700 ring-1 ring-slate-300' },
  'Rejected':      { label: 'Rejected',      className: 'bg-red-100 text-red-800 ring-1 ring-red-300' },
  'Escalated':     { label: 'Escalated',     className: 'bg-purple-100 text-purple-800 ring-1 ring-purple-300' },
};

export function StatusBadge({ status }: { status: QuoteStatus }) {
  const { label, className } = config[status] ?? config['Pending'];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}
