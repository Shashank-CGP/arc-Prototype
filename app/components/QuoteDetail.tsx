'use client';
import { useState } from 'react';
import { Quote } from '../data/mockData';
import { StatusBadge } from './StatusBadge';
import { QuoteTypeBadge } from './QuoteTypeBadge';
import { AuditTrail } from './AuditTrail';

interface Props {
  quote: Quote;
  onBack: () => void;
  onExpandSite: (siteIndex: number) => void;
  onApprove: () => void;
  onReject: () => void;
}

export function QuoteDetail({ quote, onBack, onExpandSite, onApprove, onReject }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'audit'>('overview');
  const [expandedSiteIds, setExpandedSiteIds] = useState<Set<string>>(new Set());

  const toggleSite = (id: string) => {
    setExpandedSiteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const failureCount = quote.toleranceResults.filter((r) => r.result === 'Fail').length;
  const isActionable = quote.status === 'Manual Review' || quote.status === 'Pending';

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium mb-5">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Curve Approval Queue
      </button>

      {/* Quote header card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-slate-900 font-mono">{quote.ref}</h1>
                <QuoteTypeBadge type={quote.quoteType} />
                <StatusBadge status={quote.status} />
              </div>
              <p className="text-lg font-semibold text-slate-700">{quote.customer}</p>
              <p className="text-sm text-slate-500 mt-0.5">
                {quote.supplier} · Contract: {quote.contractStart} – {quote.contractEnd}
              </p>
            </div>
          </div>

          {/* Actions */}
          {isActionable && (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {}}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                Escalate
              </button>
              <button
                onClick={() => {}}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                Delegate
              </button>
              <button
                onClick={onReject}
                className="px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={onApprove}
                className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                Approve
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-5 gap-4 mt-4 pt-4 border-t border-slate-100">
          {[
            { label: 'Account Manager', value: quote.accountManager },
            { label: 'Analyst', value: quote.analyst },
            { label: 'EAC', value: `${quote.eac.toLocaleString()} kWh` },
            { label: 'HH Sites', value: `${quote.hhSites}` },
            { label: 'Data Age', value: `${quote.dataAge} days`, warn: quote.dataAge > 30 },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-xs text-slate-500 font-medium mb-0.5">{item.label}</div>
              <div className={`text-sm font-semibold ${item.warn ? 'text-amber-700' : 'text-slate-900'}`}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Approval result banner */}
      {quote.status === 'Auto-Approved' || quote.status === 'Approved' ? (
        <div className="flex items-center gap-3 px-5 py-4 mb-4 rounded-xl bg-green-50 border border-green-200">
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <div className="text-green-900 font-semibold text-sm">Auto-Approved — all tolerances passed</div>
            <div className="text-green-700 text-xs mt-0.5">All 6 tolerance checks passed. Quote forwarded to pricing engine automatically.</div>
          </div>
        </div>
      ) : quote.status === 'Manual Review' ? (
        <div className="flex items-center gap-3 px-5 py-4 mb-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <div className="text-amber-900 font-semibold text-sm">Manual Review Required — {failureCount} tolerance failure{failureCount !== 1 ? 's' : ''}</div>
            <div className="text-amber-700 text-xs mt-0.5">This quote could not be auto-approved. Review the failures below and approve or reject.</div>
          </div>
        </div>
      ) : quote.status === 'Rejected' ? (
        <div className="flex items-center gap-3 px-5 py-4 mb-4 rounded-xl bg-red-50 border border-red-200">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <div className="text-red-900 font-semibold text-sm">Rejected — returned to Account Manager</div>
            <div className="text-red-700 text-xs mt-0.5">
              Returned to {quote.accountManager}
              {quote.failureReasons && quote.failureReasons.length > 0 && (
                <span> · Reasons: {quote.failureReasons.join(', ')}</span>
              )}
            </div>
          </div>
        </div>
      ) : quote.status === 'Pending' && quote.dataAge > 30 ? (
        <div className="flex items-center gap-3 px-5 py-4 mb-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-amber-900 font-semibold text-sm">Stale HH Data — {quote.dataAge} days old (threshold: 30 days)</div>
            <div className="text-amber-700 text-xs mt-0.5">HH data may not reflect current consumption patterns. Refresh before proceeding.</div>
          </div>
          <button className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 border border-amber-300 rounded-lg hover:bg-amber-200 transition-colors shrink-0">
            Refresh HH Data
          </button>
        </div>
      ) : null}

      {/* Pricing warning */}
      {quote.pricingWarning && (
        <div className="flex items-center gap-3 px-5 py-3 mb-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-sm">
          <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>⚠ Default pricing applied — Account Manager has not selected curve, risk or product</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-5">
        {(['overview', 'audit'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            {tab === 'overview' ? 'Overview' : 'Audit Trail'}
          </button>
        ))}
      </div>

      {activeTab === 'audit' ? (
        <AuditTrail events={quote.auditTrail} quoteRef={quote.ref} />
      ) : (
        <div className="space-y-5">
          {/* Tolerance checks */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Tolerance Check Results</h2>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-700 font-semibold">{quote.toleranceResults.filter(r => r.result === 'Pass').length} passed</span>
                  {failureCount > 0 && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="text-red-700 font-semibold">{failureCount} failed</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rule</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Threshold</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actual</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quote.toleranceResults.map((r) => (
                  <tr key={r.rule} className={r.result === 'Fail' ? 'bg-red-50' : ''}>
                    <td className="px-5 py-3.5 font-medium text-slate-700">{r.rule}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{r.threshold}</td>
                    <td className={`px-5 py-3.5 font-mono text-sm font-semibold ${r.result === 'Fail' ? 'text-red-700' : 'text-slate-700'}`}>
                      {r.actual}
                    </td>
                    <td className="px-5 py-3.5">
                      {r.result === 'Pass' ? (
                        <span className="inline-flex items-center gap-1.5 text-green-700 font-semibold text-xs bg-green-50 px-2 py-1 rounded-full">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          Pass
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-red-700 font-semibold text-xs bg-red-100 px-2 py-1 rounded-full">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          Fail
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sites */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Sites — {quote.sites.length} HH Meter{quote.sites.length !== 1 ? 's' : ''}</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {quote.sites.map((site, siteIdx) => {
                const isExpanded = expandedSiteIds.has(site.id);
                const siteFails = site.toleranceResults.filter((r) => r.result === 'Fail').length;
                return (
                  <div key={site.id}>
                    {/* Site row */}
                    <div
                      className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => toggleSite(site.id)}
                    >
                      <div className="flex items-center gap-4">
                        <svg
                          className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-sm font-semibold text-slate-800">{site.mpan}</span>
                            {siteFails > 0 && (
                              <span className="text-xs font-semibold text-red-700 bg-red-100 px-1.5 py-0.5 rounded ring-1 ring-red-200">
                                {siteFails} failure{siteFails > 1 ? 's' : ''}
                              </span>
                            )}
                            {site.dataAge > 30 && (
                              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded ring-1 ring-amber-200">
                                Stale data
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{site.address}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-right">
                          <div className="text-xs text-slate-500">EAC</div>
                          <div className="font-mono font-semibold text-slate-700">{site.eac.toLocaleString()} kWh</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500">MOP</div>
                          <div className="text-sm text-slate-700">{site.mop}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500">Data age</div>
                          <div className={`text-sm font-medium ${site.dataAge > 30 ? 'text-amber-700' : 'text-slate-700'}`}>{site.dataAge} days</div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); onExpandSite(siteIdx); }}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
                        >
                          View HH Data →
                        </button>
                      </div>
                    </div>

                    {/* Expanded inline tolerance summary */}
                    {isExpanded && (
                      <div className="bg-slate-50 border-t border-slate-100 px-5 py-4">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Tolerance Summary — {site.mpan}</div>
                        <div className="grid grid-cols-3 gap-2">
                          {site.toleranceResults.map((r) => (
                            <div
                              key={r.rule}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs ${
                                r.result === 'Fail' ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'
                              }`}
                            >
                              <span className={`font-medium ${r.result === 'Fail' ? 'text-red-700' : 'text-slate-600'}`}>{r.rule}</span>
                              <span className={`font-mono font-bold ml-2 ${r.result === 'Fail' ? 'text-red-700' : 'text-green-700'}`}>{r.actual}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
