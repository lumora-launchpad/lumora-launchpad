"use client";

import Link from "next/link";
import { useTokens } from "@/lib/useTokens";
import { useLiveActivity, type Activity } from "@/lib/useLiveActivity";

const STYLE: Record<Activity["kind"], { label: string; dot: string; text: string }> = {
  launch: { label: "Launch", dot: "bg-base-blue", text: "text-base-blue" },
  buy: { label: "Buy", dot: "bg-base-mint", text: "text-base-mint" },
  sell: { label: "Sell", dot: "bg-base-pink", text: "text-base-pink" },
  graduate: { label: "Graduated", dot: "bg-base-violet", text: "text-base-violet" },
};

function describe(a: Activity): string {
  const eth = a.eth ? `${a.eth.toLocaleString("en-US", { maximumFractionDigits: 3 })} ETH` : "";
  switch (a.kind) {
    case "launch":
      return `${a.symbol || "A token"} launched`;
    case "buy":
      return `Bought ${eth} of ${a.symbol}`;
    case "sell":
      return `Sold ${eth} of ${a.symbol}`;
    case "graduate":
      return `${a.symbol || "A token"} graduated to Uniswap`;
  }
}

export function LiveActivity() {
  const { tokens, hasFactory } = useTokens();
  const symbolByAddress = new Map(
    tokens.map((t) => [t.address.toLowerCase(), t.symbol]),
  );
  const items = useLiveActivity(symbolByAddress);

  if (!hasFactory || items.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-base-mint opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-base-mint" />
        </span>
        <h2 className="text-xl font-black tracking-tight">Live activity</h2>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((a, i) => {
          const s = STYLE[a.kind];
          return (
            <Link
              key={`${a.token}-${a.block}-${a.logIndex}-${i}`}
              href={`/token/${a.token}`}
              className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/70 px-4 py-2.5 text-sm backdrop-blur transition hover:border-base-blue/30 hover:shadow-card"
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
              <span className={`text-xs font-bold uppercase ${s.text}`}>
                {s.label}
              </span>
              <span className="truncate text-slate-600">{describe(a)}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
