'use client';
import { useState } from 'react';
import { Quote } from '../data/mockData';

const FAILURE_REASONS = [
  'EAC out of tolerance',
  'HH days insufficient',
  'Residual peak exceeded',
  'Residual off-peak exceeded',
  'Hourly accuracy below threshold',
];

interface Props {
  quote: Quote;
  mode: 'approve' | 'reject';
  onConfirm: (notes: string, failureReasons: string[]) => void;
  onCancel: () => void;
}

export function ApprovalModal({ quote, mode, onConfirm, onCancel }: Props) {
  const [notes, setNotes] = useState('');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [customReason, setCustomReason] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  const handleConfirm = () => {
    const allReasons = [
      ...selectedReasons,
      ...(customReason.trim() ? [customReason.trim()] : []),
    ];
    onConfirm(notes, allReasons);
  };

  const isApprove = mode === 'approve';
  const canConfirm = isApprove || selectedReasons.length > 0;

  const failureCount = quote.toleranceResults.filter((r) => r.result === 'Fail').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isApprove ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isApprove ? 'bg-green-500' : 'bg-red-500'}`}>
                {isApprove ? (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className={`text-base font-bold ${isApprove ? 'text-green-900' : 'text-red-900'}`}>
                  {isApprove ? 'Approve Curve' : 'Reject Curve'}
                </h2>
                <p className={`text-xs ${isApprove ? 'text-green-700' : 'text-red-700'}`}>
                  {isApprove ? 'Quote will be sent to pricing engine' : 'Quote will be returned to Account Manager'}
                </p>
              </div>
            </div>
            <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Quote summary */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Quote Summary</div>
            <div className="grid grid-cols-2 gap-2.5 text-sm">
              <div>
                <span className="text-slate-500">Ref: </span>
                <span className="font-mono font-semibold text-slate-800">{quote.ref}</span>
              </div>
              <div>
                <span className="text-slate-500">Customer: </span>
                <span className="font-medium text-slate-800">{quote.customer}</span>
              </div>
              <div>
                <span className="text-slate-500">AM: </span>
                <span className="font-medium text-slate-800">{quote.accountManager}</span>
              </div>
              <div>
                <span className="text-slate-500">EAC: </span>
                <span className="font-mono font-semibold text-slate-800">{quote.eac.toLocaleString()} kWh</span>
              </div>
            </div>
            {failureCount > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2 text-xs text-amber-700">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {failureCount} tolerance failure{failureCount > 1 ? 's' : ''} detected on this quote
              </div>
            )}
          </div>

          {/* Failure reasons — reject only */}
          {!isApprove && (
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Failure Reasons <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {FAILURE_REASONS.map((reason) => (
                  <label key={reason} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => toggleReason(reason)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        selectedReasons.includes(reason)
                          ? 'bg-red-500 border-red-500'
                          : 'border-slate-300 group-hover:border-red-400'
                      }`}
                    >
                      {selectedReasons.includes(reason) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span
                      onClick={() => toggleReason(reason)}
                      className={`text-sm ${selectedReasons.includes(reason) ? 'text-red-800 font-medium' : 'text-slate-700'}`}
                    >
                      {reason}
                    </span>
                  </label>
                ))}

                {/* Add custom reason */}
                {!showCustomInput ? (
                  <button
                    onClick={() => setShowCustomInput(true)}
                    className="flex items-center gap-1.5 text-sm text-sky-500 hover:text-sky-600 font-medium mt-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add custom reason
                  </button>
                ) : (
                  <div className="mt-1">
                    <input
                      type="text"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Enter custom failure reason…"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Notes {isApprove ? <span className="text-slate-400 font-normal">(optional)</span> : ''}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isApprove
                  ? 'Add any notes for the pricing team…'
                  : 'Provide additional context for the Account Manager…'
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-transparent border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isApprove
                ? 'bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1'
                : 'bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1'
            }`}
          >
            {isApprove ? 'Confirm Approval' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
}
