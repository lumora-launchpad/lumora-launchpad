"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { TokenView } from "@/lib/tokens";
import type { TokenStats } from "@/lib/useMarketStats";
import { Sparkline } from "./Sparkline";
import { StarButton } from "./StarButton";
import { useCountUp } from "@/lib/useCountUp";

type TokenMetadata = {
  description?: string;
  imageUrl?: string;
};

function ago(ms?: number): string {
  if (!ms) return "new";
  const s = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function fmtVol(n: number): string {
  if (!n) return "0";
  if (n < 0.001) return "<0.001";
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1">
      <p className="text-[11px] font-medium text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
  );
}

export function TokenCard({
  token,
  stats,
}: {
  token: TokenView;
  stats?: TokenStats;
}) {
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);
  const animatedProgress = useCountUp(token.progress);

  useEffect(() => {
    let active = true;
    fetch(`/api/token?address=${token.address}`)
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: TokenMetadata) => {
        if (active) setMetadata(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [token.address]);

  const description =
    metadata?.description || token.blurb || "Live token on the Base curve.";
  const imageUrl = metadata?.imageUrl || token.imageUrl;
  const spark = stats?.spark ?? [];

  return (
    <Link
      href={`/token/${token.address}`}
      className="card group block transition hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="flex items-center gap-4">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={token.name}
            className="h-14 w-14 rounded-2xl object-cover shadow-glow"
          />
        ) : (
          <div
            className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${token.accent} text-xl font-black text-white shadow-glow`}
          >
            {token.symbol.slice(0, 2)}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold leading-tight">
            {token.name}
          </h3>
          <p className="text-sm font-medium text-slate-400">${token.symbol}</p>
        </div>
        <div className="ml-auto flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            {token.graduated && (
              <span className="rounded-full bg-base-mint/15 px-3 py-1 text-xs font-bold text-base-mint">
                Listed
              </span>
            )}
            <StarButton address={token.address} />
          </div>
          {spark.length >= 2 && <Sparkline data={spark} className="h-7 w-20" />}
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-slate-500">{description}</p>

      {stats && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2.5">
          <Stat label="Age" value={ago(stats.createdMs)} />
          <Stat label="Volume" value={`${fmtVol(stats.volumeEth)} ETH`} />
          <Stat label="Traders" value={String(stats.traders)} />
        </div>
      )}

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Curve progress</span>
          <span className="font-bold text-slate-700">
            {Math.round(animatedProgress)}%
          </span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${token.accent} transition-all duration-700`}
            style={{ width: `${Math.min(token.progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="pill">Raised {token.marketCap}</span>
        <span className="text-sm font-bold text-base-blue transition group-hover:translate-x-1">
          Trade
        </span>
      </div>
    </Link>
  );
}
