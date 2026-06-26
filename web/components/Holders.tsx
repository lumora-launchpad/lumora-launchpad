"use client";

import { useHolders } from "@/lib/useHolders";

function shortAddr(a: string): string {
  return `${a.slice(0, 6)}...${a.slice(-4)}`;
}

function fmtAmount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function Holders({ address }: { address: `0x${string}` }) {
  const { holders, isLoading } = useHolders(address);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">Holders</h3>
        <span className="text-xs font-medium text-slate-400">
          {holders.length}
        </span>
      </div>

      <div className="mt-4 max-h-96 overflow-y-auto">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-slate-400">
            Loading holders
          </p>
        ) : holders.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            No holders yet.
          </p>
        ) : (
          <ul className="space-y-1">
            {holders.map((h, i) => (
              <li
                key={h.address}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm"
              >
                <span className="w-5 text-xs font-bold text-slate-400">
                  {i + 1}
                </span>
                <span className="font-mono text-xs font-semibold text-base-blue">
                  {shortAddr(h.address)}
                </span>
                <span className="ml-auto font-semibold text-slate-700">
                  {h.pct.toFixed(2)}%
                </span>
                <span className="w-16 text-right text-xs text-slate-400">
                  {fmtAmount(h.balance)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
