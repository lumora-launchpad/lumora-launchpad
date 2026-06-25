"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { TokenView } from "@/lib/tokens";

type TokenMetadata = {
  description?: string;
  imageUrl?: string;
};

export function TokenCard({ token }: { token: TokenView }) {
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);

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
        {token.graduated && (
          <span className="ml-auto rounded-full bg-base-mint/15 px-3 py-1 text-xs font-bold text-base-mint">
            Listed
          </span>
        )}
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-slate-500">
        {description}
      </p>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Curve progress</span>
          <span className="font-bold text-slate-700">
            {Math.round(token.progress)}%
          </span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${token.accent}`}
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
