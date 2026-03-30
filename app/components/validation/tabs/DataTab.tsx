'use client';
import { useState } from 'react';
import { Contract, DataCheck, AmpIndicator, ValidationResult, MpanSite, buildMpanContract } from '../../../data/validationData';
import { MpanSummaryBar, MpanSubTabBar, MpanStatusFn } from './MpanSubTabs';

interface Props {
  contract: Contract;
  onMarkReviewed: () => void;
  reviewed: boolean;
}

// ─── Per-MPAN status derivation ───────────────────────────────────

export function getMpanDataStatus(site: MpanSite): ValidationResult {
  if (site.ampIndicators.some(a => a.severity === 'red'))   return 'Fail';
  if (site.dataChecks.some(c => c.status === 'Fail'))        return 'Fail';
  if (site.ampIndicators.some(a => a.severity === 'amber')) return 'Warning';
  if (site.dataChecks.some(c => c.status === 'Warning'))     return 'Warning';
  return 'Pass';
}

// ─── Shared result badge ──────────────────────────────────────────

function ResultBadge({ status }: { status: ValidationResult }) {
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

// ─── Single-site content (reused for both single and multi paths) ─

interface ContentProps {
  contract: Contract;
  onMarkReviewed: () => void;
  reviewed: boolean;
  mpanLabel?: string;
}

function DataContent({ contract, onMarkReviewed, reviewed, mpanLabel }: ContentProps) {
  const hasAmps = contract.ampIndicators.length > 0;

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState('');
  // amendments: checkId → amended actual value (treated as Pass)
  const [amendments, setAmendments] = useState<Record<string, string>>({});

  const effectiveStatus = (check: DataCheck): ValidationResult =>
    check.id in amendments ? 'Pass' : check.status;

  const allPass = contract.dataChecks.every(c => effectiveStatus(c) === 'Pass') && !hasAmps;

  const startEdit = (check: DataCheck) => {
    setEditingId(check.id);
    setDraftValue(amendments[check.id] ?? check.actual);
  };
  const saveEdit = (check: DataCheck) => {
    setAmendments(prev => ({ ...prev, [check.id]: draftValue }));
    setEditingId(null);
  };
  const cancelEdit = () => setEditingId(null);

  return (
    <div className="space-y-5">
      {/* Data integrity checks */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            Data Integrity Checks{mpanLabel && <span className="ml-2 font-mono text-slate-500 normal-case font-normal text-xs">— {mpanLabel}</span>}
          </h2>
          <span className="text-xs text-slate-400">
            {contract.dataChecks.filter(c => effectiveStatus(c) === 'Pass').length} of {contract.dataChecks.length} passed
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Check</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Expected</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actual</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contract.dataChecks.map(check => {
              const effStatus = effectiveStatus(check);
              const isEditing  = editingId === check.id;
              const isAmended  = check.id in amendments;
              const canEdit    = check.status !== 'Pass' && !isEditing;
              const rowHighlight = effStatus !== 'Pass' ? 'bg-amber-50/60' : isAmended ? 'bg-blue-50/40' : '';

              return (
                <tr key={check.id} className={rowHighlight}>
                  <td className="px-5 py-3 font-medium text-slate-700">{check.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{check.expected}</td>
                  <td className="px-5 py-3 font-mono text-xs">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={draftValue}
                          onChange={e => setDraftValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(check); if (e.key === 'Escape') cancelEdit(); }}
                          className="border border-blue-400 rounded px-2 py-1 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 w-40"
                        />
                        <button onClick={() => saveEdit(check)}
                          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">
                          Save
                        </button>
                        <button onClick={cancelEdit}
                          className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className={
                        effStatus === 'Pass' && isAmended ? 'text-blue-700 font-semibold' :
                        effStatus === 'Fail' ? 'text-red-700 font-semibold' :
                        effStatus === 'Warning' ? 'text-amber-700 font-semibold' :
                        'text-slate-700'
                      }>
                        {amendments[check.id] ?? check.actual}
                        {isAmended && <span className="ml-1.5 text-[10px] font-sans font-bold text-blue-500 uppercase">amended</span>}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {isAmended ? (
                      <span className="inline-flex items-center gap-1 text-blue-700 font-semibold text-xs bg-blue-50 px-2 py-0.5 rounded-full ring-1 ring-blue-200">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Approved
                      </span>
                    ) : (
                      <ResultBadge status={effStatus} />
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {canEdit && (
                      <button onClick={() => startEdit(check)}
                        title="Edit and approve this value"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    )}
                    {isAmended && !isEditing && (
                      <button onClick={() => startEdit(check)}
                        title="Re-edit this value"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Re-edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* AMP indicators */}
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
            {mpanLabel ? `MPAN ${mpanLabel} Reviewed` : 'Marked as Reviewed'}
          </span>
        ) : (
          <button onClick={onMarkReviewed}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${allPass ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-500 hover:bg-amber-600'}`}>
            {mpanLabel ? `Mark MPAN ${mpanLabel} as Reviewed` : 'Mark as Reviewed'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────

export function DataTab({ contract, onMarkReviewed, reviewed }: Props) {
  const isMulti = (contract.mpans?.length ?? 0) > 1;

  const [activeMpan, setActiveMpan] = useState(contract.mpans?.[0]?.mpan ?? contract.mpan);
  const [reviewedMpans, setReviewedMpans] = useState<Set<string>>(() => {
    if (!isMulti) return new Set<string>();
    // Auto-verify MPANs with no issues on initial load
    return new Set(
      (contract.mpans ?? [])
        .filter(s => getMpanDataStatus(s) === 'Pass')
        .map(s => s.mpan)
    );
  });

  if (!isMulti) {
    return <DataContent contract={contract} onMarkReviewed={onMarkReviewed} reviewed={reviewed} />;
  }

  const sites = contract.mpans!;

  const handleMpanReviewed = (mpan: string) => {
    setReviewedMpans(prev => {
      const next = new Set(prev).add(mpan);
      if (next.size === sites.length && !reviewed) onMarkReviewed();
      return next;
    });
  };

  const activeSite    = sites.find(s => s.mpan === activeMpan)!;
  const mpanContract  = buildMpanContract(contract, activeSite);
  const isActiveReviewed = reviewedMpans.has(activeMpan);

  return (
    <div className="space-y-4">
      <MpanSummaryBar sites={sites} getStatus={getMpanDataStatus} verifiedSet={reviewedMpans} />
      <MpanSubTabBar  sites={sites} activeMpan={activeMpan} onSelect={setActiveMpan} getStatus={getMpanDataStatus} verifiedSet={reviewedMpans} />
      <DataContent
        contract={mpanContract}
        onMarkReviewed={() => handleMpanReviewed(activeMpan)}
        reviewed={isActiveReviewed}
        mpanLabel={activeMpan}
      />
    </div>
  );
}
