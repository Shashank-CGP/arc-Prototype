'use client';
import { HHInterval } from '../data/mockData';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceDot, Legend
} from 'recharts';

interface Props {
  intervals: HHInterval[];
  date: string;
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: HHInterval;
}

function MissingDot({ cx, cy, payload }: CustomDotProps) {
  if (!payload?.missing) return null;
  return <circle cx={cx} cy={cy} r={5} fill="#dc2626" stroke="#fff" strokeWidth={1} />;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number | null; payload: HHInterval }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-slate-800">{label}</p>
      {d.missing ? (
        <p className="text-red-600 font-medium">⚠ Missing interval</p>
      ) : (
        <p className="text-slate-600">{payload[0].value} kWh</p>
      )}
    </div>
  );
};

export function HHChart({ intervals, date }: Props) {
  // Build chart data — replace nulls with 0 for rendering but keep missing flag
  const data = intervals.map((iv) => ({
    ...iv,
    chartValue: iv.missing ? 0 : iv.value,
  }));

  const missingSlots = data.filter((d) => d.missing);
  const validValues = data.filter((d) => !d.missing && d.value !== null).map((d) => d.value as number);
  const maxY = Math.ceil((Math.max(...validValues) * 1.15) / 10) * 10;

  // Show every 4th tick (every 2 hours)
  const tickFormatter = (_: unknown, index: number) => {
    if (index % 4 !== 0) return '';
    return data[index]?.time ?? '';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-slate-700">Half-Hourly Consumption — {date}</div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-sky-500 inline-block" />
            kWh per half-hour
          </span>
          {missingSlots.length > 0 && (
            <span className="flex items-center gap-1.5 text-red-600">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              {missingSlots.length} missing interval{missingSlots.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="time"
            tickFormatter={tickFormatter}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}`}
            domain={[0, maxY]}
            label={{ value: 'kWh', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11, fill: '#94a3b8' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="chartValue"
            stroke="#0ea5e9"
            strokeWidth={1.5}
            dot={<MissingDot />}
            activeDot={{ r: 4, fill: '#0284c7' }}
            connectNulls={false}
            name="kWh"
          />
          {/* Red reference dots for missing intervals */}
          {missingSlots.map((slot) => {
            const idx = data.indexOf(slot);
            return (
              <ReferenceDot
                key={slot.time}
                x={slot.time}
                y={0}
                r={0}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
      {missingSlots.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {missingSlots.map((slot) => (
            <span key={slot.time} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {slot.time} — missing
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
