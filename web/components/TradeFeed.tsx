"use client";

import { useMemo } from "react";
import type { TradePoint } from "@/lib/useTradeHistory";

function shortAddr(a: string): string {
  return a ? `${a.slice(0, 6)}...${a.slice(-4)}` : "unknown";
}

function ago(ms: number): string {
  if (!ms) return "";
  const s = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function fmtEth(n: number): string {
  if (n === 0) return "0";
  if (n < 0.0001) return n.toExponential(1);
  return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

export function TradeFeed({
  trades,
  isLoading,
}: {
  trades: TradePoint[];
  isLoading: boolean;
}) {
  // newest first, cap the list
  const rows = useMemo(() => [...trades].reverse().slice(0, 30), [trades]);

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">Live trades</h3>
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-base-mint" />
          {trades.length} total
        </span>
      </div>

      <div className="mt-4 max-h-80 overflow-y-auto">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-slate-400">
            Loading trades
          </p>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            No trades yet. Be the first to buy.
          </p>
        ) : (
          <ul className="space-y-1">
            {rows.map((t) => (
              <li
                key={`${t.block}-${t.logIndex}`}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                  t.fresh ? "animate-flash" : ""
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                      t.side === "buy"
                        ? "bg-base-mint/15 text-base-mint"
                        : "bg-base-pink/15 text-base-pink"
                    }`}
                  >
                    {t.side}
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    {shortAddr(t.actor)}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-semibold text-slate-700">
                    {fmtEth(t.eth)} ETH
                  </span>
                  <span className="w-8 text-right text-xs text-slate-400">
                    {ago(t.time)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
