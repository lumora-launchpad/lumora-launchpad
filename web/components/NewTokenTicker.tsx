"use client";

import Link from "next/link";
import { useRecentLaunches, type Launch } from "@/lib/useRecentLaunches";

function Chip({ l }: { l: Launch }) {
  return (
    <Link
      href={`/token/${l.address}`}
      className={`group flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 transition hover:-translate-y-0.5 ${
        l.fresh
          ? "border-base-mint/40 bg-base-mint/10"
          : "border-slate-200 bg-white/70"
      }`}
    >
      <span
        className={`grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br ${l.accent} text-[10px] font-black text-white`}
      >
        {l.symbol.slice(0, 2) || "?"}
      </span>
      <span className="text-xs font-bold text-slate-700">${l.symbol}</span>
      <span className="max-w-[7rem] truncate text-xs text-slate-400">{l.name}</span>
      {l.fresh && (
        <span className="rounded-full bg-base-mint/20 px-1.5 text-[10px] font-bold text-base-mint">
          new
        </span>
      )}
    </Link>
  );
}

export function NewTokenTicker() {
  const launches = useRecentLaunches(16);
  if (launches.length === 0) return null;

  // Duplicate the row so the marquee can loop seamlessly.
  const row = [...launches, ...launches];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/40 py-2.5 backdrop-blur">
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white to-transparent" />
      <div className="flex items-center gap-3 px-4">
        <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-slate-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-base-mint" />
          Just launched
        </span>
        <div className="group flex gap-2 overflow-hidden">
          <div className="flex animate-marquee gap-2 group-hover:[animation-play-state:paused]">
            {row.map((l, i) => (
              <Chip key={`${l.address}-${i}`} l={l} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
