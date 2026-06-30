"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TokenCard } from "./TokenCard";
import { Sparkline } from "./Sparkline";
import { useTokens } from "@/lib/useTokens";
import { useMarketStats, type TokenStats } from "@/lib/useMarketStats";
import { useWatchlist } from "@/lib/useWatchlist";
import { isVerified } from "@/lib/verified";
import { sampleTokens } from "@/lib/sampleTokens";
import type { TokenView } from "@/lib/tokens";

type Sort = "new" | "trending" | "almost" | "volume" | "holders";
type Status = "all" | "live" | "listed" | "saved" | "verified";

const SORTS: { id: Sort; label: string }[] = [
  { id: "new", label: "Newest" },
  { id: "trending", label: "Trending" },
  { id: "almost", label: "Graduating soon" },
  { id: "volume", label: "Highest volume" },
  { id: "holders", label: "Most holders" },
];

const STATUSES: { id: Status; label: string }[] = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "listed", label: "Listed" },
  { id: "verified", label: "Verified" },
  { id: "saved", label: "Saved" },
];

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card py-4 text-center">
      <p className="text-2xl font-black gradient-text">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-slate-400">{label}</p>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
              loading="lazy"
              decoding="async"
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
  const [status, setStatus] = useState<Status>("all");

  const useSample = !hasFactory || tokens.length === 0;
  const base = useSample ? sampleTokens : tokens;

  const stats = useMarketStats(useSample ? [] : tokens.map((t) => t.address));
  const statOf = (addr: string) => stats.get(addr.toLowerCase());

  const { has: isSaved } = useWatchlist();

  // Aggregate metrics for the dashboard strip.
  const metrics = useMemo(() => {
    const live = base.filter((t) => !t.graduated).length;
    const listed = base.filter((t) => t.graduated).length;
    let volume = 0;
    for (const s of stats.values()) volume += s.volumeEth;
    return { total: base.length, live, listed, volume };
  }, [base, stats]);

  // The king is the live token closest to graduating (real data only).
  const king = useMemo(() => {
    if (useSample) return null;
    const live = tokens.filter((t) => !t.graduated);
    if (live.length === 0) return null;
    return live.reduce((a, b) => (b.progress > a.progress ? b : a));
  }, [tokens, useSample]);

  // The single most active token gets a Trending badge in the grid.
  const trendingAddr = useMemo(() => {
    if (useSample) return null;
    let best: string | null = null;
    let bestScore = 0;
    for (const t of tokens) {
      const s = statOf(t.address);
      const score = (s?.trades ?? 0) + (s?.volumeEth ?? 0) * 2;
      if (score > bestScore) {
        bestScore = score;
        best = t.address.toLowerCase();
      }
    }
    return best;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens, useSample, stats]);

  const badgeFor = (addr: string): "king" | "trending" | undefined => {
    const a = addr.toLowerCase();
    if (king && king.address.toLowerCase() === a) return "king";
    if (trendingAddr === a) return "trending";
    return undefined;
  };

  const list = useMemo(() => {
    let out = [...base];
    if (status === "live") out = out.filter((t) => !t.graduated);
    else if (status === "listed") out = out.filter((t) => t.graduated);
    else if (status === "verified") out = out.filter((t) => isVerified(t.address));
    else if (status === "saved") out = out.filter((t) => isSaved(t.address));
    const q = query.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.symbol.toLowerCase().includes(q),
      );
    }
    if (sort === "trending") {
      // Recent activity blend: trades weighted with volume.
      const score = (addr: string) => {
        const s = statOf(addr);
        return (s?.trades ?? 0) + (s?.volumeEth ?? 0) * 2;
      };
      out.sort((a, b) => score(b.address) - score(a.address));
    } else if (sort === "almost") {
      out = out
        .filter((t) => !t.graduated)
        .sort((a, b) => b.progress - a.progress);
    } else if (sort === "volume") {
      out.sort(
        (a, b) =>
          (statOf(b.address)?.volumeEth ?? 0) -
          (statOf(a.address)?.volumeEth ?? 0),
      );
    } else if (sort === "holders") {
      out.sort(
        (a, b) =>
          (statOf(b.address)?.holders ?? 0) - (statOf(a.address)?.holders ?? 0),
      );
    }
    // "new" keeps the incoming order (already newest first)
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, query, sort, status, isSaved, stats]);

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

      {/* Dashboard metrics */}
      {!useSample && (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Metric label="Tokens" value={String(metrics.total)} />
          <Metric label="Live" value={String(metrics.live)} />
          <Metric label="Listed" value={String(metrics.listed)} />
          <Metric
            label="Volume"
            value={`${metrics.volume.toLocaleString("en-US", {
              maximumFractionDigits: 2,
            })} ETH`}
          />
        </div>
      )}

      {king && <KingCard token={king} stats={statOf(king.address)} />}

      {/* Toolbar: status filter, sort, search */}
      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
          <div className="flex shrink-0 gap-1.5 rounded-2xl bg-slate-100 p-1">
            {STATUSES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStatus(s.id)}
                className={`rounded-xl px-3.5 py-2 text-sm font-bold transition ${
                  status === s.id
                    ? "bg-white text-base-violet shadow"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 gap-1.5 rounded-2xl bg-slate-100 p-1">
            {SORTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSort(s.id)}
                className={`rounded-xl px-3.5 py-2 text-sm font-bold transition ${
                  sort === s.id
                    ? "bg-white text-base-blue shadow"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <input
          className="field lg:max-w-xs"
          placeholder="Search name or symbol"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {list.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-slate-200 bg-white/60 px-4 py-10 text-center text-sm text-slate-500">
          No tokens match these filters.
        </p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((t, i) => (
            <div
              key={t.address}
              className="animate-rise"
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <TokenCard
                token={t}
                stats={statOf(t.address)}
                badge={badgeFor(t.address)}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
