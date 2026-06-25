"use client";

import { TokenCard } from "./TokenCard";
import { useTokens } from "@/lib/useTokens";
import { sampleTokens } from "@/lib/sampleTokens";

export function LiveTokenGrid() {
  const { tokens, isLoading, hasFactory } = useTokens();

  if (isLoading) {
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
            </div>
            <div className="mt-6 h-2.5 w-full rounded-full bg-slate-100" />
            <div className="mt-5 h-7 w-32 rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  const useSample = !hasFactory || tokens.length === 0;
  const list = useSample ? sampleTokens : tokens;

  return (
    <>
      {useSample && (
        <p className="mt-6 rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 text-center text-sm text-slate-500 backdrop-blur">
          {hasFactory
            ? "No tokens launched yet. Showing a sample view."
            : "Factory not connected. Showing sample data. Set NEXT_PUBLIC_FACTORY_ADDRESS for live data."}
        </p>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => (
          <TokenCard key={t.address} token={t} />
        ))}
      </div>
    </>
  );
}
