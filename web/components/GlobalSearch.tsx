"use client";

import { useState } from "react";
import Link from "next/link";
import { useTokens } from "@/lib/useTokens";

function Results({
  query,
  onPick,
}: {
  query: string;
  onPick: () => void;
}) {
  const { tokens } = useTokens();
  const q = query.trim().toLowerCase();
  const matches = tokens
    .filter(
      (t) =>
        t.name.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q),
    )
    .slice(0, 6);

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      {matches.length === 0 ? (
        <p className="px-4 py-3 text-sm text-slate-400">No tokens found</p>
      ) : (
        matches.map((t) => (
          <Link
            key={t.address}
            href={`/token/${t.address}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onPick}
            className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-slate-50"
          >
            <span
              className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${t.accent} text-xs font-black text-white`}
            >
              {t.symbol.slice(0, 2)}
            </span>
            <span className="truncate text-sm font-bold text-slate-700">
              {t.name}
            </span>
            <span className="ml-auto text-xs font-medium text-slate-400">
              ${t.symbol}
            </span>
          </Link>
        ))
      )}
    </div>
  );
}

export function GlobalSearch({ className = "" }: { className?: string }) {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <input
        className="field !py-2 text-sm"
        placeholder="Search tokens"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
      />
      {focused && q.trim() && (
        <Results
          query={q}
          onPick={() => {
            setFocused(false);
            setQ("");
          }}
        />
      )}
    </div>
  );
}
