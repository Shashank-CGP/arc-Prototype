'use client';
import { useState } from 'react';
import { Quote, QuoteStatus } from '../../data/mockData';
import { initialBaskets, Basket } from '../../data/validationData';
import { MpanRollupBadge } from '../shared/MpanRollupBadge';
import { BasketGroupHeader } from '../shared/BasketGroupHeader';

interface Props {
  quotes: Quote[];
  onSelect: (id: string) => void;
}

const statusBadge: Partial<Record<QuoteStatus, { label: string; cls: string }>> = {
  'Auto-Approved': { label: 'Auto-Approved', cls: 'bg-green-100 text-green-700 border border-green-200' },
  'Manual Review': { label: 'Manual Review', cls: 'bg-amber-100 text-amber-700 border border-amber-200' },
  'Rejected':      { label: 'Rejected',       cls: 'bg-red-100 text-red-700 border border-red-200' },
  'Pending':       { label: 'Pending',         cls: 'bg-slate-100 text-slate-600 border border-slate-200' },
  'Accepted':      { label: 'Accepted',        cls: 'bg-sky-100 text-sky-700 border border-sky-200' },
  'Approved':      { label: 'Approved',        cls: 'bg-green-100 text-green-700 border border-green-200' },
  'Escalated':     { label: 'Escalated',       cls: 'bg-orange-100 text-orange-700 border border-orange-200' },
};

const typeBadge: Record<string, string> = {
  'New Business': 'bg-sky-100 text-sky-800 ring-1 ring-sky-300',
  'Renewal':      'bg-indigo-100 text-indigo-800 ring-1 ring-indigo-300',
};

export function ValidationQueue({ quotes, onSelect }: Props) {
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [exportToast, setExportToast] = useState(false);
  const [groupByBasket, setGroupByBasket] = useState(true);

  const filtered = quotes.filter(q =>
    (statusFilter === 'All' || q.status === statusFilter) &&
    (typeFilter === 'All' || q.quoteType === typeFilter)
  );

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Validation Queue</h1>
          <p className="text-sm text-slate-500 mt-1">Quote validation and acceptance — Power only</p>
        </div>
        <button
          onClick={() => { setExportToast(true); setTimeout(() => setExportToast(false), 2500); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-transparent border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export to Excel
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total', value: quotes.length, color: 'text-slate-900' },
          { label: 'Auto-Approved', value: quotes.filter(q => q.status === 'Auto-Approved').length, color: 'text-green-700' },
          { label: 'Manual Review', value: quotes.filter(q => q.status === 'Manual Review').length, color: 'text-amber-700' },
          { label: 'Rejected', value: quotes.filter(q => q.status === 'Rejected').length, color: 'text-red-700' },
          { label: 'Accepted', value: quotes.filter(q => q.status === 'Accepted').length, color: 'text-sky-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm">
            <div className={`text-xl font-semibold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-slate-500 font-medium">Filter:</span>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500">
          <option value="All">All Statuses</option>
          {(['Auto-Approved','Manual Review','Rejected','Pending','Accepted'] as QuoteStatus[]).map(s =>
            <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500">
          <option value="All">All Quote Types</option>
          <option value="Renewal">Renewal</option>
          <option value="New Business">New Business</option>
        </select>
        <button
          onClick={() => setGroupByBasket(g => !g)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
            groupByBasket
              ? 'bg-sky-50 text-sky-700 border-sky-200'
              : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'
          }`}
        >
          {groupByBasket ? '✓ Grouped by Basket' : 'Group by Basket'}
        </button>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} of {quotes.length} quotes</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Quote / Customer</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Account Manager</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Type</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">AQ (kWh)</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Submitted</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">MPANs</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Validation Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(() => {
              const statusSeverity: Record<string, number> = {
                'Failed': 4,
                'Manual Review': 3,
                'Pending': 2,
                'Accepted': 1,
                'Auto-Approved': 0,
              };

              const renderRow = (q: Quote) => {
                const s = statusBadge[q.status];
                const aqVal = q.aq ?? q.eac;
                const aqHigh = aqVal > 1000000;
                const failures = q.failureCount ?? 0;
                return (
                  <tr key={q.id} onClick={() => onSelect(q.id)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group border-b border-slate-100">
                    <td className="px-4 py-3.5">
                      <div className="font-mono text-sm font-semibold text-sky-600 group-hover:text-sky-700 leading-none">{q.ref}</div>
                      <div className="text-xs font-medium text-slate-600 mt-1 tracking-wide">{q.customer}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{q.accountManager}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${typeBadge[q.quoteType] ?? ''}`}>
                        {q.quoteType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className={`font-mono font-semibold ${aqHigh ? 'text-amber-700' : 'text-slate-700'} inline-flex items-center gap-1.5`}>
                        {aqHigh && <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                        {aqVal.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs">{q.contractStart}</td>
                    <td className="px-4 py-3">
                      <MpanRollupBadge
                        total={q.sites.length}
                        pass={q.sites.filter(s => {
                          const hasRedAmp = (s.ampIndicators ?? []).some(a => a.severity === 'red');
                          const hasFailCheck = (s.dataChecks ?? []).some(dc => dc.status === 'Fail');
                          const hasCurveMismatch = s.curveName !== s.currentCurveName;
                          return !hasRedAmp && !hasFailCheck && !hasCurveMismatch;
                        }).length}
                        fail={q.sites.filter(s => {
                          return (s.ampIndicators ?? []).some(a => a.severity === 'red') ||
                                 (s.dataChecks ?? []).some(dc => dc.status === 'Fail') ||
                                 s.curveName !== s.currentCurveName;
                        }).length}
                        warn={q.sites.filter(s => {
                          const hasAmber = (s.ampIndicators ?? []).some(a => a.severity === 'amber');
                          const hasWarnCheck = (s.dataChecks ?? []).some(dc => dc.status === 'Warning');
                          return hasAmber || hasWarnCheck;
                        }).length}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s?.cls ?? ''}`}>
                        {s?.label ?? q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {failures === 0
                        ? <span className="text-xs text-green-700 font-semibold flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            All checks passed
                          </span>
                        : <span className="text-xs text-amber-700 font-semibold">{failures} failure{failures > 1 ? 's' : ''}</span>}
                    </td>
                  </tr>
                );
              };

              if (groupByBasket) {
                const groups = new Map<string, Quote[]>();
                for (const q of filtered) {
                  const bId = q.basketId ?? 'ungrouped';
                  const list = groups.get(bId) ?? [];
                  list.push(q);
                  groups.set(bId, list);
                }

                return Array.from(groups.entries()).map(([basketId, items]) => {
                  const basket = initialBaskets.find(b => b.id === basketId) ?? {
                    id: basketId,
                    name: basketId,
                    submittedDate: '',
                    status: 'Open' as const,
                  };
                  const totalMpans = items.reduce((sum, q) => sum + q.sites.length, 0);
                  const totalAq = items.reduce((sum, q) => sum + (q.aq ?? q.eac), 0);
                  const worstStatus = items.reduce((worst, q) =>
                    (statusSeverity[q.status] ?? 0) > (statusSeverity[worst] ?? 0) ? q.status : worst,
                    items[0].status as string
                  );

                  return (
                    <BasketGroupHeader
                      key={basketId}
                      basket={basket}
                      itemCount={items.length}
                      totalMpans={totalMpans}
                      totalAq={totalAq}
                      worstStatus={worstStatus}
                    >
                      {items.map(renderRow)}
                    </BasketGroupHeader>
                  );
                });
              }

              return filtered.map(renderRow);
            })()}
          </tbody>
        </table>
      </div>

      {exportToast && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm font-medium">
          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          Validation queue exported to Excel
        </div>
      )}
    </div>
  );
}
