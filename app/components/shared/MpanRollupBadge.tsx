'use client';

interface Props {
  total: number;
  pass: number;
  fail: number;
  warn: number;
}

export function MpanRollupBadge({ total, pass, fail, warn }: Props) {
  if (total <= 1) {
    return <span className="text-xs text-slate-400">1 MPAN</span>;
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className="font-medium text-slate-700">{total} MPANs</span>
      <span className="flex items-center gap-1">
        {pass > 0 && (
          <span className="inline-flex items-center gap-0.5 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {pass}
          </span>
        )}
        {fail > 0 && (
          <span className="inline-flex items-center gap-0.5 text-red-700">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {fail}
          </span>
        )}
        {warn > 0 && (
          <span className="inline-flex items-center gap-0.5 text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {warn}
          </span>
        )}
      </span>
    </span>
  );
}
