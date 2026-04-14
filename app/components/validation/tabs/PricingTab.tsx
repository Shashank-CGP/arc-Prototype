'use client';
import { useState, useMemo } from 'react';
import { Quote, Site, buildSiteQuote } from '../../../data/mockData';
import { PricingRow, ValidationResult } from '../../../data/validationData';
import { MpanSummaryBar, MpanSubTabBar } from './MpanSubTabs';

interface Props {
  quote: Quote;
  onMarkVerified: () => void;
  verified: boolean;
}

// ─── Per-MPAN status derivation ───────────────────────────────────

export function getMpanPricingStatus(site: Site): ValidationResult {
  const allRows = [...(site.pricingRows ?? []), ...(site.standingRows ?? [])];
  const hasAnomaly = allRows.some(r => {
    if (r.warnIfZero && r.value === 0) return true;
    if (r.anomalyRange) return r.value > r.anomalyRange.max || (r.value < r.anomalyRange.min && r.value !== 0);
    return false;
  });
  return hasAnomaly ? 'Warning' : 'Pass';
}

// ─── Shared helpers ───────────────────────────────────────────────

type AnomalyLevel = 'ok' | 'warn' | 'error';

function getAnomaly(row: PricingRow, value: number): { level: AnomalyLevel; msg: string } {
  if (row.warnIfZero && value === 0) return { level: 'error', msg: 'Value is zero — confirm this is correct' };
  if (row.anomalyRange) {
    if (value > row.anomalyRange.max) return { level: 'warn', msg: `Above typical range (${row.anomalyRange.min}–${row.anomalyRange.max}p)` };
    if (value < row.anomalyRange.min && value !== 0) return { level: 'warn', msg: `Below typical range (${row.anomalyRange.min}–${row.anomalyRange.max}p)` };
  }
  return { level: 'ok', msg: 'Within expected range' };
}

function AnomalyIcon({ level, msg }: { level: AnomalyLevel; msg: string }) {
  if (level === 'ok') return (
    <span className="text-green-600" title={msg}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
    </span>
  );
  if (level === 'warn') return (
    <span className="text-amber-500 cursor-help" title={msg}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    </span>
  );
  return (
    <span className="text-red-500 cursor-help" title={msg}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    </span>
  );
}

function PercentBar({ pct }: { pct: number }) {
  const w   = Math.max(2, Math.min(100, pct));
  const col = pct > 40 ? 'bg-sky-500' : pct > 20 ? 'bg-sky-400' : 'bg-sky-300';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${col}`} style={{ width: `${w}%` }} />
      </div>
      <span className="text-xs text-slate-500 tabular-nums w-10">{pct.toFixed(1)}%</span>
    </div>
  );
}

function EditableTable({
  rows, values, onChange, title, contractTotal, unitLabel, disabled,
}: {
  rows: PricingRow[]; values: Record<string, number>;
  onChange: (id: string, v: number) => void;
  title: string; contractTotal: number; unitLabel: string; disabled: boolean;
}) {
  const total     = useMemo(() => Object.values(values).reduce((a, b) => a + b, 0), [values]);
  const anomalies = rows.filter(r => getAnomaly(r, values[r.id] ?? r.value).level !== 'ok');

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{title}</h3>
        {anomalies.length > 0 && (
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            {anomalies.length} flag{anomalies.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide w-1/3">Component</th>
            <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide w-32">{unitLabel}</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">% of Total</th>
            <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide w-12">Flag</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map(row => {
            const val        = values[row.id] ?? row.value;
            const pct        = total > 0 ? (val / total) * 100 : 0;
            const { level, msg } = getAnomaly(row, val);
            return (
              <tr key={row.id} className={level === 'error' ? 'bg-red-50' : level === 'warn' ? 'bg-amber-50/40' : ''}>
                <td className="px-4 py-2 font-medium text-slate-700">{row.name}</td>
                <td className="px-4 py-2 text-right">
                  <input type="number" step="0.0001" value={val} disabled={disabled}
                    onChange={e => onChange(row.id, parseFloat(e.target.value) || 0)}
                    className={`w-28 text-right font-mono text-sm px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                      disabled   ? 'bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed' :
                      level === 'error' ? 'border-red-300 bg-red-50 text-red-700' :
                      level === 'warn'  ? 'border-amber-300 bg-amber-50/60' :
                      'border-slate-200 bg-white'
                    }`} />
                </td>
                <td className="px-4 py-2"><PercentBar pct={pct} /></td>
                <td className="px-4 py-2 text-center"><AnomalyIcon level={level} msg={msg} /></td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-200 bg-slate-50">
            <td className="px-4 py-2.5 font-bold text-slate-800">Total</td>
            <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">{total.toFixed(4)}</td>
            <td className="px-4 py-2.5" />
            <td className="px-4 py-2.5 text-center">
              {Math.abs(total - contractTotal) < 0.0001
                ? <svg className="w-4 h-4 text-green-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                : <svg className="w-4 h-4 text-amber-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── Single-site pricing content ──────────────────────────────────

interface ContentProps {
  quote: Quote;
  onMarkVerified: () => void;
  verified: boolean;
  mpanLabel?: string;
}

function PricingContent({ quote, onMarkVerified, verified, mpanLabel }: ContentProps) {
  const [unitValues, setUnitValues]       = useState<Record<string, number>>(
    () => Object.fromEntries((quote.pricingRows ?? []).map(r => [r.id, r.value]))
  );
  const [standingValues, setStandingValues] = useState<Record<string, number>>(
    () => Object.fromEntries((quote.standingRows ?? []).map(r => [r.id, r.value]))
  );
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveReason, setSaveReason]       = useState('');

  const unitTotal  = useMemo(() => Object.values(unitValues).reduce((a, b) => a + b, 0), [unitValues]);
  const standTotal = useMemo(() => Object.values(standingValues).reduce((a, b) => a + b, 0), [standingValues]);
  const unitVariance  = unitTotal - (quote.unitRate ?? 0);
  const standVariance = standTotal - (quote.standingCharge ?? 0);
  const unitOk  = Math.abs(unitVariance) < 0.0001;
  const standOk = Math.abs(standVariance) < 0.0001;

  const unitAnomalies  = (quote.pricingRows ?? []).filter(r => getAnomaly(r, unitValues[r.id] ?? r.value).level !== 'ok');
  const standAnomalies = (quote.standingRows ?? []).filter(r => getAnomaly(r, standingValues[r.id] ?? r.value).level !== 'ok');
  const allAnomalies   = [...unitAnomalies, ...standAnomalies];

  const handleReset = () => {
    setUnitValues(Object.fromEntries((quote.pricingRows ?? []).map(r => [r.id, r.value])));
    setStandingValues(Object.fromEntries((quote.standingRows ?? []).map(r => [r.id, r.value])));
  };

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="px-5 py-3 grid grid-cols-2 divide-x divide-slate-100">
          <div className="pr-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">Contract Unit Rate{mpanLabel && <span className="ml-1 font-mono text-slate-400">({mpanLabel})</span>}</div>
              <div className="text-base font-bold text-slate-900 font-mono">{(quote.unitRate ?? 0).toFixed(4)}p/kWh</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 font-medium">Calculated Total</div>
              <div className="text-base font-bold font-mono text-slate-900">{unitTotal.toFixed(4)}p/kWh</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">Variance</div>
              <div className={`text-base font-bold font-mono flex items-center gap-1.5 ${unitOk ? 'text-green-700' : 'text-amber-700'}`}>
                {unitOk
                  ? <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> 0.0000p</>
                  : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>{unitVariance > 0 ? '+' : ''}{unitVariance.toFixed(4)}p</>
                }
              </div>
            </div>
          </div>
          <div className="pl-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">Contract Standing Charge</div>
              <div className="text-base font-bold text-slate-900 font-mono">£{(quote.standingCharge ?? 0).toFixed(2)}/day</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 font-medium">Calculated Total</div>
              <div className="text-base font-bold font-mono text-slate-900">£{standTotal.toFixed(2)}/day</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">Variance</div>
              <div className={`text-base font-bold font-mono flex items-center gap-1.5 ${standOk ? 'text-green-700' : 'text-amber-700'}`}>
                {standOk
                  ? <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> £0.00</>
                  : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>{standVariance > 0 ? '+' : ''}£{standVariance.toFixed(2)}</>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Anomaly panel */}
      {allAnomalies.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-amber-200 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <h3 className="text-sm font-bold text-amber-800">Anomaly Summary — {allAnomalies.length} flag{allAnomalies.length > 1 ? 's' : ''}</h3>
          </div>
          <div className="divide-y divide-amber-200">
            {allAnomalies.map(row => {
              const val        = unitValues[row.id] ?? standingValues[row.id] ?? row.value;
              const { level, msg } = getAnomaly(row, val);
              return (
                <div key={row.id} className="flex items-center justify-between px-5 py-2.5">
                  <div>
                    <span className="text-sm font-semibold text-amber-900">{row.name}</span>
                    <span className="text-xs text-amber-700 ml-2">{msg}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {level === 'error'
                      ? <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">Error</span>
                      : <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Warning</span>
                    }
                    <button className="text-xs text-sky-500 hover:text-sky-600 underline">Escalate to Trading</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <EditableTable rows={quote.pricingRows ?? []} values={unitValues}
        onChange={(id, v) => setUnitValues(prev => ({ ...prev, [id]: v }))}
        title="Unit Rate Components" contractTotal={quote.unitRate ?? 0} unitLabel="p/kWh" disabled={verified} />
      <EditableTable rows={quote.standingRows ?? []} values={standingValues}
        onChange={(id, v) => setStandingValues(prev => ({ ...prev, [id]: v }))}
        title="Standing Charge Components" contractTotal={quote.standingCharge ?? 0} unitLabel="£/day" disabled={verified} />

      {/* Action bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-2">
          <button onClick={handleReset} disabled={verified}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-transparent border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
            Reset to original values
          </button>
          <button onClick={() => setShowSaveModal(true)} disabled={verified}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-transparent border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
            Save changes
          </button>
        </div>
        {verified ? (
          <span className="flex items-center gap-2 text-sm text-green-700 font-semibold">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            {mpanLabel ? `MPAN ${mpanLabel} Verified` : 'Pricing Verified'}
          </span>
        ) : (
          <button onClick={onMarkVerified}
            className="px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1">
            {mpanLabel ? `Mark MPAN ${mpanLabel} as Verified` : 'Mark as Verified'}
          </button>
        )}
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowSaveModal(false)} />
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-3">Save Amended Values</h3>
            <p className="text-sm text-slate-600 mb-4">Provide a reason for amending the pricing components. This will be logged to the audit trail.</p>
            <textarea rows={3} value={saveReason} onChange={e => setSaveReason(e.target.value)}
              placeholder="e.g. BSUoS component confirmed with Trading team…"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none mb-4" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-transparent border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300">Cancel</button>
              <button onClick={() => { setShowSaveModal(false); setSaveReason(''); }}
                className="px-4 py-2 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-md shadow-sm hover:shadow transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1">Save & Log</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────

export function PricingTab({ quote, onMarkVerified, verified }: Props) {
  const isMulti = quote.sites.length > 1;

  const [activeMpan, setActiveMpan]       = useState(quote.sites[0]?.mpan ?? quote.mpan ?? '');
  const [reviewedMpans, setReviewedMpans] = useState<Set<string>>(() => {
    if (!isMulti) return new Set<string>();
    return new Set(
      quote.sites
        .filter(s => getMpanPricingStatus(s) === 'Pass')
        .map(s => s.mpan)
    );
  });

  if (!isMulti) {
    return <PricingContent quote={quote} onMarkVerified={onMarkVerified} verified={verified} />;
  }

  const sites = quote.sites;

  const handleMpanVerified = (mpan: string) => {
    setReviewedMpans(prev => {
      const next = new Set(prev).add(mpan);
      if (next.size === sites.length && !verified) onMarkVerified();
      return next;
    });
  };

  const handleReviewAll = () => {
    const all = new Set(sites.map(s => s.mpan));
    setReviewedMpans(all);
    if (!verified) onMarkVerified();
  };

  const activeSite       = sites.find(s => s.mpan === activeMpan)!;
  const siteQuote        = buildSiteQuote(quote, activeSite);
  const isActiveVerified = reviewedMpans.has(activeMpan);

  return (
    <div className="space-y-4">
      <MpanSummaryBar sites={sites} getStatus={getMpanPricingStatus} verifiedSet={reviewedMpans} onReviewAll={handleReviewAll} />
      <MpanSubTabBar  sites={sites} activeMpan={activeMpan} onSelect={setActiveMpan} getStatus={getMpanPricingStatus} verifiedSet={reviewedMpans} />
      <PricingContent
        quote={siteQuote}
        onMarkVerified={() => handleMpanVerified(activeMpan)}
        verified={isActiveVerified}
        mpanLabel={activeMpan}
      />
    </div>
  );
}
