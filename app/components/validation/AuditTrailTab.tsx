'use client';
import { useState } from 'react';
// Accept audit events from either data source
interface AuditEventItem {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  detail?: string;
  notes?: string;
  category?: 'auto' | 'manual' | 'system';
}

interface Props {
  events: AuditEventItem[];
  quoteRef: string;
}

const categoryStyle: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  auto:   { icon: '⚡', color: 'text-sky-700',   bg: 'bg-sky-100',   border: 'border-sky-200' },
  manual: { icon: '👤', color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200' },
  system: { icon: '⚙',  color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
};

function fmt(ts: string) {
  const d = new Date(ts);
  return {
    date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

export function AuditTrailTab({ events, quoteRef }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => setExpanded(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Audit Trail</h2>
          <p className="text-sm text-slate-500">{quoteRef} — {events.length} events recorded</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Read-only — compliance view
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200" />
        <div className="space-y-3">
          {events.map(event => {
            const style = categoryStyle[event.category ?? 'system'];
            const { date, time } = fmt(event.timestamp);
            const isOpen = expanded.has(event.id);
            return (
              <div key={event.id} className="relative pl-14">
                <div className={`absolute left-3.5 top-3 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${style.bg} ${style.border}`}>
                  <span>{style.icon}</span>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-start justify-between p-4 cursor-pointer hover:bg-slate-50" onClick={() => toggle(event.id)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-bold ${style.color}`}>{event.action}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${style.bg} ${style.color}`}>
                          {(event.category ?? 'system') === 'auto' ? 'Automated' : (event.category ?? 'system') === 'system' ? 'System' : 'Manual'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">{event.detail ?? event.notes ?? ''}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          {event.user}
                        </span>
                        <span>·</span>
                        <span>{date}</span>
                        <span className="font-mono">{time}</span>
                      </div>
                    </div>
                    <svg className={`w-4 h-4 text-slate-400 shrink-0 ml-4 mt-0.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-0 bg-slate-50 border-t border-slate-100">
                      <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Full event detail</div>
                      <div className="font-mono text-xs text-slate-700 bg-white rounded-lg border border-slate-200 p-3 leading-relaxed">
                        <div>contract_ref: {quoteRef}</div>
                        <div>timestamp: {event.timestamp}</div>
                        <div>action: {event.action}</div>
                        <div>user: {event.user}</div>
                        <div>category: {event.category ?? 'system'}</div>
                        <div>detail: {event.detail ?? event.notes ?? ''}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
