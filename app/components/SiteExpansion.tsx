'use client';
import { useState } from 'react';
import { Site } from '../data/mockData';
import { HHChart } from './HHChart';

interface Props {
  site: Site;
  onBack: () => void;
}

export function SiteExpansion({ site, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<'summary' | 'hh'>('summary');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const selectedDay = site.hhData[selectedDayIndex];
  const failCount = site.toleranceResults.filter((r) => r.result === 'Fail').length;

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium mb-5">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Quote Detail
      </button>

      {/* Site header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg font-bold text-slate-900 font-mono">{site.mpan}</h2>
              {failCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold ring-1 ring-red-200">
                  {failCount} tolerance failure{failCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">{site.address}</p>
          </div>
          {site.dataAge > 30 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              HH data is {site.dataAge} days old — refresh recommended
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100">
          {[
            { label: 'Annual EAC', value: `${site.eac.toLocaleString()} kWh` },
            { label: 'MOP', value: site.mop },
            { label: 'Data Age', value: `${site.dataAge} days`, warn: site.dataAge > 30 },
            { label: 'Profile Class', value: site.profileClass },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-xs text-slate-500 font-medium mb-0.5">{item.label}</div>
              <div className={`text-sm font-semibold ${item.warn ? 'text-amber-700' : 'text-slate-900'}`}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-5 gap-0">
        {(['summary', 'hh'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            {tab === 'summary' ? 'Site Summary' : 'Half-Hourly Data'}
          </button>
        ))}
      </div>

      {activeTab === 'summary' && (
        <div className="grid grid-cols-2 gap-5">
          {/* Meter details */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide">Meter Details</h3>
            <dl className="space-y-2.5">
              {[
                { label: 'MPAN', value: site.mpan, mono: true },
                { label: 'Meter Type', value: site.meterType },
                { label: 'Profile Class', value: site.profileClass },
                { label: 'MOP', value: site.mop },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center text-sm">
                  <dt className="text-slate-500">{item.label}</dt>
                  <dd className={`font-medium text-slate-800 ${item.mono ? 'font-mono text-xs' : ''}`}>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Consumption summary */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide">Consumption Summary</h3>
            <dl className="space-y-2.5">
              {[
                { label: 'Annual EAC', value: `${site.consumption.annual.toLocaleString()} kWh` },
                { label: 'Peak Consumption', value: `${site.consumption.peak.toLocaleString()} kWh` },
                { label: 'Off-Peak Consumption', value: `${site.consumption.offPeak.toLocaleString()} kWh` },
                { label: 'Peak %', value: `${((site.consumption.peak / site.consumption.annual) * 100).toFixed(1)}%` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center text-sm">
                  <dt className="text-slate-500">{item.label}</dt>
                  <dd className="font-semibold text-slate-800 font-mono text-sm">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Tolerance checks */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 col-span-2">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide">Tolerance Checks — Site Level</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rule</th>
                  <th className="text-left pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Threshold</th>
                  <th className="text-left pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actual</th>
                  <th className="text-left pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {site.toleranceResults.map((r) => (
                  <tr key={r.rule} className={r.result === 'Fail' ? 'bg-red-50' : ''}>
                    <td className="py-2.5 font-medium text-slate-700">{r.rule}</td>
                    <td className="py-2.5 font-mono text-xs text-slate-600">{r.threshold}</td>
                    <td className={`py-2.5 font-mono text-xs font-semibold ${r.result === 'Fail' ? 'text-red-700' : 'text-slate-700'}`}>{r.actual}</td>
                    <td className="py-2.5">
                      {r.result === 'Pass' ? (
                        <span className="inline-flex items-center gap-1 text-green-700 font-semibold text-xs">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          Pass
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-700 font-semibold text-xs">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          Fail
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'hh' && (
        <div className="space-y-5">
          {/* Day selector */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Select Day</h3>
              <span className="text-xs text-slate-500">{site.hhData.length} days available</span>
            </div>
            <div className="flex gap-2">
              {site.hhData.map((day, idx) => {
                const missingCount = day.intervals.filter((iv) => iv.missing).length;
                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`flex flex-col items-center px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      selectedDayIndex === idx
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <span>{day.date}</span>
                    {missingCount > 0 && (
                      <span className={`text-xs mt-0.5 ${selectedDayIndex === idx ? 'text-red-200' : 'text-red-500'}`}>
                        {missingCount} missing
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <HHChart intervals={selectedDay.intervals} date={selectedDay.date} />
          </div>

          {/* Data quality summary */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">Data Quality — {selectedDay.date}</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Intervals', value: 48 },
                { label: 'Valid Intervals', value: selectedDay.intervals.filter((iv) => !iv.missing).length, color: 'text-green-700' },
                { label: 'Missing Intervals', value: selectedDay.intervals.filter((iv) => iv.missing).length, color: 'text-red-700' },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-lg p-3">
                  <div className={`text-2xl font-bold ${item.color ?? 'text-slate-900'}`}>{item.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
