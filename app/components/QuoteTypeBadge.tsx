'use client';
import { QuoteType } from '../data/mockData';

const config: Record<QuoteType, string> = {
  'New Business': 'bg-sky-100 text-sky-700 border border-sky-200',
  'Renewal':      'bg-indigo-100 text-indigo-700 border border-indigo-200',
  'Mixed':        'bg-teal-100 text-teal-700 border border-teal-200',
  'Framework':    'bg-violet-100 text-violet-700 border border-violet-200',
};

export function QuoteTypeBadge({ type }: { type: QuoteType }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config[type]}`}>
      {type}
    </span>
  );
}
