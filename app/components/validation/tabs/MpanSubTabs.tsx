'use client';
import { MpanSite, ValidationResult } from '../../../data/validationData';

export type MpanStatusFn = (site: MpanSite) => ValidationResult;

// ─── Summary bar ──────────────────────────────────────────────────

interface SummaryBarProps {
  sites: MpanSite[];
  getStatus: MpanStatusFn;
  verifiedSet: Set<string>;
}

function StatusPill({ label, count, variant }: { label: string; count: number; variant: 'green' | 'red' | 'amber' | 'neutral' }) {
  const colours = {
    green:   'bg-green-50  text-green-700  ring-green-200',
    red:     'bg-red-50    text-red-700    ring-red-200',
    amber:   'bg-amber-50  text-amber-700  ring-amber-200',
    neutral: 'bg-slate-50  text-slate-500  ring-slate-200',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${colours[variant]}`}>
      {variant === 'green' && (
        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {variant === 'red' && (
        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {variant === 'amber' && (
        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
        </svg>
      )}
      {count} {label}
    </span>
  );
}

export function MpanSummaryBar({ sites, getStatus, verifiedSet }: SummaryBarProps) {
  const verified = sites.filter(s => verifiedSet.has(s.mpan)).length;
  const failures = sites.filter(s => !verifiedSet.has(s.mpan) && getStatus(s) === 'Fail').length;
  const warnings = sites.filter(s => !verifiedSet.has(s.mpan) && getStatus(s) === 'Warning').length;
  const pending  = sites.filter(s => !verifiedSet.has(s.mpan) && getStatus(s) === 'Pass').length;
  const allDone  = verified === sites.length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Left: headline */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">{sites.length} MPANs in this quote</span>
          {allDone && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full ring-1 ring-green-200">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              All verified
            </span>
          )}
        </div>
        {/* Right: status pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {verified > 0  && <StatusPill label={verified === 1 ? 'verified' : 'verified'} count={verified} variant="green" />}
          {failures > 0  && <StatusPill label={failures === 1 ? 'failed' : 'failed'} count={failures} variant="red" />}
          {warnings > 0  && <StatusPill label={warnings === 1 ? 'warning' : 'warnings'} count={warnings} variant="amber" />}
          {pending > 0   && <StatusPill label={pending === 1 ? 'pending' : 'pending'} count={pending} variant="neutral" />}
        </div>
      </div>
      {/* Per-MPAN mini-list */}
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
        {sites.map(s => {
          const isVerified = verifiedSet.has(s.mpan);
          const status     = getStatus(s);
          const colour = isVerified ? 'text-green-700' : status === 'Fail' ? 'text-red-600' : status === 'Warning' ? 'text-amber-600' : 'text-slate-400';
          const dot    = isVerified ? 'bg-green-500' : status === 'Fail' ? 'bg-red-500' : status === 'Warning' ? 'bg-amber-400' : 'bg-slate-300';
          return (
            <span key={s.mpan} className={`flex items-center gap-1.5 text-xs font-mono ${colour}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
              {s.mpan}
              <span className="font-sans text-slate-400 font-normal">({s.siteRef})</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── MPAN dropdown selector ───────────────────────────────────────

interface DropdownProps {
  sites: MpanSite[];
  activeMpan: string;
  onSelect: (mpan: string) => void;
  getStatus: MpanStatusFn;
  verifiedSet: Set<string>;
}

function statusEmoji(status: ValidationResult, verified: boolean): string {
  if (verified)             return '✓';
  if (status === 'Fail')    return '✗';
  if (status === 'Warning') return '⚠';
  return '○';
}

export function MpanSubTabBar({ sites, activeMpan, onSelect, getStatus, verifiedSet }: DropdownProps) {
  const activeSite = sites.find(s => s.mpan === activeMpan)!;
  const activeStatus   = getStatus(activeSite);
  const activeVerified = verifiedSet.has(activeMpan);

  const borderColour = activeVerified
    ? 'border-green-400 ring-green-100'
    : activeStatus === 'Fail'
      ? 'border-red-400 ring-red-100'
      : activeStatus === 'Warning'
        ? 'border-amber-400 ring-amber-100'
        : 'border-slate-300 ring-slate-100';

  const textColour = activeVerified
    ? 'text-green-700'
    : activeStatus === 'Fail'
      ? 'text-red-700'
      : activeStatus === 'Warning'
        ? 'text-amber-700'
        : 'text-slate-700';

  return (
    <div className="flex items-center gap-3">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
        Viewing MPAN
      </label>
      <div className="relative flex-1 max-w-sm">
        <select
          value={activeMpan}
          onChange={e => onSelect(e.target.value)}
          className={`w-full appearance-none bg-white border-2 rounded-lg pl-3 pr-8 py-2 text-sm font-mono font-medium shadow-sm focus:outline-none focus:ring-2 transition-colors ${borderColour} ${textColour}`}
        >
          {sites.map(site => {
            const st  = getStatus(site);
            const ver = verifiedSet.has(site.mpan);
            const prefix = statusEmoji(st, ver);
            return (
              <option key={site.mpan} value={site.mpan}>
                {prefix}  {site.mpan}  ({site.siteRef})
              </option>
            );
          })}
        </select>
        {/* Custom chevron */}
        <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>
      {/* Status badge next to dropdown */}
      <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${
        activeVerified
          ? 'bg-green-50 text-green-700 ring-green-200'
          : activeStatus === 'Fail'
            ? 'bg-red-50 text-red-700 ring-red-200'
            : activeStatus === 'Warning'
              ? 'bg-amber-50 text-amber-700 ring-amber-200'
              : 'bg-slate-50 text-slate-500 ring-slate-200'
      }`}>
        {activeVerified ? 'Verified' : activeStatus}
      </span>
    </div>
  );
}
