"use client";

import { useMemo } from "react";
import { useTradeHistory } from "@/lib/useTradeHistory";

function fmtPrice(n: number): string {
  if (n === 0) return "0";
  if (n < 0.000001) return n.toExponential(2);
  return n.toLocaleString("en-US", { maximumFractionDigits: 8 });
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Keeps the end labels concise: just a time for a chart spanning under a
// day, time plus date when trades stretch across multiple days.
function fmtTime(ms: number, includeDate: boolean): string {
  const d = new Date(ms);
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (!includeDate) return time;
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${date} ${time}`;
}

export function PriceChart({ address }: { address: `0x${string}` }) {
  const { trades, isLoading } = useTradeHistory(address);

  const prices = useMemo(() => trades.map((t) => t.price), [trades]);
  const times = useMemo(() => trades.map((t) => t.time), [trades]);

  const { linePath, areaPath, last, changePct, up, leftLabel, rightLabel } =
    useMemo(() => {
      const n = prices.length;
      if (n < 2) {
        return {
          linePath: "",
          areaPath: "",
          last: prices[n - 1] ?? 0,
          changePct: 0,
          up: true,
          leftLabel: "",
          rightLabel: "",
        };
      }
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const span = max - min || 1;
      const minTime = times[0];
      const maxTime = times[n - 1];
      const timeSpan = maxTime - minTime || 1;
      const W = 100;
      const H = 40;
      const pad = 2;

      const coords = prices.map((p, i) => {
        const x = ((times[i] - minTime) / timeSpan) * W;
        const y = H - pad - ((p - min) / span) * (H - pad * 2);
        return [x, y] as const;
      });

      const line = coords
        .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
        .join(" ");
      const area = `${line} L${W},${H} L0,${H} Z`;

      const first = prices[0];
      const lastPrice = prices[n - 1];
      const pct = first > 0 ? ((lastPrice - first) / first) * 100 : 0;
      const multiDay = maxTime - minTime > DAY_MS;

      return {
        linePath: line,
        areaPath: area,
        last: lastPrice,
        changePct: pct,
        up: pct >= 0,
        leftLabel: fmtTime(minTime, multiDay),
        rightLabel: fmtTime(maxTime, multiDay),
      };
    }, [prices, times]);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-base-blue/5 via-base-violet/5 to-base-pink/10 p-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">Last price</p>
          <p className="text-2xl font-black text-slate-800">
            {prices.length > 0 ? `${fmtPrice(last)} ETH` : "-"}
          </p>
        </div>
        {prices.length >= 2 && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              up ? "bg-base-mint/15 text-base-mint" : "bg-base-pink/15 text-base-pink"
            }`}
          >
            {up ? "+" : ""}
            {changePct.toFixed(1)}%
          </span>
        )}
      </div>

      <div className="mt-4 h-44">
        {isLoading ? (
          <div className="grid h-full place-items-center">
            <p className="text-sm text-slate-400">Loading trade history</p>
          </div>
        ) : prices.length < 2 ? (
          <div className="grid h-full place-items-center">
            <p className="text-sm text-slate-400">
              Not enough trades to chart yet. The chart appears automatically
              once trades happen.
            </p>
          </div>
        ) : (
          <svg
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0052ff" />
                <stop offset="50%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#areaGrad)" />
            <path
              d={linePath}
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="0.8"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}
      </div>

      {prices.length >= 2 && (
        <div className="mt-1 flex justify-between text-[11px] text-slate-400">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}

      {prices.length > 0 && (
        <p className="mt-2 text-right text-xs text-slate-400">
          {prices.length} trades
        </p>
      )}
    </div>
  );
}
