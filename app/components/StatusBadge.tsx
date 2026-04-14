'use client';
import { QuoteStatus } from '../data/mockData';

const config: Record<QuoteStatus, { label: string; className: string }> = {
  'Auto-Approved': { label: 'Auto-Approved', className: 'bg-green-100 text-green-700 border border-green-200' },
  'Approved':      { label: 'Approved',      className: 'bg-green-100 text-green-700 border border-green-200' },
  'Manual Review': { label: 'Manual Review', className: 'bg-amber-100 text-amber-700 border border-amber-200' },
  'Pending':       { label: 'Pending',       className: 'bg-slate-100 text-slate-600 border border-slate-200' },
  'Rejected':      { label: 'Rejected',      className: 'bg-red-100 text-red-700 border border-red-200' },
  'Escalated':     { label: 'Escalated',     className: 'bg-purple-100 text-purple-700 border border-purple-200' },
  'Accepted':      { label: 'Accepted',      className: 'bg-sky-100 text-sky-700 border border-sky-200' },
};

export function StatusBadge({ status }: { status: QuoteStatus }) {
  const { label, className } = config[status] ?? config['Pending'];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
