'use client';
import { Contract, DataCheck, AmpIndicator, ValidationResult } from '../../../data/validationData';

interface Props {
  contract: Contract;
  onMarkReviewed: () => void;
  reviewed: boolean;
}

function ResultIcon({ status }: { status: ValidationResult }) {
  if (status === 'Pass') return (
    <span className="inline-flex items-center gap-1 text-green-700 font-semibold text-xs bg-green-50 px-2 py-0.5 rounded-full">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      Pass
    </span>
  );
  if (status === 'Warning') return (
    <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-xs bg-amber-50 px-2 py-0.5 rounded-full">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" /></svg>
      Review
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-red-700 font-semibold text-xs bg-red-100 px-2 py-0.5 rounded-full">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      Fail
    </span>
  );
}

export function DataTab({ contract, onMarkReviewed, reviewed }: Props) {
  const hasAmps = contract.ampIndicators.length > 0;
  const allPass = contract.dataChecks.every(c => c.status === 'Pass') && !hasAmps;

  return (
    <div className="space-y-5">
      {/* Auto-validated checks */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Data Integrity Checks</h2>
          <span className="text-xs text-slate-400">{contract.dataChecks.filter(c => c.status === 'Pass').length} of {contract.dataChecks.length} passed</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Check</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Expected</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actual</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contract.dataChecks.map(check => (
              <tr key={check.id} className={check.status !== 'Pass' ? 'bg-red-50' : ''}>
                <td className="px-5 py-3 font-medium text-slate-700">{check.name}</td>
                <td className="px-5 py-3 font-mono text-xs text-slate-500">{check.expected}</td>
                <td className={`px-5 py-3 font-mono text-xs font-semibold ${check.status !== 'Pass' ? 'text-red-700' : 'text-slate-700'}`}>{check.actual}</td>
                <td className="px-5 py-3"><ResultIcon status={check.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AMP Indicators */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">AMP Indicators</h2>
          {!hasAmps && (
            <span className="text-xs text-green-700 font-semibold flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              No AMP conflicts detected
            </span>
          )}
        </div>
        {hasAmps ? (
          <div className="divide-y divide-slate-100">
            {contract.ampIndicators.map(ind => (
              <div key={ind.id} className={`flex items-start gap-4 px-5 py-4 ${ind.severity === 'red' ? 'bg-red-50' : 'bg-amber-50'}`}>
                <div className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${ind.severity === 'red' ? 'bg-red-500' : 'bg-amber-400'}`} />
                <div className="flex-1">
                  <div className={`text-sm font-semibold ${ind.severity === 'red' ? 'text-red-800' : 'text-amber-800'}`}>{ind.label}</div>
                  <div className={`text-xs mt-0.5 ${ind.severity === 'red' ? 'text-red-600' : 'text-amber-700'}`}>{ind.detail}</div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${ind.severity === 'red' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {ind.severity === 'red' ? 'Action Required' : 'Review'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-slate-400 text-sm">
            All AMP indicators clear — no conflicts, overlaps, or date discrepancies.
          </div>
        )}
      </div>

      {/* Action */}
      <div className="flex items-center justify-end gap-3">
        {reviewed ? (
          <span className="flex items-center gap-2 text-sm text-green-700 font-semibold">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Marked as Reviewed
          </span>
        ) : (
          <button onClick={onMarkReviewed}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${allPass ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-500 hover:bg-amber-600'}`}>
            Mark as Reviewed
          </button>
        )}
      </div>
    </div>
  );
}
