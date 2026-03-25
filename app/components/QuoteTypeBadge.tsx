'use client';
import { QuoteType } from '../data/mockData';

const config: Record<QuoteType, string> = {
  'New Business': 'bg-blue-100 text-blue-800 ring-1 ring-blue-300',
  'Renewal':      'bg-indigo-100 text-indigo-800 ring-1 ring-indigo-300',
  'Mixed':        'bg-teal-100 text-teal-800 ring-1 ring-teal-300',
  'Framework':    'bg-violet-100 text-violet-800 ring-1 ring-violet-300',
};

export function QuoteTypeBadge({ type }: { type: QuoteType }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${config[type]}`}>
      {type}
    </span>
  );
}
