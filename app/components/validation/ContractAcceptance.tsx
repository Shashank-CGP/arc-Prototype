'use client';
import { useState } from 'react';
import { Contract } from '../../data/validationData';

interface Props {
  contract: Contract;
  onBack: () => void;
  onConfirm: () => void;
}

const ANALYST_NAME = 'Tom Walsh';

export function ContractAcceptance({ contract, onBack, onConfirm }: Props) {
  const [countersigned, setCountersigned] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [timestamp] = useState(() => new Date().toISOString());

  const storagePath = `/contracts/${contract.contractStart.replace(/\//g, '-')}/${contract.ref}`;

  const handleSign = () => setCountersigned(true);

  const handleConfirm = () => {
    setConfirmed(true);
    onConfirm();
  };

  if (confirmed) {
    return (
      <div className="p-6 max-w-screen-xl mx-auto">
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Contract Accepted</h1>
          <p className="text-slate-500 mb-8">The contract has been countersigned and stored successfully.</p>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-left space-y-3 mb-8">
            {[
              { label: 'Contract Ref', value: contract.ref, mono: true },
              { label: 'Customer', value: contract.customer },
              { label: 'Countersigned by', value: ANALYST_NAME },
              { label: 'Timestamp', value: new Date(timestamp).toLocaleString('en-GB'), mono: true },
              { label: 'Storage path', value: storagePath, mono: true },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-slate-500">{item.label}</span>
                <span className={`font-semibold text-slate-800 ${item.mono ? 'font-mono text-xs' : ''}`}>{item.value}</span>
              </div>
            ))}
          </div>
          <button onClick={onBack}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            Return to Validation Queue
          </button>
        </div>
      </div>
    );
  }

  const checks = [
    { label: 'Data Integrity', ok: contract.validationChecks.dataIntegrity.status !== 'Fail' },
    { label: 'Pricing Accuracy', ok: contract.validationChecks.pricingAccuracy.status !== 'Fail' },
    { label: 'Curve Alignment', ok: contract.validationChecks.curveAlignment.status !== 'Fail' },
    { label: 'AMP Indicators', ok: contract.validationChecks.ampIndicators.status !== 'Fail' },
    { label: 'ROI / Credit', ok: contract.validationChecks.roiCredit.status !== 'Fail' || contract.creditApprovalStatus === 'Approved' },
    { label: 'Signature Readiness', ok: true },
  ];

  const allChecksOk = checks.every(c => c.ok);
  const canConfirm = allChecksOk && countersigned;

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium mb-5">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Validation Detail
      </button>

      <div className="grid grid-cols-3 gap-5">
        {/* Left — contract summary + checklist */}
        <div className="col-span-2 space-y-5">
          {/* Contract summary */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Contract Summary</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
              {[
                { label: 'Contract Ref', value: contract.ref, mono: true },
                { label: 'Customer', value: contract.customer },
                { label: 'Supplier', value: contract.supplier },
                { label: 'Account Manager', value: contract.accountManager },
                { label: 'MPAN', value: contract.mpan, mono: true },
                { label: 'AQ', value: `${contract.aq.toLocaleString()} kWh` },
                { label: 'Supply Period', value: `${contract.contractStart} – ${contract.contractEnd}` },
                { label: 'Unit Rate', value: `${contract.unitRate.toFixed(4)}p/kWh` },
                { label: 'Standing Charge', value: `£${contract.standingCharge.toFixed(2)}/day` },
                { label: 'ROI', value: `${contract.roi}%` },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <dt className="text-slate-500">{item.label}</dt>
                  <dd className={`font-semibold text-slate-800 ${(item as any).mono ? 'font-mono text-xs' : ''}`}>{item.value}</dd>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory validation checklist */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Mandatory Validation Checklist</h2>
            <div className="space-y-2">
              {checks.map(c => (
                <div key={c.label} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${c.ok ? 'bg-green-50' : 'bg-red-50'}`}>
                  {c.ok
                    ? <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    : <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  }
                  <span className={`text-sm font-semibold ${c.ok ? 'text-green-800' : 'text-red-800'}`}>{c.label}</span>
                  <span className={`text-xs ml-auto ${c.ok ? 'text-green-600' : 'text-red-600'}`}>{c.ok ? 'Verified' : 'Not complete'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Storage path */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>
            <div>
              <div className="text-xs text-slate-500 font-medium">Contract will be stored to:</div>
              <div className="font-mono text-sm text-slate-800 font-semibold">{storagePath}</div>
            </div>
          </div>
        </div>

        {/* Right — countersignature panel */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Countersignature</h2>

            {!countersigned ? (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-center">
                  <div className="text-xs text-slate-500 mb-2">Signing as</div>
                  <div className="text-base font-bold text-slate-900">{ANALYST_NAME}</div>
                  <div className="text-xs text-slate-400 mt-0.5">Contract Services</div>
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                  <div className="text-slate-300 text-4xl font-serif italic mb-1">{ANALYST_NAME}</div>
                  <div className="text-xs text-slate-400">Signature preview</div>
                </div>
                <button onClick={handleSign} disabled={!allChecksOk}
                  className="w-full py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors"
                  title={!allChecksOk ? 'All validation checks must pass before signing' : ''}>
                  Sign as {ANALYST_NAME}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-serif italic text-green-800 mb-1">{ANALYST_NAME}</div>
                  <div className="text-xs text-green-700 font-semibold">Countersigned</div>
                  <div className="font-mono text-xs text-green-600 mt-1">{new Date(timestamp).toLocaleString('en-GB')}</div>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-700 font-semibold justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Countersignature applied
                </div>
              </div>
            )}
          </div>

          {/* Confirm button */}
          <button onClick={handleConfirm} disabled={!canConfirm}
            className="w-full py-3 text-sm font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-sm transition-colors"
            title={!canConfirm ? (countersigned ? 'All checks must pass' : 'Apply countersignature first') : ''}>
            {!countersigned ? 'Apply Countersignature First' : !allChecksOk ? 'Validation Incomplete' : 'Confirm Acceptance'}
          </button>

          {!allChecksOk && (
            <p className="text-xs text-red-600 text-center">
              One or more validation checks are incomplete. Resolve all issues before accepting.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
