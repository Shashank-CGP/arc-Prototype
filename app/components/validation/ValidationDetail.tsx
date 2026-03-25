'use client';
import { useState } from 'react';
import { Contract, ValidationResult, CreditStatus } from '../../data/validationData';
import { DataTab } from './tabs/DataTab';
import { PricingTab } from './tabs/PricingTab';
import { QuoteTab } from './tabs/QuoteTab';
import { SignatureTab } from './tabs/SignatureTab';
import { AQApprovalTab } from './tabs/AQApprovalTab';
import { AuditTrailTab } from './AuditTrailTab';

interface Props {
  contract: Contract;
  onBack: () => void;
  onProceedToAcceptance: () => void;
  onUpdateStatus: (status: Contract['status']) => void;
}

type AllTabs = 'overview' | 'data' | 'pricing' | 'quote' | 'signature' | 'aq-approval' | 'audit';

const TABS: { id: AllTabs; label: string }[] = [
  { id: 'overview',    label: 'Overview' },
  { id: 'data',        label: 'Data' },
  { id: 'pricing',     label: 'Pricing' },
  { id: 'quote',       label: 'Quote' },
  { id: 'signature',   label: 'Signature' },
  { id: 'aq-approval', label: 'AQ Approval' },
];

function ResultIcon({ status, size = 'sm' }: { status: ValidationResult; size?: 'sm' | 'lg' }) {
  const sz = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  if (status === 'Pass')    return <svg className={`${sz} text-green-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
  if (status === 'Fail')    return <svg className={`${sz} text-red-600`}   fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
  if (status === 'Warning') return <svg className={`${sz} text-amber-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
  return <svg className={`${sz} text-slate-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="9" /></svg>;
}

export function ValidationDetail({ contract, onBack, onProceedToAcceptance, onUpdateStatus }: Props) {
  const checks = contract.validationChecks;

  const [activeTab, setActiveTab] = useState<AllTabs>('overview');

  // Derive initial quote status — pass only if both curve and indicators pass
  const quoteInitiallyVerified =
    checks.curveAlignment.status === 'Pass' && checks.ampIndicators.status === 'Pass';

  const [tabVerified, setTabVerified] = useState<Record<string, boolean>>({
    data:        checks.dataIntegrity.status === 'Pass',
    pricing:     checks.pricingAccuracy.status === 'Pass',
    quote:       quoteInitiallyVerified,
    signature:   checks.signatureReadiness.status === 'Pass',
    aqApproval:  false, // always starts as pending — Trading team must confirm
  });

  const [creditStatus, setCreditStatus] = useState<CreditStatus>(contract.creditApprovalStatus);

  // AQ Approval is the final gate — all checks must be done AND aq approved
  const allVerified = Object.values(tabVerified).every(Boolean);

  const markVerified = (tab: string) => setTabVerified(p => ({ ...p, [tab]: true }));

  const handleSimulateApproval = () => setCreditStatus('Approved');

  // Derived quote validation status (worst of curve + indicators)
  const quoteStatus: ValidationResult = tabVerified.quote ? 'Pass' :
    [checks.curveAlignment.status, checks.ampIndicators.status].includes('Fail') ? 'Fail' :
    [checks.curveAlignment.status, checks.ampIndicators.status].includes('Warning') ? 'Warning' :
    'Pass';

  const quoteMessage: string = (() => {
    if (checks.curveAlignment.status !== 'Pass') return checks.curveAlignment.message;
    if (checks.ampIndicators.status !== 'Pass') return checks.ampIndicators.message;
    return 'Curve and indicators verified';
  })();

  // Status counts excluding roiCredit (shown as inline indicators, not a tab)
  const relevantChecks = [
    checks.dataIntegrity, checks.pricingAccuracy,
    checks.curveAlignment, checks.ampIndicators, checks.signatureReadiness,
  ];
  const failCount = relevantChecks.filter(c => c.status === 'Fail').length;
  const warnCount = relevantChecks.filter(c => c.status === 'Warning').length;

  // Badge dot for tab bar
  const tabBadge = (tab: AllTabs): ValidationResult | null => {
    if (tab === 'data')        return checks.dataIntegrity.status;
    if (tab === 'pricing')     return checks.pricingAccuracy.status;
    if (tab === 'quote')       return quoteStatus;
    if (tab === 'signature')   return checks.signatureReadiness.status;
    if (tab === 'aq-approval') return tabVerified.aqApproval ? 'Pass' : null;
    return null;
  };

  const badgeDot = (result: ValidationResult | null) => {
    if (!result || result === 'Pass') return null;
    return <span className={`ml-1.5 inline-block w-1.5 h-1.5 rounded-full ${result === 'Fail' ? 'bg-red-500' : 'bg-amber-400'}`} />;
  };

  // Multi-MPAN context for checklist labels
  const mpanCount   = contract.mpans?.length ?? 0;
  const mpanBadge   = mpanCount > 1 ? ` (${mpanCount} MPANs)` : '';

  // Overview checklist — 5 items mapping to the 5 content tabs
  const checklistItems: { key: string; label: string; message: string; status: ValidationResult; tab: AllTabs }[] = [
    {
      key: 'data',
      label: `Data Integrity${mpanBadge}`,
      message: checks.dataIntegrity.message,
      status: tabVerified.data ? 'Pass' : checks.dataIntegrity.status,
      tab: 'data',
    },
    {
      key: 'pricing',
      label: `Pricing Accuracy${mpanBadge}`,
      message: checks.pricingAccuracy.message,
      status: tabVerified.pricing ? 'Pass' : checks.pricingAccuracy.status,
      tab: 'pricing',
    },
    {
      key: 'quote',
      label: `Quote — Curve & Indicators${mpanBadge}`,
      message: quoteMessage,
      status: quoteStatus,
      tab: 'quote',
    },
    {
      key: 'signature',
      label: 'Signature Readiness',
      message: checks.signatureReadiness.message,
      status: tabVerified.signature ? 'Pass' : checks.signatureReadiness.status,
      tab: 'signature',
    },
    {
      key: 'aqApproval',
      label: 'AQ Approval',
      message: tabVerified.aqApproval
        ? 'Confirmed by Trading team'
        : 'Awaiting Trading team confirmation — final gate',
      status: tabVerified.aqApproval ? 'Pass' : 'Pending',
      tab: 'aq-approval',
    },
  ];

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium mb-5">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Validation Queue
      </button>

      {/* Contract header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold font-mono text-slate-900">{contract.ref}</h1>
              <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${contract.contractType === 'New Business' ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-300' : 'bg-indigo-100 text-indigo-800 ring-1 ring-indigo-300'}`}>
                {contract.contractType}
              </span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                contract.status === 'Auto-Approved' ? 'bg-green-100 text-green-800 ring-1 ring-green-300' :
                contract.status === 'Manual Review' ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300' :
                contract.status === 'Accepted'       ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-300' :
                'bg-red-100 text-red-800 ring-1 ring-red-300'}`}>
                {contract.status}
              </span>
            </div>
            <p className="text-lg font-semibold text-slate-700">{contract.customer}</p>
            <p className="text-sm text-slate-500 mt-0.5">{contract.supplier} · {contract.contractStart} – {contract.contractEnd}</p>
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={() => setActiveTab('audit')}
              className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              Audit Trail
            </button>
            <button onClick={onProceedToAcceptance} disabled={!allVerified}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
              title={!allVerified ? (!tabVerified.aqApproval ? 'AQ Approval must be confirmed by the Trading team before proceeding' : 'All validation checks must be complete') : ''}>
              Proceed to Data Sheet →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 mt-4 pt-4 border-t border-slate-100">
          {[
            { label: 'Account Manager', value: contract.accountManager },
            { label: 'MPAN', value: contract.mpan, mono: true },
            { label: 'AQ', value: `${contract.aq.toLocaleString()} kWh` },
            { label: 'Unit Rate', value: `${contract.unitRate.toFixed(4)}p/kWh` },
            { label: 'Standing Charge', value: `£${contract.standingCharge.toFixed(2)}/day` },
          ].map(item => (
            <div key={item.label}>
              <div className="text-xs text-slate-500 font-medium mb-0.5">{item.label}</div>
              <div className={`text-sm font-semibold text-slate-900 ${(item as any).mono ? 'font-mono text-xs' : ''}`}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Status banner */}
      {contract.status === 'Auto-Approved' ? (
        <div className="flex items-center gap-3 px-5 py-4 mb-4 rounded-xl bg-green-50 border border-green-200">
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <div>
            <div className="text-green-900 font-semibold text-sm">Auto-Approved — all checks passed</div>
            <div className="text-green-700 text-xs mt-0.5">Confirm AQ Approval on the Trading team tab to proceed to the data sheet.</div>
          </div>
        </div>
      ) : contract.status === 'Manual Review' ? (
        <div className="flex items-center gap-3 px-5 py-4 mb-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div>
            <div className="text-amber-900 font-semibold text-sm">
              Manual Review Required — {failCount} failure{failCount !== 1 ? 's' : ''}{warnCount > 0 ? `, ${warnCount} warning${warnCount !== 1 ? 's' : ''}` : ''}
            </div>
            <div className="text-amber-700 text-xs mt-0.5">Review flagged tabs and resolve all issues. AQ Approval must be confirmed last before the contract can proceed.</div>
          </div>
        </div>
      ) : null}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-5 overflow-x-auto">
        {TABS.map(tab => {
          const badge = tabBadge(tab.id);
          const isAQApproval = tab.id === 'aq-approval';
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors -mb-px ${
                activeTab === tab.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              } ${isAQApproval && !tabVerified.aqApproval ? 'font-semibold' : ''}`}>
              {tab.label}
              {isAQApproval && !tabVerified.aqApproval && (
                <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                  Final gate
                </span>
              )}
              {badgeDot(badge)}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-5">
          {/* Left: checklist */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Validation Checklist</h2>
            <div className="space-y-1">
              {checklistItems.map((item, i) => {
                const isLast = i === checklistItems.length - 1;
                return (
                  <button key={item.key} onClick={() => setActiveTab(item.tab)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group text-left ${isLast ? 'mt-2 border border-dashed border-blue-200 bg-blue-50/40 hover:bg-blue-50' : ''}`}>
                    <ResultIcon status={item.status} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold ${isLast ? 'text-blue-800' : 'text-slate-800'} group-hover:text-blue-700`}>
                        {item.label}
                        {isLast && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">Final gate</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{item.message}</div>
                    </div>
                    <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
            </div>

            {/* ROI & Credit approval indicators */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Approval Indicators</h3>
              <div className="space-y-2">
                {/* ROI */}
                <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    {contract.roi >= 5
                      ? <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      : <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    }
                    <div>
                      <div className="text-sm font-semibold text-slate-800">ROI</div>
                      <div className="text-xs text-slate-500">{contract.roi}% — threshold 5%</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    contract.roi >= 5 ? 'bg-green-100 text-green-800 ring-1 ring-green-300' : 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
                  }`}>
                    {contract.roi >= 5 ? 'Passed' : 'Awaiting Commercial team'}
                  </span>
                </div>

                {/* Credit */}
                <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    {(contract.roi >= 5 || creditStatus === 'Approved')
                      ? <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      : <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    }
                    <div>
                      <div className="text-sm font-semibold text-slate-800">Credit</div>
                      <div className="text-xs text-slate-500">
                        {contract.roi >= 5 ? 'No approval required' : 'Approver: Phil Marsden (Credit Director)'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {contract.roi >= 5 ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 ring-1 ring-green-300">Passed</span>
                    ) : creditStatus === 'Approved' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 ring-1 ring-green-300">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Approved
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 ring-1 ring-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Awaiting Credit team
                        </span>
                        <button onClick={handleSimulateApproval}
                          className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100">
                          Demo: Approve ↗
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: contract summary + progress */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Contract Summary</h2>
              <dl className="space-y-2.5 text-sm">
                {[
                  { label: 'Contract Ref', value: contract.ref, mono: true },
                  { label: 'Customer', value: contract.customer },
                  { label: 'Supplier', value: contract.supplier },
                  { label: 'Supply Period', value: `${contract.contractStart} – ${contract.contractEnd}` },
                  { label: 'AQ', value: `${contract.aq.toLocaleString()} kWh${mpanCount > 1 ? ` across ${mpanCount} MPANs` : ''}` },
                  { label: 'Unit Rate', value: `${contract.unitRate.toFixed(4)}p/kWh` },
                  { label: 'Standing Charge', value: `£${contract.standingCharge.toFixed(2)}/day` },
                  { label: 'ROI', value: `${contract.roi}%`, warn: contract.roi < 5 },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center">
                    <dt className="text-slate-500">{item.label}</dt>
                    <dd className={`font-semibold ${(item as any).warn ? 'text-red-700' : 'text-slate-800'} ${(item as any).mono ? 'font-mono text-xs' : ''}`}>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Review progress */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3">Review Progress</h2>
              {[
                { key: 'data',       label: mpanCount > 1 ? `Data (${mpanCount} MPANs)` : 'Data' },
                { key: 'pricing',    label: mpanCount > 1 ? `Pricing (${mpanCount} MPANs)` : 'Pricing' },
                { key: 'quote',      label: mpanCount > 1 ? `Quote (${mpanCount} MPANs)` : 'Quote (Curve & Indicators)' },
                { key: 'signature',  label: 'Signature' },
                { key: 'aqApproval', label: 'AQ Approval', final: true },
              ].map(({ key, label, final }) => (
                <div key={key} className={`flex items-center justify-between py-1.5 ${final ? 'mt-1 pt-2 border-t border-slate-100' : ''}`}>
                  <span className={`text-sm text-slate-600 ${final ? 'font-semibold' : ''}`}>
                    {label}
                    {final && <span className="ml-1.5 text-xs text-blue-600 font-normal">(final gate)</span>}
                  </span>
                  {tabVerified[key]
                    ? <span className="text-xs text-green-700 font-semibold flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Complete</span>
                    : <span className="text-xs text-amber-700 font-semibold">Pending</span>}
                </div>
              ))}
            </div>

            {/* AQ Approval call-to-action if all other tabs done */}
            {!tabVerified.aqApproval && ['data','pricing','quote','signature'].every(k => tabVerified[k]) && (
              <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-blue-900">All checks complete — AQ Approval pending</div>
                  <div className="text-xs text-blue-700 mt-0.5">Confirm Trading team approval to unlock "Proceed to Data Sheet"</div>
                </div>
                <button onClick={() => setActiveTab('aq-approval')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shrink-0 ml-3">
                  Go to AQ Approval →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'data'        && <DataTab contract={contract} onMarkReviewed={() => markVerified('data')} reviewed={tabVerified.data} />}
      {activeTab === 'pricing'     && <PricingTab contract={contract} onMarkVerified={() => markVerified('pricing')} verified={tabVerified.pricing} />}
      {activeTab === 'quote'       && <QuoteTab contract={contract} onMarkVerified={() => markVerified('quote')} verified={tabVerified.quote} />}
      {activeTab === 'signature'   && <SignatureTab contract={contract} onVerified={() => markVerified('signature')} isVerified={tabVerified.signature} />}
      {activeTab === 'aq-approval' && <AQApprovalTab contract={contract} confirmed={tabVerified.aqApproval} onConfirm={() => markVerified('aqApproval')} />}
      {activeTab === 'audit'       && <AuditTrailTab events={contract.auditTrail} contractRef={contract.ref} />}
    </div>
  );
}
