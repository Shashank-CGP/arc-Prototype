'use client';
import { useState } from 'react';
import { Quote, QuoteType, QuoteStatus } from '../data/mockData';
import { StatusBadge } from './StatusBadge';
import { QuoteTypeBadge } from './QuoteTypeBadge';

interface Props {
  quotes: Quote[];
  onSelectQuote: (id: string) => void;
}

const allTypes: QuoteType[] = ['Renewal', 'New Business', 'Mixed', 'Framework'];
const allStatuses: QuoteStatus[] = ['Pending', 'Auto-Approved', 'Manual Review', 'Rejected', 'Escalated', 'Approved'];

export function QuoteQueue({ quotes, onSelectQuote }: Props) {
  const [typeFilter, setTypeFilter] = useState<QuoteType | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'All'>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [showExportToast, setShowExportToast] = useState(false);

  const filtered = quotes.filter((q) => {
    if (typeFilter !== 'All' && q.quoteType !== typeFilter) return false;
    if (statusFilter !== 'All' && q.status !== statusFilter) return false;
    return true;
  });

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1800);
  };

  const handleExport = () => {
    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 2500);
  };

  const staleCount = quotes.filter((q) => q.dataAge > 30).length;

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Curve Approval Queue</h1>
          <p className="text-sm text-slate-500 mt-1">HH quotes awaiting curve approval — Power only</p>
        </div>
        <div className="flex items-center gap-3">
          {staleCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium">{staleCount} quote{staleCount > 1 ? 's' : ''} with stale HH data</span>
            </div>
          )}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-transparent border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Refreshing…' : 'Refresh HH Data'}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-transparent border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export to Excel
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Quotes', value: quotes.length, color: 'text-slate-900' },
          { label: 'Auto-Approved', value: quotes.filter(q => q.status === 'Auto-Approved' || q.status === 'Approved').length, color: 'text-green-700' },
          { label: 'Manual Review', value: quotes.filter(q => q.status === 'Manual Review').length, color: 'text-amber-700' },
          { label: 'Rejected', value: quotes.filter(q => q.status === 'Rejected').length, color: 'text-red-700' },
          { label: 'Stale Data', value: staleCount, color: 'text-amber-700' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm">
            <div className={`text-xl font-semibold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-slate-500 font-medium">Filter:</span>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as QuoteType | 'All')}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="All">All Quote Types</option>
          {allTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as QuoteStatus | 'All')}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="All">All Statuses</option>
          {allStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} of {quotes.length} quotes shown</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide bg-slate-50">Quote / Customer</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide bg-slate-50">Account Manager</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide bg-slate-50">Quote Type</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide bg-slate-50">EAC (kWh)</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide bg-slate-50">HH Sites</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide bg-slate-50">Data Age</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide bg-slate-50">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((quote) => (
              <tr
                key={quote.id}
                onClick={() => onSelectQuote(quote.id)}
                className="hover:bg-slate-50 cursor-pointer transition-colors group border-b border-slate-100"
              >
                <td className="px-4 py-3.5">
                  <div className="font-mono text-sm font-semibold text-sky-600 group-hover:text-sky-700 leading-none">{quote.ref}</div>
                  <div className="text-xs font-medium text-slate-600 mt-1 tracking-wide">{quote.customer}</div>
                </td>
                <td className="px-4 py-3.5 text-slate-600">{quote.accountManager}</td>
                <td className="px-4 py-3.5">
                  <QuoteTypeBadge type={quote.quoteType} />
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-slate-700">
                  {quote.eac.toLocaleString()}
                </td>
                <td className="px-4 py-3.5 text-right text-slate-600">{quote.hhSites}</td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 text-sm ${quote.dataAge > 30 ? 'text-amber-700 font-semibold' : 'text-slate-600'}`}>
                    {quote.dataAge > 30 && (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                    {quote.dataAge} days
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={quote.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            </svg>
            No quotes match the selected filters.
          </div>
        )}
      </div>

      {/* Export toast */}
      {showExportToast && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm font-medium animate-in slide-in-from-bottom-2">
          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Quote queue exported to Excel
        </div>
      )}
    </div>
  );
}
