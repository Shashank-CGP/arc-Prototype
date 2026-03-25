'use client';
import { MpanSite, ValidationResult } from '../../../data/validationData';

export type MpanStatusFn = (site: MpanSite) => ValidationResult;

// ─── Summary bar ──────────────────────────────────────────────────

interface SummaryBarProps {
  sites: MpanSite[];
  getStatus: MpanStatusFn;
  verifiedSet: Set<string>;
}

export function MpanSummaryBar({ sites, getStatus, verifiedSet }: SummaryBarProps) {
  const passed   = sites.filter(s => verifiedSet.has(s.mpan)).length;
  const failures = sites.filter(s => !verifiedSet.has(s.mpan) && getStatus(s) === 'Fail').length;
  const warnings = sites.filter(s => !verifiedSet.has(s.mpan) && getStatus(s) === 'Warning').length;
  const pending  = sites.length - verifiedSet.size;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-3 flex items-center gap-2 flex-wrap text-sm">
      <span className="font-medium text-slate-700">
        Total MPANs: <span className="font-bold text-slate-900">{sites.length}</span>
      </span>
      <span className="text-slate-300">|</span>
      <span className={`font-medium ${passed > 0 ? 'text-green-700' : 'text-slate-400'}`}>
        Passed: <span className="font-bold">{passed}</span>
      </span>
      <span className="text-slate-300">|</span>
      <span className={`font-medium ${failures > 0 ? 'text-red-700' : 'text-slate-400'}`}>
        Failures: <span className="font-bold">{failures}</span>
      </span>
      <span className="text-slate-300">|</span>
      {warnings > 0 && (
        <>
          <span className="font-medium text-amber-700">
            Warnings: <span className="font-bold">{warnings}</span>
          </span>
          <span className="text-slate-300">|</span>
        </>
      )}
      <span className={`font-medium ${pending > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
        Pending review: <span className="font-bold">{pending}</span>
      </span>
    </div>
  );
}

// ─── Sub-tab bar ──────────────────────────────────────────────────

interface TabBarProps {
  sites: MpanSite[];
  activeMpan: string;
  onSelect: (mpan: string) => void;
  getStatus: MpanStatusFn;
  verifiedSet: Set<string>;
}

function StatusIcon({ status, verified }: { status: ValidationResult; verified: boolean }) {
  if (verified) return (
    <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
  if (status === 'Fail') return (
    <svg className="w-3.5 h-3.5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
  if (status === 'Warning') return (
    <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
  return <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0 inline-block mt-0.5" />;
}

export function MpanSubTabBar({ sites, activeMpan, onSelect, getStatus, verifiedSet }: TabBarProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
      {sites.map(site => {
        const status     = getStatus(site);
        const isVerified = verifiedSet.has(site.mpan);
        const isActive   = site.mpan === activeMpan;
        return (
          <button key={site.mpan} onClick={() => onSelect(site.mpan)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
            }`}>
            <StatusIcon status={status} verified={isVerified} />
            {site.mpan}
            {!isVerified && site.siteRef && (
              <span className="text-slate-400 font-sans">({site.siteRef})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
