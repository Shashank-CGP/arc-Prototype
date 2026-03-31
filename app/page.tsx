'use client';
import { useState } from 'react';
import { initialQuotes, Quote, QuoteStatus } from './data/mockData';
import { initialContracts, Contract } from './data/validationData';
import { Sidebar } from './components/Sidebar';
import { QuoteQueue } from './components/QuoteQueue';
import { QuoteDetail } from './components/QuoteDetail';
import { SiteExpansion } from './components/SiteExpansion';
import { ApprovalModal } from './components/ApprovalModal';
import { ConfigScreen } from './components/ConfigScreen';
import { ValidationQueue } from './components/validation/ValidationQueue';
import { ValidationDetail } from './components/validation/ValidationDetail';
import { ContractAcceptance } from './components/validation/ContractAcceptance';

type Screen =
  | { type: 'queue' }
  | { type: 'detail'; quoteId: string }
  | { type: 'site'; quoteId: string; siteIndex: number }
  | { type: 'config' }
  | { type: 'validation-queue' }
  | { type: 'validation-detail'; contractId: string }
  | { type: 'contract-acceptance'; contractId: string };

interface ModalState {
  open: boolean;
  mode: 'approve' | 'reject';
  quoteId: string | null;
}

interface Toast {
  id: number;
  message: string;
  kind: 'success' | 'error' | 'info';
}

export default function Home() {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [screen, setScreen] = useState<Screen>({ type: 'queue' });
  const [modal, setModal] = useState<ModalState>({ open: false, mode: 'approve', quoteId: null });
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, kind: Toast['kind'] = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const updateQuoteStatus = (id: string, status: QuoteStatus, extra?: Partial<Quote>) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status, ...extra } : q))
    );
  };

  const handleConfirmModal = (notes: string, failureReasons: string[]) => {
    if (!modal.quoteId) return;
    const quote = quotes.find((q) => q.id === modal.quoteId);
    if (!quote) return;

    if (modal.mode === 'approve') {
      const now = new Date().toISOString();
      updateQuoteStatus(modal.quoteId, 'Approved', {
        auditTrail: [
          ...quote.auditTrail,
          {
            id: `manual-${Date.now()}`,
            timestamp: now,
            action: 'Manually Approved',
            user: 'Tom Walsh',
            notes: notes || 'Manually approved following review.',
            hhSnapshot: quote.auditTrail.find((e) => e.hhSnapshot)?.hhSnapshot,
            dataChanged: false,
          },
        ],
      });
      addToast(`${quote.ref} approved — sent to pricing engine`, 'success');
    } else {
      const now = new Date().toISOString();
      updateQuoteStatus(modal.quoteId, 'Rejected', {
        failureReasons,
        auditTrail: [
          ...quote.auditTrail,
          {
            id: `reject-${Date.now()}`,
            timestamp: now,
            action: 'Rejected',
            user: 'Tom Walsh',
            notes: notes
              ? `${notes} — Failure reasons: ${failureReasons.join(', ')}`
              : `Failure reasons: ${failureReasons.join(', ')}`,
          },
        ],
      });
      addToast(`Returned to ${quote.accountManager} — ${quote.ref} rejected`, 'error');
    }

    setModal({ open: false, mode: 'approve', quoteId: null });
    setScreen({ type: 'queue' });
  };

  const selectedQuote = (() => {
    if (screen.type === 'detail' || screen.type === 'site') {
      return quotes.find((q) => q.id === screen.quoteId) ?? null;
    }
    return null;
  })();

  const selectedContract = (() => {
    if (screen.type === 'validation-detail' || screen.type === 'contract-acceptance') {
      return contracts.find((c) => c.id === screen.contractId) ?? null;
    }
    return null;
  })();

  const updateContractStatus = (id: string, status: Contract['status']) => {
    setContracts((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar
        currentScreen={screen.type}
        onNavigate={(dest) => {
          if (dest === 'queue') setScreen({ type: 'queue' });
          else if (dest === 'validation-queue') setScreen({ type: 'validation-queue' });
          else setScreen({ type: 'config' });
        }}
      />

      <main className="flex-1 overflow-auto">
        {screen.type === 'queue' && (
          <QuoteQueue
            quotes={quotes}
            onSelectQuote={(id) => setScreen({ type: 'detail', quoteId: id })}
          />
        )}

        {screen.type === 'detail' && selectedQuote && (
          <QuoteDetail
            quote={selectedQuote}
            onBack={() => setScreen({ type: 'queue' })}
            onExpandSite={(siteIndex) =>
              setScreen({ type: 'site', quoteId: selectedQuote.id, siteIndex })
            }
            onApprove={() => setModal({ open: true, mode: 'approve', quoteId: selectedQuote.id })}
            onReject={() => setModal({ open: true, mode: 'reject', quoteId: selectedQuote.id })}
          />
        )}

        {screen.type === 'site' && selectedQuote && (
          <SiteExpansion
            site={selectedQuote.sites[screen.siteIndex]}
            onBack={() => setScreen({ type: 'detail', quoteId: selectedQuote.id })}
          />
        )}

        {screen.type === 'config' && <ConfigScreen />}

        {screen.type === 'validation-queue' && (
          <ValidationQueue
            contracts={contracts}
            onSelect={(id) => setScreen({ type: 'validation-detail', contractId: id })}
          />
        )}

        {screen.type === 'validation-detail' && selectedContract && (
          <ValidationDetail
            contract={selectedContract}
            onBack={() => setScreen({ type: 'validation-queue' })}
            onProceedToAcceptance={() =>
              setScreen({ type: 'contract-acceptance', contractId: selectedContract.id })
            }
            onUpdateStatus={(status) => updateContractStatus(selectedContract.id, status)}
          />
        )}

        {screen.type === 'contract-acceptance' && selectedContract && (
          <ContractAcceptance
            contract={selectedContract}
            onBack={() => setScreen({ type: 'validation-detail', contractId: selectedContract.id })}
            onConfirm={() => {
              updateContractStatus(selectedContract.id, 'Accepted');
            }}
          />
        )}
      </main>

      {/* Approval modal */}
      {modal.open && modal.quoteId && (() => {
        const q = quotes.find((q) => q.id === modal.quoteId);
        if (!q) return null;
        return (
          <ApprovalModal
            quote={q}
            mode={modal.mode}
            onConfirm={handleConfirmModal}
            onCancel={() => setModal({ open: false, mode: 'approve', quoteId: null })}
          />
        );
      })()}

      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 space-y-2 z-[100]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-sm font-medium text-white min-w-64 ${
              toast.kind === 'success'
                ? 'bg-green-700'
                : toast.kind === 'error'
                ? 'bg-red-700'
                : 'bg-slate-800'
            }`}
          >
            {toast.kind === 'success' && (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.kind === 'error' && (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
