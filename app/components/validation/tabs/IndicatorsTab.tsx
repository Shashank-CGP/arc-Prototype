'use client';
import { Contract } from '../../../data/validationData';

interface Props {
  contract: Contract;
  onMarkReviewed: () => void;
  reviewed: boolean;
}

export function IndicatorsTab({ contract, onMarkReviewed, reviewed }: Props) {
  const hasIssues = contract.ampIndicators.length > 0;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">AMP Indicators</h3>
          <span className="text-xs text-slate-500">Quote &amp; site level checks</span>
        </div>

        {!hasIssues ? (
          <div className="flex items-center gap-3 px-5 py-8 text-sm text-green-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span className="font-semibold">No AMP conflicts detected — all site refs, start dates, and supply periods are valid.</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {contract.ampIndicators.map(ind => (
              <div key={ind.id} className={`flex items-start gap-4 px-5 py-4 ${ind.severity === 'red' ? 'bg-red-50' : 'bg-amber-50'}`}>
                <div className={`mt-1 w-3 h-3 rounded-full shrink-0 ${ind.severity === 'red' ? 'bg-red-500' : 'bg-amber-400'}`} />
                <div className="flex-1">
                  <div className={`text-sm font-bold ${ind.severity === 'red' ? 'text-red-800' : 'text-amber-800'}`}>{ind.label}</div>
                  <div className={`text-xs mt-1 ${ind.severity === 'red' ? 'text-red-600' : 'text-amber-700'}`}>{ind.detail}</div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  ind.severity === 'red' ? 'bg-red-100 text-red-700 ring-1 ring-red-200' : 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
                }`}>
                  {ind.severity === 'red' ? 'Action Required' : 'Review'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Site reference check panel */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Site Reference Check</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          {[
            { label: 'MPAN', value: contract.mpan, ok: true },
            { label: 'Contract Start', value: contract.contractStart, ok: !contract.ampIndicators.some(a => a.id === 'amp2') },
            { label: 'Supply Overlap', value: 'None detected', ok: !contract.ampIndicators.some(a => a.label.includes('overlap')) },
          ].map(item => (
            <div key={item.label} className={`rounded-lg p-4 border ${item.ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="text-xs text-slate-500 font-medium mb-1">{item.label}</div>
              <div className={`font-semibold text-sm font-mono ${item.ok ? 'text-green-800' : 'text-red-800'}`}>{item.value}</div>
              <div className={`text-xs mt-1 font-semibold ${item.ok ? 'text-green-600' : 'text-red-600'}`}>
                {item.ok ? '✓ OK' : '✗ Mismatch'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        {reviewed ? (
          <span className="flex items-center gap-2 text-sm text-green-700 font-semibold">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Marked as Reviewed
          </span>
        ) : (
          <button onClick={onMarkReviewed}
            className="px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1">
            Mark as Reviewed
          </button>
        )}
      </div>
    </div>
  );
}
