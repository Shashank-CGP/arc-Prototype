'use client';
import { useState } from 'react';
import { Contract, ContractStatus, ContractType, initialBaskets, Basket } from '../../data/validationData';
import { MpanRollupBadge } from '../shared/MpanRollupBadge';
import { BasketGroupHeader } from '../shared/BasketGroupHeader';

interface Props {
  contracts: Contract[];
  onSelect: (id: string) => void;
}

const statusBadge: Record<ContractStatus, { label: string; cls: string }> = {
  'Auto-Approved': { label: 'Auto-Approved', cls: 'bg-green-100 text-green-700 border border-green-200' },
  'Manual Review': { label: 'Manual Review', cls: 'bg-amber-100 text-amber-700 border border-amber-200' },
  'Failed':        { label: 'Failed',         cls: 'bg-red-100 text-red-700 border border-red-200' },
  'Pending':       { label: 'Pending',         cls: 'bg-slate-100 text-slate-600 border border-slate-200' },
  'Accepted':      { label: 'Accepted',        cls: 'bg-sky-100 text-sky-700 border border-sky-200' },
};

const typeBadge: Record<ContractType, string> = {
  'New Business': 'bg-sky-100 text-sky-800 ring-1 ring-sky-300',
  'Renewal':      'bg-indigo-100 text-indigo-800 ring-1 ring-indigo-300',
};

export function ValidationQueue({ contracts, onSelect }: Props) {
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<ContractType | 'All'>('All');
  const [exportToast, setExportToast] = useState(false);
  const [groupByBasket, setGroupByBasket] = useState(true);

  const filtered = contracts.filter(c =>
    (statusFilter === 'All' || c.status === statusFilter) &&
    (typeFilter === 'All' || c.contractType === typeFilter)
  );

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Validation Queue</h1>
          <p className="text-sm text-slate-500 mt-1">Contract validation and acceptance — Power only</p>
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
          { label: 'Total', value: contracts.length, color: 'text-slate-900' },
          { label: 'Auto-Approved', value: contracts.filter(c => c.status === 'Auto-Approved').length, color: 'text-green-700' },
          { label: 'Manual Review', value: contracts.filter(c => c.status === 'Manual Review').length, color: 'text-amber-700' },
          { label: 'Failed', value: contracts.filter(c => c.status === 'Failed').length, color: 'text-red-700' },
          { label: 'Accepted', value: contracts.filter(c => c.status === 'Accepted').length, color: 'text-sky-600' },
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
          {(['Auto-Approved','Manual Review','Failed','Pending','Accepted'] as ContractStatus[]).map(s =>
            <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500">
          <option value="All">All Contract Types</option>
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
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} of {contracts.length} contracts</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Contract / Customer</th>
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

              const renderRow = (c: Contract) => {
                const s = statusBadge[c.status];
                const aqHigh = c.aq > 1000000;
                return (
                  <tr key={c.id} onClick={() => onSelect(c.id)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group border-b border-slate-100">
                    <td className="px-4 py-3.5">
                      <div className="font-mono text-sm font-semibold text-sky-600 group-hover:text-sky-700 leading-none">{c.ref}</div>
                      <div className="text-xs font-medium text-slate-600 mt-1 tracking-wide">{c.customer}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{c.accountManager}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${typeBadge[c.contractType]}`}>
                        {c.contractType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className={`font-mono font-semibold ${aqHigh ? 'text-amber-700' : 'text-slate-700'} inline-flex items-center gap-1.5`}>
                        {aqHigh && <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                        {c.aq.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs">{c.submissionDate}</td>
                    <td className="px-4 py-3">
                      <MpanRollupBadge
                        total={c.mpans?.length ?? 1}
                        pass={c.mpans?.filter(s => {
                          const hasRedAmp = s.ampIndicators.some(a => a.severity === 'red');
                          const hasFailCheck = s.dataChecks.some(c => c.status === 'Fail');
                          const hasCurveMismatch = s.curveName !== s.currentCurveName;
                          return !hasRedAmp && !hasFailCheck && !hasCurveMismatch;
                        }).length ?? (c.status === 'Auto-Approved' ? 1 : 0)}
                        fail={c.mpans?.filter(s => {
                          return s.ampIndicators.some(a => a.severity === 'red') ||
                                 s.dataChecks.some(c => c.status === 'Fail') ||
                                 s.curveName !== s.currentCurveName;
                        }).length ?? (c.failureCount > 0 ? 1 : 0)}
                        warn={c.mpans?.filter(s => {
                          const hasAmber = s.ampIndicators.some(a => a.severity === 'amber');
                          const hasWarnCheck = s.dataChecks.some(c => c.status === 'Warning');
                          return hasAmber || hasWarnCheck;
                        }).length ?? 0}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {c.failureCount === 0
                        ? <span className="text-xs text-green-700 font-semibold flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            All checks passed
                          </span>
                        : <span className="text-xs text-amber-700 font-semibold">{c.failureCount} failure{c.failureCount > 1 ? 's' : ''}</span>}
                    </td>
                  </tr>
                );
              };

              if (groupByBasket) {
                const groups = new Map<string, Contract[]>();
                for (const c of filtered) {
                  const list = groups.get(c.basketId) ?? [];
                  list.push(c);
                  groups.set(c.basketId, list);
                }

                return Array.from(groups.entries()).map(([basketId, items]) => {
                  const basket = initialBaskets.find(b => b.id === basketId) ?? {
                    id: basketId,
                    name: basketId,
                    submittedDate: '',
                    status: 'Open' as const,
                  };
                  const totalMpans = items.reduce((sum, c) => sum + (c.mpans?.length ?? 1), 0);
                  const totalAq = items.reduce((sum, c) => sum + c.aq, 0);
                  const worstStatus = items.reduce((worst, c) =>
                    (statusSeverity[c.status] ?? 0) > (statusSeverity[worst] ?? 0) ? c.status : worst,
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
