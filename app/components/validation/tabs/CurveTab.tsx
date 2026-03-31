'use client';
import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Contract } from '../../../data/validationData';

interface Props {
  contract: Contract;
  onMarkVerified: () => void;
  verified: boolean;
  onReferToTrading: () => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-600">{p.name}: </span>
          <span className="font-mono font-semibold">{p.value.toFixed(4)}p</span>
        </div>
      ))}
      {payload.length === 2 && (
        <div className="mt-1 pt-1 border-t border-slate-100 text-amber-700 font-semibold">
          Δ {(payload[1].value - payload[0].value > 0 ? '+' : '')}{(payload[1].value - payload[0].value).toFixed(4)}p
        </div>
      )}
    </div>
  );
};

export function CurveTab({ contract, onMarkVerified, verified, onReferToTrading }: Props) {
  const [referralLogged, setReferralLogged] = useState(false);
  const isMismatch = contract.curveName !== contract.currentCurveName;

  const maxDivergence = contract.curveData.reduce((max, pt) => {
    const diff = Math.abs(pt.current - pt.original);
    return diff > max ? diff : max;
  }, 0);

  const peakPoints = contract.curveData.filter((_, i) => i >= 7 && i < 19);
  const avgPeakDiff = peakPoints.length
    ? peakPoints.reduce((s, p) => s + (p.current - p.original), 0) / peakPoints.length
    : 0;

  const handleRefer = () => {
    setReferralLogged(true);
    onReferToTrading();
  };

  // Comparison table rows
  const rows = [
    { label: 'Peak (07:00–19:00)',    origAvg: avg(contract.curveData.filter((_, i) => i >= 7 && i < 19), 'original'), currAvg: avg(contract.curveData.filter((_, i) => i >= 7 && i < 19), 'current') },
    { label: 'Off-Peak (19:00–22:00)', origAvg: avg(contract.curveData.filter((_, i) => i >= 19 && i < 22), 'original'), currAvg: avg(contract.curveData.filter((_, i) => i >= 19 && i < 22), 'current') },
    { label: 'Night (22:00–07:00)',    origAvg: avg([...contract.curveData.filter((_, i) => i >= 22), ...contract.curveData.filter((_, i) => i < 7)], 'original'), currAvg: avg([...contract.curveData.filter((_, i) => i >= 22), ...contract.curveData.filter((_, i) => i < 7)], 'current') },
  ];

  return (
    <div className="space-y-4">
      {/* Status banner */}
      {isMismatch ? (
        <div className="flex items-start gap-3 px-5 py-4 rounded-lg bg-amber-50 border border-amber-200">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-amber-900 font-semibold text-sm">Contract locked to different curve — validation required</div>
            <div className="text-amber-700 text-xs mt-0.5">
              Contract curve <span className="font-mono font-semibold">{contract.curveName}</span> has been superseded by{' '}
              <span className="font-mono font-semibold">{contract.currentCurveName}</span>. Peak divergence {avgPeakDiff > 0 ? '+' : ''}{avgPeakDiff.toFixed(2)}p/kWh.
            </div>
          </div>
          {!referralLogged ? (
            <button onClick={handleRefer}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-transparent border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 shrink-0">
              Refer to Trading
            </button>
          ) : (
            <span className="text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-1 rounded shrink-0">Referral logged</span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 px-5 py-4 rounded-lg bg-green-50 border border-green-200">
          <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <div>
            <div className="text-green-900 font-semibold text-sm">Contract aligned to approved curve</div>
            <div className="text-green-700 text-xs mt-0.5">Locked to <span className="font-mono font-semibold">{contract.curveName}</span> — current approved curve. No divergence detected.</div>
          </div>
        </div>
      )}

      {/* Curve comparison table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Curve Comparison</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Period</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Contract Curve ({contract.curveName})</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Current Approved ({contract.currentCurveName})</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Difference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(row => {
              const diff = row.currAvg - row.origAvg;
              const pct = row.origAvg > 0 ? (diff / row.origAvg) * 100 : 0;
              const isBad = Math.abs(pct) > 5;
              return (
                <tr key={row.label} className={`border-b border-slate-100 hover:bg-slate-50 ${isBad ? 'bg-amber-50/50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-slate-700">{row.label}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700">{row.origAvg.toFixed(4)}p</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700">{row.currAvg.toFixed(4)}p</td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold ${isBad ? 'text-amber-700' : 'text-slate-500'}`}>
                    {diff >= 0 ? '+' : ''}{diff.toFixed(4)}p ({pct >= 0 ? '+' : ''}{pct.toFixed(1)}%)
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-bold text-slate-800 uppercase tracking-wide">Pricing Curve Overlay — 24h Profile</div>
          {isMismatch && (
            <div className="text-xs text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2 py-1 rounded">
              Max divergence: {maxDivergence.toFixed(4)}p/kWh
            </div>
          )}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={contract.curveData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }}
              interval={3} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false}
              tickFormatter={v => `${v.toFixed(1)}p`} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {isMismatch && (
              <ReferenceLine x="07:00" stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Peak start', fontSize: 10, fill: '#92400e' }} />
            )}
            <Line type="monotone" dataKey="original" stroke="#3b82f6" strokeWidth={2}
              dot={false} name={`Contract (${contract.curveName})`} />
            <Line type="monotone" dataKey="current" stroke="#f59e0b" strokeWidth={2}
              strokeDasharray={isMismatch ? '6 3' : undefined} dot={false} name={`Current Approved (${contract.currentCurveName})`} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Action */}
      <div className="flex justify-end">
        {verified ? (
          <span className="flex items-center gap-2 text-sm text-green-700 font-semibold">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Curve Alignment Verified
          </span>
        ) : (
          <button onClick={onMarkVerified} disabled={isMismatch && !referralLogged}
            className="px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
            title={isMismatch && !referralLogged ? 'Refer to Trading before verifying' : ''}>
            Mark as Verified
          </button>
        )}
      </div>
    </div>
  );
}

function avg(pts: { original: number; current: number }[], key: 'original' | 'current') {
  if (!pts.length) return 0;
  return pts.reduce((s, p) => s + p[key], 0) / pts.length;
}
