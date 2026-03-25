'use client';
import { useState } from 'react';
import { AuditEvent } from '../data/mockData';

interface Props {
  events: AuditEvent[];
  quoteRef: string;
}

const actionStyles: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  'Auto-Approved': { icon: '✓', color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300' },
  'Manually Approved': { icon: '✓', color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300' },
  'Rejected': { icon: '✕', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300' },
  'HH Data Refreshed': { icon: '↻', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-300' },
  'Submitted for Review': { icon: '⚑', color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-300' },
  'Escalated': { icon: '↑', color: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-300' },
};

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  return {
    date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

export function AuditTrail({ events, quoteRef }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Audit Trail</h2>
          <p className="text-sm text-slate-500">{quoteRef} — {events.length} event{events.length !== 1 ? 's' : ''} recorded</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Read-only — compliance view
        </div>
      </div>

      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200" />

        <div className="space-y-4">
          {events.map((event, idx) => {
            const style = actionStyles[event.action] ?? actionStyles['Submitted for Review'];
            const { date, time } = formatTimestamp(event.timestamp);
            const isExpanded = expandedIds.has(event.id);
            const hasSnapshot = !!event.hhSnapshot;
            const isDataChanged = event.dataChanged;

            return (
              <div key={event.id} className="relative pl-14">
                {/* Timeline node */}
                <div className={`absolute left-3.5 top-3 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold ${style.color} ${style.bg} ${style.border}`}>
                  {style.icon}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div
                    className={`flex items-start justify-between p-4 ${hasSnapshot ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                    onClick={() => hasSnapshot && toggle(event.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                        <span className={`text-sm font-bold ${style.color}`}>{event.action}</span>
                        {isDataChanged && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            Data changed since previous snapshot
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 mb-1">{event.notes}</div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {event.user}
                        </span>
                        <span>·</span>
                        <span>{date}</span>
                        <span className="font-mono">{time}</span>
                      </div>
                    </div>
                    {hasSnapshot && (
                      <svg
                        className={`w-4 h-4 text-slate-400 shrink-0 ml-4 mt-0.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>

                  {/* Expanded HH snapshot */}
                  {isExpanded && event.hhSnapshot && (
                    <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">HH Data Snapshot at this event</div>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: 'EAC', value: `${event.hhSnapshot.eac.toLocaleString()} kWh` },
                          { label: 'Peak Residual', value: `${event.hhSnapshot.peakResidual > 0 ? '+' : ''}${event.hhSnapshot.peakResidual}%`, warn: Math.abs(event.hhSnapshot.peakResidual) > 5 },
                          { label: 'Off-Peak Residual', value: `${event.hhSnapshot.offPeakResidual > 0 ? '+' : ''}${event.hhSnapshot.offPeakResidual}%`, warn: Math.abs(event.hhSnapshot.offPeakResidual) > 8 },
                          { label: 'HH Days', value: `${event.hhSnapshot.hhDays} days`, warn: event.hhSnapshot.hhDays < 300 },
                        ].map((item) => (
                          <div key={item.label} className="bg-white rounded-lg border border-slate-200 p-2.5">
                            <div className="text-[10px] text-slate-500 font-medium mb-0.5">{item.label}</div>
                            <div className={`text-sm font-bold font-mono ${item.warn ? 'text-red-700' : 'text-slate-800'}`}>
                              {item.value}
                              {item.warn && <span className="ml-1 text-[10px]">⚠</span>}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Diff indicator */}
                      {isDataChanged && idx > 0 && (
                        <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                          <div className="text-xs font-semibold text-amber-800 mb-1">Changes vs previous snapshot</div>
                          <div className="text-xs text-amber-700">
                            EAC increased from previous snapshot · Peak residual variance widened · HH days unchanged
                          </div>
                        </div>
                      )}
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
