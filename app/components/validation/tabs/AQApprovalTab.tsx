'use client';
import { Contract } from '../../../data/validationData';

interface Props {
  contract: Contract;
  confirmed: boolean;
  onConfirm: () => void;
}

export function AQApprovalTab({ contract, confirmed, onConfirm }: Props) {
  return (
    <div className="space-y-5">
      {/* Owner banner */}
      <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-blue-50 border border-blue-200">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <div className="text-blue-900 font-semibold text-sm">Trading Team — Final Approval Gate</div>
          <div className="text-blue-700 text-xs mt-0.5">
            AQ Approval must be confirmed by the Trading team before this contract can progress to the data sheet.
            Signature and AQ Approval may proceed in parallel, but this gate must be completed last.
          </div>
        </div>
      </div>

      {/* Contract details */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
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
            <div key={item.label} className={`rounded-lg p-3 ${(item as any).highlight ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50'}`}>
              <div className="text-xs text-slate-500 font-medium mb-1">{item.label}</div>
              <div className={`text-sm font-bold ${(item as any).highlight ? 'text-blue-900 text-lg' : 'text-slate-800'} ${(item as any).mono ? 'font-mono text-xs' : ''}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Approval panel */}
      {confirmed ? (
        <div className="flex items-center gap-3 px-5 py-5 rounded-xl bg-green-50 border border-green-200">
          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center shrink-0">
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
        <div className="rounded-xl border border-slate-200 overflow-hidden">
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
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors shrink-0">
                Demo: Confirm AQ Approval ↗
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
