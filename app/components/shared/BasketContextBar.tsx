'use client';
import { Basket } from '../../data/validationData';

interface SiblingItem {
  id: string;
  ref: string;
  type: 'quote' | 'contract';
  status: string;
}

interface Props {
  basket: Basket;
  currentRef: string;
  siblings: SiblingItem[];
  onNavigate: (type: 'quote' | 'contract', id: string) => void;
}

export function BasketContextBar({ basket, currentRef, siblings, onNavigate }: Props) {
  if (siblings.length === 0) return null;

  const currentIndex = siblings.findIndex(s => s.ref === currentRef);
  const position = currentIndex >= 0 ? currentIndex + 1 : null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 mb-4 bg-indigo-50 border border-indigo-200 rounded-lg">
      <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>

      <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
        <span className="text-xs font-semibold text-indigo-800">{basket.name}</span>
        {position && (
          <span className="text-xs text-indigo-500">
            ({position} of {siblings.length})
          </span>
        )}
        <span className="text-indigo-300">|</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {siblings.map(s => {
            const isCurrent = s.ref === currentRef;
            return (
              <button
                key={s.id}
                onClick={() => !isCurrent && onNavigate(s.type, s.id)}
                disabled={isCurrent}
                className={`px-2 py-0.5 text-xs font-mono rounded-md transition-colors ${
                  isCurrent
                    ? 'bg-indigo-200 text-indigo-900 font-semibold cursor-default'
                    : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-100 cursor-pointer'
                }`}
              >
                {s.ref}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
