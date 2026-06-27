"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { shortAddress, type TokenView } from "@/lib/tokens";
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

// Rough linear estimate of time to graduation from the launch pace so far.
// Honest "est." label, since real pace varies with demand.
function graduationEta(progress: number, createdMs?: number): string | null {
  if (!createdMs || progress <= 1 || progress >= 100) return null;
  const elapsed = Date.now() - createdMs;
  if (elapsed <= 0) return null;
  const remaining = (elapsed * (100 - progress)) / progress;
  const h = remaining / 3_600_000;
  if (h < 1) return `~${Math.max(1, Math.round(remaining / 60_000))}m`;
  if (h < 48) return `~${Math.round(h)}h`;
  return `~${Math.round(h / 24)}d`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
  );
}

const BADGES = {
  king: { label: "King of the hill", cls: "bg-base-pink/15 text-base-pink" },
  trending: { label: "Trending", cls: "bg-base-violet/15 text-base-violet" },
} as const;

export function TokenCard({
  token,
  stats,
  badge,
}: {
  token: TokenView;
  stats?: TokenStats;
  badge?: "king" | "trending";
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
  const eta = stats ? graduationEta(token.progress, stats.createdMs) : null;

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
            loading="lazy"
            decoding="async"
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
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-lg font-bold leading-tight">
              {token.name}
            </h3>
            {badge && (
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${BADGES[badge].cls}`}
              >
                {BADGES[badge].label}
              </span>
            )}
          </div>
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

      {/* Key metrics */}
      <div className="mt-4 grid grid-cols-4 gap-2 rounded-2xl bg-slate-50 px-4 py-3">
        <Stat label="MCap" value={`${fmtVol(token.raisedEth)} ETH`} />
        <Stat
          label="Volume"
          value={stats ? `${fmtVol(stats.volumeEth)} ETH` : "0"}
        />
        <Stat label="Holders" value={stats ? String(stats.holders) : "0"} />
        <Stat label="Age" value={stats ? ago(stats.createdMs) : "new"} />
      </div>

      {/* Creator and fee */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>
          By{" "}
          <span className="font-semibold text-slate-600">
            {shortAddress(token.creator)}
          </span>
        </span>
        <span className="pill !py-1 !text-xs">1% fee</span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>
            Curve progress
            {eta && !token.graduated && (
              <span className="ml-1 text-slate-400">graduates {eta}</span>
            )}
          </span>
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

      <div className="mt-5 flex items-center justify-end">
        <span className="text-sm font-bold text-base-blue transition group-hover:translate-x-1">
          Trade
        </span>
      </div>
    </Link>
  );
}
