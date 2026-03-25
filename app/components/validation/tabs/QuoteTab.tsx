'use client';
import { useState } from 'react';
import { Contract } from '../../../data/validationData';
import { CurveTab } from './CurveTab';
import { IndicatorsTab } from './IndicatorsTab';

interface Props {
  contract: Contract;
  onMarkVerified: () => void;
  verified: boolean;
}

export function QuoteTab({ contract, onMarkVerified, verified }: Props) {
  const [curveVerified, setCurveVerified] = useState(
    contract.validationChecks.curveAlignment.status === 'Pass'
  );
  const [indicatorsVerified, setIndicatorsVerified] = useState(
    contract.validationChecks.ampIndicators.status === 'Pass'
  );

  const bothVerified = curveVerified && indicatorsVerified;

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
      {/* Section header */}
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

      {/* Curve section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${curveVerified ? 'bg-green-500' : 'bg-slate-400'}`}>
            {curveVerified ? '✓' : '1'}
          </span>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Curve Alignment</h3>
        </div>
        <CurveTab
          contract={contract}
          onMarkVerified={handleCurveVerified}
          verified={curveVerified}
          onReferToTrading={() => {}}
        />
      </section>

      {/* Divider */}
      <div className="border-t border-slate-200" />

      {/* Indicators section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${indicatorsVerified ? 'bg-green-500' : 'bg-slate-400'}`}>
            {indicatorsVerified ? '✓' : '2'}
          </span>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">AMP Indicators</h3>
        </div>
        <IndicatorsTab
          contract={contract}
          onMarkReviewed={handleIndicatorsVerified}
          reviewed={indicatorsVerified}
        />
      </section>
    </div>
  );
}
