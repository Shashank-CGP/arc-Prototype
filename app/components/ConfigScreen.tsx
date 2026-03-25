'use client';
import { useState } from 'react';
import { configRules } from '../data/mockData';

export function ConfigScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', threshold: '', type: '%' });

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Auto-Approval Configuration</h1>
          <p className="text-sm text-slate-500 mt-1">Tolerance rules that govern the Customer Curve Approval workflow</p>
        </div>
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Read-only — Config changes require Trading Admin role
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-sm text-blue-800">
          <span className="font-semibold">Configurable without code changes.</span> Trading Admins can adjust thresholds, add new rules, or deactivate existing ones via this screen. Changes take effect on the next quote submission.
        </div>
      </div>

      {/* Config table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Tolerance Rules</h2>
          <span className="text-xs text-slate-400">{configRules.filter(r => r.active).length} of {configRules.length} rules active</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rule Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Threshold</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {configRules.map((rule) => (
              <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4">
                  <span className="font-medium text-slate-800">{rule.name}</span>
                </td>
                <td className="px-5 py-4 text-slate-500 text-xs max-w-xs">{rule.description}</td>
                <td className="px-5 py-4 text-right">
                  <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                    {rule.type === '%' ? '±' : ''}{rule.threshold} {rule.type}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-medium">
                    {rule.type}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-center">
                    {/* Read-only toggle */}
                    <div
                      className={`relative w-9 h-5 rounded-full transition-colors cursor-not-allowed opacity-75 ${
                        rule.active ? 'bg-green-500' : 'bg-slate-300'
                      }`}
                      title="Config changes require Trading Admin role"
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                          rule.active ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add new rule button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          title="Config changes require Trading Admin role — shown for demo purposes"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add New Failure Reason
        </button>
        <span className="text-xs text-slate-400">Requires Trading Admin role to save</span>
      </div>

      {/* Add rule modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Add New Failure Reason</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Read-only demo — changes will not be saved
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Rule Name</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Baseline Demand Tolerance"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Threshold Value</label>
                  <input
                    type="text"
                    value={newRule.threshold}
                    onChange={(e) => setNewRule((p) => ({ ...p, threshold: e.target.value }))}
                    placeholder="e.g. 10"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Threshold Type</label>
                  <select
                    value={newRule.type}
                    onChange={(e) => setNewRule((p) => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  >
                    <option value="%">% (Percentage)</option>
                    <option value="days">days</option>
                    <option value="kWh">kWh</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-semibold text-white bg-slate-400 rounded-lg cursor-not-allowed"
                title="Requires Trading Admin role"
              >
                Save Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
