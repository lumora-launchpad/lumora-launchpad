"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TokenCard } from "./TokenCard";
import { Sparkline } from "./Sparkline";
import { useTokens } from "@/lib/useTokens";
import { useMarketStats, type TokenStats } from "@/lib/useMarketStats";
import { sampleTokens } from "@/lib/sampleTokens";
import type { TokenView } from "@/lib/tokens";

type Sort = "new" | "progress" | "almost";

const SORTS: { id: Sort; label: string }[] = [
  { id: "new", label: "Newest" },
  { id: "progress", label: "Top progress" },
  { id: "almost", label: "Almost there" },
];

function GridSkeleton() {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-100" />
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-slate-100" />
              <div className="h-3 w-12 rounded bg-slate-100" />
            </div>
            <div className="ml-auto h-7 w-20 rounded bg-slate-100" />
          </div>
          <div className="mt-4 h-3 w-full rounded bg-slate-100" />
          <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
          <div className="mt-4 h-12 w-full rounded-2xl bg-slate-100" />
          <div className="mt-5 h-2.5 w-full rounded-full bg-slate-100" />
          <div className="mt-5 h-7 w-32 rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

// The token closest to graduation, but not yet graduated: the current "king".
function KingCard({ token, stats }: { token: TokenView; stats?: TokenStats }) {
  return (
    <Link
      href={`/token/${token.address}`}
      className="group relative mt-8 block overflow-hidden rounded-3xl bg-brand-gradient p-[1px] shadow-glow transition hover:-translate-y-1"
    >
      <div className="rounded-3xl bg-white/95 p-6 backdrop-blur">
        <div className="flex items-center gap-4">
          {token.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={token.imageUrl}
              alt={token.name}
              className="h-16 w-16 rounded-2xl object-cover shadow-glow"
            />
          ) : (
            <div
              className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${token.accent} text-2xl font-black text-white shadow-glow`}
            >
              {token.symbol.slice(0, 2)}
            </div>
          )}
          <div className="min-w-0">
            <span className="pill mb-1 !py-1 text-xs font-bold">
              <span className="h-2 w-2 rounded-full bg-base-pink" />
              King of the hill
            </span>
            <h3 className="truncate text-2xl font-black leading-tight">
              {token.name}{" "}
              <span className="text-slate-400">${token.symbol}</span>
            </h3>
          </div>
          <div className="ml-auto hidden text-right sm:block">
            <p className="text-3xl font-black gradient-text">
              {Math.round(token.progress)}%
            </p>
            <p className="text-xs font-medium text-slate-400">to Uniswap</p>
            {stats && stats.spark.length >= 2 && (
              <Sparkline data={stats.spark} className="ml-auto mt-1 h-7 w-28" />
            )}
          </div>
        </div>
        <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-gradient transition-all"
            style={{ width: `${Math.min(token.progress, 100)}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Leading the board with {token.marketCap} raised. Trade before it
          graduates.
        </p>
      </div>
    </Link>
  );
}

export function LiveTokenGrid() {
  const { tokens, isLoading, hasFactory } = useTokens();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("new");

  const useSample = !hasFactory || tokens.length === 0;
  const base = useSample ? sampleTokens : tokens;

  const stats = useMarketStats(useSample ? [] : tokens.map((t) => t.address));
  const statOf = (addr: string) => stats.get(addr.toLowerCase());

  // The king is the live token closest to graduating (real data only).
  const king = useMemo(() => {
    if (useSample) return null;
    const live = tokens.filter((t) => !t.graduated);
    if (live.length === 0) return null;
    return live.reduce((a, b) => (b.progress > a.progress ? b : a));
  }, [tokens, useSample]);

  const list = useMemo(() => {
    let out = [...base];
    const q = query.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.symbol.toLowerCase().includes(q),
      );
    }
    if (sort === "progress") {
      out.sort((a, b) => b.progress - a.progress);
    } else if (sort === "almost") {
      out = out
        .filter((t) => !t.graduated)
        .sort((a, b) => b.progress - a.progress);
    }
    // "new" keeps the incoming order (already newest first)
    return out;
  }, [base, query, sort]);

  if (isLoading) return <GridSkeleton />;

  return (
    <>
      {useSample && (
        <p className="mt-6 rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 text-center text-sm text-slate-500 backdrop-blur">
          {hasFactory
            ? "No tokens launched yet. Showing a sample view."
            : "Factory not connected. Showing sample data. Set NEXT_PUBLIC_FACTORY_ADDRESS for live data."}
        </p>
      )}

      {king && <KingCard token={king} stats={statOf(king.address)} />}

      {/* Controls */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 rounded-2xl bg-slate-100 p-1">
          {SORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={`rounded-xl px-3 py-1.5 text-sm font-bold transition ${
                sort === s.id
                  ? "bg-white text-base-blue shadow"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <input
          className="field sm:max-w-xs"
          placeholder="Search name or symbol"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {list.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-slate-200 bg-white/60 px-4 py-10 text-center text-sm text-slate-500">
          No tokens match your search.
        </p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t, i) => (
            <div
              key={t.address}
              className="animate-rise"
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <TokenCard token={t} stats={statOf(t.address)} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
