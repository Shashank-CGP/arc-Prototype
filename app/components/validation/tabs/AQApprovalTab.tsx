'use client';
import { Contract, AQ_APPROVAL_THRESHOLD } from '../../../data/validationData';

interface Props {
  contract: Contract;
  confirmed: boolean;
  onConfirm: () => void;
}

export function AQApprovalTab({ contract, confirmed, onConfirm }: Props) {
  const needsApproval = contract.aq >= AQ_APPROVAL_THRESHOLD;

  // Below threshold — auto-bypass panel
  if (!needsApproval) {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3 px-5 py-4 rounded-lg bg-green-50 border border-green-200">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <div className="text-green-900 font-semibold text-sm">AQ Approval Not Required</div>
            <div className="text-green-700 text-xs mt-0.5">
              This contract&apos;s AQ of <span className="font-bold">{contract.aq.toLocaleString()} kWh</span> is below
              the approval threshold of <span className="font-bold">{AQ_APPROVAL_THRESHOLD.toLocaleString()} kWh</span>.
              It will automatically advance to the Data Sheet once Contract Services complete all their checks.
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5 text-xs text-slate-500 space-y-1">
          <p><span className="font-semibold text-slate-700">Threshold:</span> {AQ_APPROVAL_THRESHOLD.toLocaleString()} kWh</p>
          <p><span className="font-semibold text-slate-700">This contract&apos;s AQ:</span> {contract.aq.toLocaleString()} kWh</p>
          <p className="text-green-600 font-medium">✓ Below threshold — Trading gate bypassed automatically</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* AQ threshold context */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        AQ <span className="font-bold text-slate-800 mx-1">{contract.aq.toLocaleString()} kWh</span> ≥ threshold
        <span className="font-bold text-slate-800 mx-1">{AQ_APPROVAL_THRESHOLD.toLocaleString()} kWh</span> — Trading approval required before this contract can progress.
      </div>
      {/* Owner banner */}
      <div className="flex items-start gap-3 px-5 py-4 rounded-lg bg-sky-50 border border-sky-200">
        <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <div className="text-sky-900 font-semibold text-sm">Trading Team — Final Approval Gate</div>
          <div className="text-sky-700 text-xs mt-0.5">
            AQ Approval must be confirmed by the Trading team before this contract can progress to the data sheet.
            Signature and AQ Approval may proceed in parallel, but this gate must be completed last.
          </div>
        </div>
      </div>

      {/* Contract details */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Contract Details for AQ Review</h3>
        <div className="grid grid-cols-3 gap-5">
          {[
            { label: 'Annual Quantity (AQ)', value: `${contract.aq.toLocaleString()} kWh`, highlight: true },
            { label: 'Contract Ref', value: contract.ref, mono: true },
            { label: 'Customer', value: contract.customer },
            { label: 'Supplier', value: contract.supplier },
            { label: 'Supply Period', value: `${contract.contractStart} – ${contract.contractEnd}` },
            { label: 'Contract Type', value: contract.contractType },
          ].map(item => (
            <div key={item.label} className={`rounded-lg p-3 ${(item as any).highlight ? 'bg-sky-50 border border-sky-100' : 'bg-slate-50'}`}>
              <div className="text-xs text-slate-500 font-medium mb-1">{item.label}</div>
              <div className={`text-sm font-bold ${(item as any).highlight ? 'text-sky-900 text-lg' : 'text-slate-800'} ${(item as any).mono ? 'font-mono text-xs' : ''}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Approval panel */}
      {confirmed ? (
        <div className="flex items-center gap-3 px-5 py-5 rounded-lg bg-green-50 border border-green-200">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <div className="text-green-900 font-bold text-sm">AQ Approved — contract may proceed to data sheet</div>
            <div className="text-green-700 text-xs mt-0.5">
              The Trading team has confirmed the Annual Quantity. The "Proceed to Data Sheet" action is now available.
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-sm font-semibold text-slate-700">Awaiting Trading team confirmation</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              The Trading team must review and approve the Annual Quantity before this contract can be sent to the data sheet.
              This is the final gate in the validation workflow.
            </p>
          </div>
          <div className="px-5 py-4 bg-white flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium mb-0.5">Approval owner</div>
              <div className="text-sm font-bold text-slate-900">Trading Team</div>
              <div className="text-xs text-slate-500">AQ validation &amp; sign-off</div>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs text-slate-400 max-w-xs text-right">
                Arc does not manage the Trading approval process. Raise the request externally and confirm below once approved.
              </p>
              <button onClick={onConfirm}
                className="px-4 py-2 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-md shadow-sm hover:shadow transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 shrink-0">
                Demo: Confirm AQ Approval ↗
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
