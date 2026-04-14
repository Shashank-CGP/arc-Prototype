'use client';
import { useState } from 'react';
import { Basket } from '../../data/validationData';

interface Props {
  basket: Basket;
  itemCount: number;
  totalMpans: number;
  totalAq: number;
  worstStatus: string;
  children: React.ReactNode;
}

const statusBadge = (status: string) => {
  if (status === 'Pass' || status === 'Auto-Approved' || status === 'Approved')
    return 'bg-green-100 text-green-700 border border-green-200';
  if (status === 'Fail' || status === 'Failed' || status === 'Rejected')
    return 'bg-red-100 text-red-700 border border-red-200';
  if (status === 'Warning' || status === 'Manual Review')
    return 'bg-amber-100 text-amber-700 border border-amber-200';
  return 'bg-slate-100 text-slate-600 border border-slate-200';
};

const basketStatusBadge = (status: Basket['status']) => {
  if (status === 'Complete') return 'bg-green-100 text-green-700 border border-green-200';
  if (status === 'In Progress') return 'bg-sky-100 text-sky-700 border border-sky-200';
  return 'bg-slate-100 text-slate-600 border border-slate-200';
};

export function BasketGroupHeader({ basket, itemCount, totalMpans, totalAq, worstStatus, children }: Props) {
  const [expanded, setExpanded] = useState(true);

  return (
    <>
      <tr
        className="bg-slate-50 border-y border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <td colSpan={100} className="px-4 py-3">
          <div className="flex items-center gap-3">
            <svg
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm font-semibold text-slate-800">{basket.name}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${basketStatusBadge(basket.status)}`}>
                {basket.status}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0">
              <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
              <span className="text-slate-300">|</span>
              <span>{totalMpans} MPANs</span>
              <span className="text-slate-300">|</span>
              <span>{totalAq.toLocaleString()} kWh</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadge(worstStatus)}`}>
                {worstStatus}
              </span>
            </div>
          </div>
        </td>
      </tr>
      {expanded && children}
    </>
  );
}
