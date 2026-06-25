"use client";

import { useId, useMemo } from "react";

// A compact price sparkline. Green when the series ends higher than it starts,
// pink when lower.
export function Sparkline({
  data,
  className = "",
}: {
  data: number[];
  className?: string;
}) {
  const id = useId();
  const { path, up } = useMemo(() => {
    const n = data.length;
    if (n < 2) return { path: "", up: true };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const W = 100;
    const H = 28;
    const pad = 2;
    const d = data
      .map((p, i) => {
        const x = (i / (n - 1)) * W;
        const y = H - pad - ((p - min) / span) * (H - pad * 2);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
    return { path: d, up: data[n - 1] >= data[0] };
  }, [data]);

  if (!path) {
    return (
      <div
        className={`flex items-center justify-center text-[10px] text-slate-300 ${className}`}
      >
        no trades
      </div>
    );
  }

  const stroke = up ? "#10b981" : "#ec4899";

  return (
    <svg
      viewBox="0 0 100 28"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.2" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L100,28 L0,28 Z`} fill={`url(#fill-${id})`} />
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
