"use client";

import { useMemo } from "react";
import { TokenCard } from "@/components/TokenCard";
import { BackButton } from "@/components/BackButton";
import { useCreatorTokens } from "@/lib/useCreatorTokens";
import { accentFor } from "@/lib/tokens";

export default function CreatorPage({
  params,
}: {
  params: { address: string };
}) {
  const address = params.address as `0x${string}`;
  const { tokens, isLoading } = useCreatorTokens(address);

  const accent = accentFor(address);
  const short = useMemo(
    () => `${address.slice(0, 6)}...${address.slice(-4)}`,
    [address],
  );
  const live = tokens.filter((t) => !t.graduated).length;
  const listed = tokens.filter((t) => t.graduated).length;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-5">
        <BackButton label="Back to explore" />
      </div>

      <div className="card">
        <div className="flex items-center gap-4">
          <div
            className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${accent} text-lg font-black text-white shadow-glow`}
          >
            {address.slice(2, 4).toUpperCase()}
          </div>
          <div>
            <h1 className="font-mono text-2xl font-black">{short}</h1>
            <p className="text-sm font-medium text-slate-400">Creator</p>
          </div>
          <div className="ml-auto flex gap-6 text-center">
            <div>
              <p className="text-2xl font-black gradient-text">{tokens.length}</p>
              <p className="text-xs font-medium text-slate-400">Tokens</p>
            </div>
            <div>
              <p className="text-2xl font-black gradient-text">{live}</p>
              <p className="text-xs font-medium text-slate-400">Live</p>
            </div>
            <div>
              <p className="text-2xl font-black gradient-text">{listed}</p>
              <p className="text-xs font-medium text-slate-400">Listed</p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-44 animate-pulse bg-slate-50" />
          ))}
        </div>
      ) : tokens.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-slate-200 bg-white/60 px-4 py-10 text-center text-sm text-slate-500">
          This creator has not launched any tokens yet.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tokens.map((t) => (
            <TokenCard key={t.address} token={t} />
          ))}
        </div>
      )}
    </div>
  );
}
