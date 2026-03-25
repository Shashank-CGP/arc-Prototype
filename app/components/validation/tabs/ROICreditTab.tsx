'use client';
import { Contract, CreditStatus } from '../../../data/validationData';

interface Props {
  contract: Contract;
  creditStatus: CreditStatus;
  onSimulateApproval: () => void;
}

const CREDIT_THRESHOLD = 5;

export function ROICreditTab({ contract, creditStatus, onSimulateApproval }: Props) {
  const roiOk = contract.roi >= CREDIT_THRESHOLD;
  const creditRequired = !roiOk;

  return (
    <div className="space-y-5">
      {/* ROI Summary */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">ROI Summary</h3>
        <div className="grid grid-cols-3 gap-5">
          {[
            { label: 'Calculated ROI', value: `${contract.roi}%`, highlight: !roiOk ? 'red' : 'green' },
            { label: 'Credit Threshold', value: `${CREDIT_THRESHOLD}%`, highlight: 'neutral' },
            { label: 'Status', value: roiOk ? 'No action required' : 'Credit approval required', highlight: roiOk ? 'green' : 'red' },
          ].map(item => (
            <div key={item.label} className={`rounded-xl border p-4 ${
              item.highlight === 'green' ? 'bg-green-50 border-green-200' :
              item.highlight === 'red' ? 'bg-red-50 border-red-200' :
              'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-xs font-medium text-slate-500 mb-1">{item.label}</div>
              <div className={`text-2xl font-bold font-mono ${
                item.highlight === 'green' ? 'text-green-800' :
                item.highlight === 'red' ? 'text-red-800' : 'text-slate-700'
              }`}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* ROI bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>0%</span>
            <span className="font-semibold text-slate-700">Threshold: {CREDIT_THRESHOLD}%</span>
            <span>15%</span>
          </div>
          <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
            {/* Threshold line */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-slate-500 z-10" style={{ left: `${(CREDIT_THRESHOLD / 15) * 100}%` }} />
            {/* ROI fill */}
            <div
              className={`h-full rounded-full transition-all ${roiOk ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(100, (contract.roi / 15) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1.5">
            <div
              className={`text-sm font-bold ${roiOk ? 'text-green-700' : 'text-red-700'}`}
              style={{ marginLeft: `${Math.min(94, (contract.roi / 15) * 100)}%` }}
            >
              {contract.roi}%
            </div>
          </div>
        </div>
      </div>

      {/* Credit approval panel (only when below threshold) */}
      {creditRequired && (
        <div className="rounded-xl border border-red-200 overflow-hidden">
          <div className="flex items-start gap-3 px-5 py-4 bg-red-50">
            <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <div className="text-red-900 font-bold text-sm">Credit approval required before this contract can progress</div>
              <div className="text-red-700 text-xs mt-0.5">
                ROI of {contract.roi}% is below the minimum credit threshold of {CREDIT_THRESHOLD}%. This contract is blocked from proceeding to acceptance until credit approval is confirmed.
              </div>
            </div>
          </div>

          <div className="bg-white px-5 py-4 border-t border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 font-medium mb-0.5">Approval Required From</div>
                <div className="text-sm font-bold text-slate-900">Phil Marsden</div>
                <div className="text-xs text-slate-500">Credit Director</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium mb-0.5">Current Status</div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${
                  creditStatus === 'Approved' ? 'bg-green-100 text-green-800 ring-1 ring-green-300' :
                  creditStatus === 'Rejected' ? 'bg-red-100 text-red-800 ring-1 ring-red-300' :
                  'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
                }`}>
                  {creditStatus === 'Pending' && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                  {creditStatus === 'Approved' && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  {creditStatus}
                </span>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium mb-1">External system</div>
                <a href="#" onClick={e => e.preventDefault()}
                  className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                  Open Credit Management System
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500 max-w-md">
                Arc does not manage the credit approval process. Please raise an approval request in the Credit Management system and check back here once Phil Marsden has responded.
              </p>
              {/* Demo: simulate approval button */}
              {creditStatus === 'Pending' && (
                <button onClick={onSimulateApproval}
                  className="ml-4 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 shrink-0">
                  Demo: Simulate Approval ↗
                </button>
              )}
              {creditStatus === 'Approved' && (
                <span className="text-xs text-green-700 font-semibold flex items-center gap-1.5 ml-4">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Credit approved — contract can now proceed
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No action needed */}
      {!creditRequired && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-green-50 border border-green-200">
          <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <div>
            <div className="text-green-900 font-semibold text-sm">ROI above credit threshold — no approval required</div>
            <div className="text-green-700 text-xs mt-0.5">ROI of {contract.roi}% exceeds the minimum threshold of {CREDIT_THRESHOLD}%. Contract can proceed to acceptance without external credit approval.</div>
          </div>
        </div>
      )}
    </div>
  );
}
