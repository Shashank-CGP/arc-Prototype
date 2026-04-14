'use client';
import { useState } from 'react';
import { Quote, Site, buildSiteQuote } from '../../../data/mockData';
import { ValidationResult } from '../../../data/validationData';
import { CurveTab } from './CurveTab';
import { IndicatorsTab } from './IndicatorsTab';
import { MpanSummaryBar, MpanSubTabBar } from './MpanSubTabs';

interface Props {
  quote: Quote;
  onMarkVerified: () => void;
  verified: boolean;
}

// ─── Per-MPAN status derivation ───────────────────────────────────

export function getMpanQuoteStatus(site: Site): ValidationResult {
  const curveMismatch = (site.curveName ?? '') !== (site.currentCurveName ?? '');
  const redAmp        = (site.ampIndicators ?? []).some(a => a.severity === 'red');
  const amberAmp      = (site.ampIndicators ?? []).some(a => a.severity === 'amber');
  if (curveMismatch || redAmp) return 'Fail';
  if (amberAmp)                return 'Warning';
  return 'Pass';
}

// ─── Single-site content (existing QuoteTab body) ─────────────────

interface SingleProps {
  quote: Quote;
  onMarkVerified: () => void;
  verified: boolean;
  curveInitial: boolean;
  indicatorsInitial: boolean;
}

function SingleSiteQuote({ quote, onMarkVerified, verified, curveInitial, indicatorsInitial }: SingleProps) {
  const [curveVerified, setCurveVerified]           = useState(curveInitial);
  const [indicatorsVerified, setIndicatorsVerified] = useState(indicatorsInitial);

  const handleCurveVerified = () => {
    setCurveVerified(true);
    if (indicatorsVerified && !verified) onMarkVerified();
  };
  const handleIndicatorsVerified = () => {
    setIndicatorsVerified(true);
    if (curveVerified && !verified) onMarkVerified();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Quote Review — Curve &amp; Indicators</h2>
          <p className="text-xs text-slate-500 mt-0.5">Both sections must be verified before this tab is complete</p>
        </div>
        {verified && (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Quote Verified
          </span>
        )}
      </div>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${curveVerified ? 'bg-green-500' : 'bg-slate-400'}`}>
            {curveVerified ? '✓' : '1'}
          </span>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Curve Alignment</h3>
        </div>
        <CurveTab quote={quote} onMarkVerified={handleCurveVerified} verified={curveVerified} onReferToTrading={() => {}} />
      </section>

      <div className="border-t border-slate-200" />

      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${indicatorsVerified ? 'bg-green-500' : 'bg-slate-400'}`}>
            {indicatorsVerified ? '✓' : '2'}
          </span>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">AMP Indicators</h3>
        </div>
        <IndicatorsTab quote={quote} onMarkReviewed={handleIndicatorsVerified} reviewed={indicatorsVerified} />
      </section>
    </div>
  );
}

// ─── Multi-MPAN content ───────────────────────────────────────────

type MpanVerification = { curve: boolean; indicators: boolean };

function MultiSiteQuote({ quote, onMarkVerified, verified }: Omit<Props, never>) {
  const sites = quote.sites;

  // Track curve + indicators verification independently per MPAN
  const [mpanVerif, setMpanVerif] = useState<Record<string, MpanVerification>>(() => {
    const init: Record<string, MpanVerification> = {};
    sites.forEach(s => {
      const curveOk      = (s.curveName ?? '') === (s.currentCurveName ?? '');
      const indicatorsOk = (s.ampIndicators ?? []).length === 0;
      init[s.mpan] = { curve: curveOk, indicators: indicatorsOk };
    });
    return init;
  });

  const isMpanFullyVerified = (mpan: string) =>
    !!(mpanVerif[mpan]?.curve && mpanVerif[mpan]?.indicators);

  const verifiedSet = new Set(sites.filter(s => isMpanFullyVerified(s.mpan)).map(s => s.mpan));

  const updateVerif = (mpan: string, key: keyof MpanVerification) => {
    setMpanVerif(prev => {
      const next = { ...prev, [mpan]: { ...prev[mpan], [key]: true } };
      const allDone = sites.every(s => next[s.mpan]?.curve && next[s.mpan]?.indicators);
      if (allDone && !verified) onMarkVerified();
      return next;
    });
  };

  const handleReviewAll = () => {
    const allVerif: Record<string, MpanVerification> = {};
    sites.forEach(s => { allVerif[s.mpan] = { curve: true, indicators: true }; });
    setMpanVerif(allVerif);
    if (!verified) onMarkVerified();
  };

  const [activeMpan, setActiveMpan] = useState(sites[0].mpan);

  const activeSite    = sites.find(s => s.mpan === activeMpan)!;
  const siteQuote     = buildSiteQuote(quote, activeSite);
  const curveVerif    = mpanVerif[activeMpan]?.curve      ?? false;
  const indVerif      = mpanVerif[activeMpan]?.indicators ?? false;

  return (
    <div className="space-y-4">
      <MpanSummaryBar sites={sites} getStatus={getMpanQuoteStatus} verifiedSet={verifiedSet} onReviewAll={handleReviewAll} />
      <MpanSubTabBar  sites={sites} activeMpan={activeMpan} onSelect={setActiveMpan} getStatus={getMpanQuoteStatus} verifiedSet={verifiedSet} />

      {/* Per-MPAN content */}
      <div className="space-y-8">
        {/* MPAN header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Quote Review — <span className="font-mono text-sky-600">{activeMpan}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeSite.siteRef} · AQ {(activeSite.aq ?? 0).toLocaleString()} kWh · Both sections must be verified
            </p>
          </div>
          {isMpanFullyVerified(activeMpan) && (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              MPAN Verified
            </span>
          )}
        </div>

        {/* Curve section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${curveVerif ? 'bg-green-500' : 'bg-slate-400'}`}>
              {curveVerif ? '✓' : '1'}
            </span>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Curve Alignment</h3>
          </div>
          {/* Key to remount CurveTab when MPAN changes so internal referral state resets */}
          <CurveTab
            key={`curve-${activeMpan}`}
            quote={siteQuote}
            onMarkVerified={() => updateVerif(activeMpan, 'curve')}
            verified={curveVerif}
            onReferToTrading={() => {}}
          />
        </section>

        <div className="border-t border-slate-200" />

        {/* Indicators section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${indVerif ? 'bg-green-500' : 'bg-slate-400'}`}>
              {indVerif ? '✓' : '2'}
            </span>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">AMP Indicators</h3>
          </div>
          <IndicatorsTab
            key={`ind-${activeMpan}`}
            quote={siteQuote}
            onMarkReviewed={() => updateVerif(activeMpan, 'indicators')}
            reviewed={indVerif}
          />
        </section>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────

export function QuoteTab({ quote, onMarkVerified, verified }: Props) {
  if (quote.sites.length > 1) {
    return <MultiSiteQuote quote={quote} onMarkVerified={onMarkVerified} verified={verified} />;
  }

  return (
    <SingleSiteQuote
      quote={quote}
      onMarkVerified={onMarkVerified}
      verified={verified}
      curveInitial={quote.validationChecks?.curveAlignment.status === 'Pass'}
      indicatorsInitial={quote.validationChecks?.ampIndicators.status === 'Pass'}
    />
  );
}
