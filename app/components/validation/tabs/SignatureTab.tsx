'use client';
import { useState } from 'react';
import { Contract } from '../../../data/validationData';

interface Props {
  contract: Contract;
  onVerified: () => void;
  isVerified: boolean;
}

export function SignatureTab({ contract, onVerified, isVerified }: Props) {
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<'none' | 'match' | 'no-match'>('none');
  const [contractMode, setContractMode] = useState<'econtract' | 'pdf'>('econtract');
  const [pdfConfirmed, setPdfConfirmed] = useState(false);
  const [notes, setNotes] = useState('');
  const [actionTaken, setActionTaken] = useState<'none' | 'accepted' | 'rejected' | 'info'>('none');

  const { directors } = contract.companiesHouse;
  const matchedDirector = directors.find(
    d => d.name.toLowerCase() === contract.signatoryName.toLowerCase()
  );

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerifyResult(matchedDirector ? 'match' : 'no-match');
    }, 1200);
  };

  const canProceed = isVerified || (verifyResult === 'match' && actionTaken === 'accepted');

  return (
    <div className="space-y-5">
      {/* Companies House panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Companies House Verification</h3>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-medium">Mock API</span>
        </div>
        <div className="p-5 grid grid-cols-2 gap-6">
          <div className="space-y-3">
            {[
              { label: 'Company Name', value: contract.companiesHouse.companyName },
              { label: 'Company Number', value: contract.companiesHouse.companyNumber, mono: true },
              { label: 'Registered Address', value: contract.companiesHouse.registeredAddress },
            ].map(item => (
              <div key={item.label}>
                <div className="text-xs text-slate-500 font-medium mb-0.5">{item.label}</div>
                <div className={`text-sm font-semibold text-slate-800 ${item.mono ? 'font-mono' : ''}`}>{item.value}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wide">Directors & PSC</div>
            <div className="space-y-2">
              {directors.map(dir => (
                <div key={dir.name} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm">
                  <div>
                    <div className="font-semibold text-slate-800">{dir.name}</div>
                    <div className="text-xs text-slate-500">{dir.role} · Appointed {dir.appointed}</div>
                  </div>
                  {dir.psc && (
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">PSC</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Signatory check */}
        <div className="mx-5 mb-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium mb-0.5">Contract Signatory</div>
              <div className="text-base font-bold text-slate-900">{contract.signatoryName}</div>
            </div>
            {verifyResult === 'none' && (
              <button onClick={handleVerify} disabled={verifying}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60 flex items-center gap-2">
                {verifying && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {verifying ? 'Checking Companies House…' : 'Verify Signatory'}
              </button>
            )}
            {verifyResult === 'match' && (
              <div className="flex items-center gap-2 text-green-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span className="text-sm font-bold">{contract.signatoryName} — confirmed Director</span>
              </div>
            )}
            {verifyResult === 'no-match' && (
              <div className="flex items-center gap-2 text-red-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                <span className="text-sm font-bold">Signatory not found in Companies House records</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contract type & signature */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Contract & Signature</h3>
          <div className="flex bg-slate-100 rounded-lg p-0.5 ml-auto">
            {(['econtract', 'pdf'] as const).map(mode => (
              <button key={mode} onClick={() => setContractMode(mode)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${contractMode === mode ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                {mode === 'econtract' ? 'E-Contract' : 'PDF Contract'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {contractMode === 'econtract' ? (
            <div className="space-y-4">
              {/* E-contract preview */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 font-mono text-xs leading-relaxed text-slate-700">
                <div className="text-center font-bold text-sm text-slate-900 mb-4 uppercase tracking-wider">
                  Power Supply Agreement
                </div>
                <div className="mb-2">This agreement is entered into between <strong>Engie UK Ltd</strong> and <strong>{contract.customer}</strong>.</div>
                <div className="mb-2">MPAN: {contract.mpan} &nbsp;|&nbsp; Supply period: {contract.contractStart} – {contract.contractEnd}</div>
                <div className="mb-4">Unit Rate: {contract.unitRate}p/kWh &nbsp;|&nbsp; Standing Charge: £{contract.standingCharge.toFixed(2)}/day</div>
                <div className="mt-4 pt-4 border-t border-slate-300 flex justify-between">
                  <div>
                    <div className="text-slate-500 mb-1">Signed by customer:</div>
                    <div className="italic text-slate-900 text-base font-serif">{contract.signatoryName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-500 mb-1">Date:</div>
                    <div>{contract.submissionDate}</div>
                  </div>
                </div>
              </div>

              {actionTaken === 'none' && (
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-slate-500 font-medium mb-1">Notes</label>
                    <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
                      placeholder="Optional notes…"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button onClick={() => setActionTaken('info')}
                      className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                      Request Info
                    </button>
                    <button onClick={() => setActionTaken('rejected')}
                      className="px-3 py-2 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">
                      Reject
                    </button>
                    <button onClick={() => { setActionTaken('accepted'); onVerified(); }}
                      disabled={verifyResult !== 'match'}
                      className="px-3 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg"
                      title={verifyResult !== 'match' ? 'Verify signatory first' : ''}>
                      Accept
                    </button>
                  </div>
                </div>
              )}

              {actionTaken !== 'none' && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold ${
                  actionTaken === 'accepted' ? 'bg-green-50 text-green-800 border border-green-200' :
                  actionTaken === 'rejected' ? 'bg-red-50 text-red-800 border border-red-200' :
                  'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {actionTaken === 'accepted' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  {actionTaken === 'accepted' ? 'E-contract accepted — signature verified' :
                   actionTaken === 'rejected' ? 'E-contract rejected' : 'More information requested'}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="text-sm font-semibold text-slate-800">Contract PDF</div>
                  <div className="text-xs text-slate-500 mt-0.5">{contract.ref}_signed.pdf</div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download PDF
                </button>
              </div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked={pdfConfirmed} onChange={e => { setPdfConfirmed(e.target.checked); if (e.target.checked) onVerified(); }}
                  className="mt-0.5 w-4 h-4 accent-green-600" />
                <span className="text-sm text-slate-700">
                  I confirm I have reviewed the signed PDF and the signature matches the authorised signatory — <span className="font-semibold">{contract.signatoryName}</span>.
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {isVerified && (
        <div className="flex items-center gap-2 text-sm text-green-700 font-semibold justify-end">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          Signature Verified
        </div>
      )}
    </div>
  );
}
