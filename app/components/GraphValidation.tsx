'use client';
import { useState } from 'react';
import React from 'react';

type GraphStatus = 'Pass' | 'Fail' | 'Warning' | 'Pending';

interface GraphCheck {
  id: string;
  name: string;
  description: string;
  status: GraphStatus;
  value?: string;
  threshold?: string;
}

type StatusConfig = {
  label: string;
  badge: string;
  icon: React.ReactElement;
};

const mockGraphChecks: GraphCheck[] = [
  {
    id: 'node-connectivity',
    name: 'Node Connectivity',
    description: 'All nodes in the graph are reachable from the source node',
    status: 'Pass',
    value: '142 nodes connected',
    threshold: '≥ 1 connected component',
  },
  {
    id: 'edge-weight',
    name: 'Edge Weight Integrity',
    description: 'All edge weights are within the expected tolerance range',
    status: 'Warning',
    value: '3 edges above threshold',
    threshold: '0 anomalous edges',
  },
  {
    id: 'cycle-detection',
    name: 'Cycle Detection',
    description: 'No invalid cycles detected in the directed graph',
    status: 'Pass',
    value: 'No cycles found',
    threshold: '0 cycles',
  },
  {
    id: 'flow-balance',
    name: 'Flow Balance',
    description: 'Supply and demand nodes are balanced across the network',
    status: 'Fail',
    value: 'Imbalance: +12.4 MWh',
    threshold: '±0.5 MWh tolerance',
  },
  {
    id: 'path-latency',
    name: 'Critical Path Latency',
    description: 'Settlement path latency within acceptable bounds',
    status: 'Pass',
    value: '4 hops (max path)',
    threshold: '≤ 8 hops',
  },
  {
    id: 'data-completeness',
    name: 'Data Completeness',
    description: 'All required node attributes are populated',
    status: 'Pending',
    value: '—',
    threshold: '100% populated',
  },
];

const statusConfig: Record<GraphStatus, StatusConfig> = {
  Pass: {
    label: 'Pass',
    badge: 'bg-green-100 text-green-700 border border-green-200',
    icon: (
      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  Fail: {
    label: 'Fail',
    badge: 'bg-red-100 text-red-700 border border-red-200',
    icon: (
      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  Warning: {
    label: 'Warning',
    badge: 'bg-amber-100 text-amber-700 border border-amber-200',
    icon: (
      <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  Pending: {
    label: 'Pending',
    badge: 'bg-slate-100 text-slate-600 border border-slate-200',
    icon: (
      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
};

export function GraphValidation() {
  const [checks, setChecks] = useState<GraphCheck[]>(mockGraphChecks);
  const [runningValidation, setRunningValidation] = useState(false);

  const passed  = checks.filter(c => c.status === 'Pass').length;
  const failed  = checks.filter(c => c.status === 'Fail').length;
  const warned  = checks.filter(c => c.status === 'Warning').length;
  const pending = checks.filter(c => c.status === 'Pending').length;

  const handleRunValidation = () => {
    setRunningValidation(true);
    // Simulate async validation run
    setTimeout(() => {
      setChecks(prev =>
        prev.map(c => c.status === 'Pending' ? { ...c, status: 'Pass', value: 'Validated' } : c)
      );
      setRunningValidation(false);
    }, 1800);
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Graph Validation</h1>
          <p className="text-sm text-slate-500 mt-1">
            Validate network graph integrity, flow balance, and data completeness before settlement.
          </p>
        </div>
        <button
          onClick={handleRunValidation}
          disabled={runningValidation}
          className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-md shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {runningValidation ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Running…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run Validation
            </>
          )}
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Passed',   value: passed,  colour: 'text-green-700 bg-green-50 border-green-200' },
          { label: 'Failed',   value: failed,  colour: 'text-red-700   bg-red-50   border-red-200'   },
          { label: 'Warnings', value: warned,  colour: 'text-amber-700 bg-amber-50 border-amber-200' },
          { label: 'Pending',  value: pending, colour: 'text-slate-600 bg-slate-50 border-slate-200' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-lg border p-4 ${stat.colour}`}>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs font-medium mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Checks table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Validation Checks</h2>
          <span className="text-xs text-slate-400">{checks.length} checks total</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Check</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Value</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Threshold</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {checks.map(check => {
              const cfg = statusConfig[check.status];
              return (
                <tr key={check.id} className={`hover:bg-slate-50 ${check.status === 'Fail' ? 'bg-red-50/40' : check.status === 'Warning' ? 'bg-amber-50/40' : ''}`}>
                  <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{check.name}</td>
                  <td className="px-4 py-3 text-slate-500">{check.description}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{check.value ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{check.threshold ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.badge}`}>
                      {cfg.icon}
                      {cfg.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      {(failed > 0 || warned > 0) && (
        <div className={`mt-4 rounded-lg border px-5 py-4 flex items-center justify-between ${
          failed > 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
        }`}>
          <div>
            <div className={`text-sm font-semibold ${failed > 0 ? 'text-red-900' : 'text-amber-900'}`}>
              {failed > 0
                ? `${failed} check${failed > 1 ? 's' : ''} failed — graph cannot proceed to settlement`
                : `${warned} warning${warned > 1 ? 's' : ''} — review before proceeding`}
            </div>
            <div className={`text-xs mt-0.5 ${failed > 0 ? 'text-red-700' : 'text-amber-700'}`}>
              Resolve all failures and review warnings before submitting for settlement.
            </div>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-transparent border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shrink-0 ml-4">
            Export Report
          </button>
        </div>
      )}

      {failed === 0 && warned === 0 && pending === 0 && (
        <div className="mt-4 rounded-lg border bg-green-50 border-green-200 px-5 py-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <div className="text-sm font-semibold text-green-900">All checks passed — graph is valid</div>
            <div className="text-xs text-green-700 mt-0.5">Graph is ready to proceed to settlement.</div>
          </div>
          <button className="ml-auto px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-md shadow-sm transition-colors">
            Submit for Settlement
          </button>
        </div>
      )}
    </div>
  );
}
