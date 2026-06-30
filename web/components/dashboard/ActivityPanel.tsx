"use client";

import Link from "next/link";
import { useTokens } from "@/lib/useTokens";
import { useLiveActivity, type Activity } from "@/lib/useLiveActivity";

const STYLE: Record<Activity["kind"], { label: string; dot: string; text: string }> = {
  launch: { label: "Launched", dot: "bg-base-blue", text: "text-base-blue" },
  buy: { label: "Bought", dot: "bg-base-mint", text: "text-base-mint" },
  sell: { label: "Sold", dot: "bg-base-pink", text: "text-base-pink" },
  graduate: { label: "Graduated", dot: "bg-base-violet", text: "text-base-violet" },
};

function describe(a: Activity): string {
  const eth = a.eth
    ? `${a.eth.toLocaleString("en-US", { maximumFractionDigits: 3 })} ETH`
    : "";
  switch (a.kind) {
    case "launch":
      return `${a.symbol || "A token"} launched on the curve`;
    case "buy":
      return `Wallet bought ${eth} of ${a.symbol}`;
    case "sell":
      return `Wallet sold ${eth} of ${a.symbol}`;
    case "graduate":
      return `${a.symbol || "A token"} reached its target`;
  }
}

export function ActivityPanel() {
  const { tokens } = useTokens();
  const symbolByAddress = new Map(
    tokens.map((t) => [t.address.toLowerCase(), t.symbol]),
  );
  const items = useLiveActivity(symbolByAddress);

  return (
    <section id="activity" className="glass-card scroll-mt-24 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-base-mint opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-base-mint" />
          </span>
          <h2 className="text-base font-black tracking-tight text-slate-900">
            Live Activity
          </h2>
        </div>
        <Link
          href="/explore"
          className="text-xs font-bold text-base-blue hover:underline"
        >
          View all
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">
          No recent activity yet. New launches and trades will show up here in
          real time.
        </p>
      ) : (
        <ul className="mt-4 space-y-1">
          {items.slice(0, 8).map((a, i) => {
            const s = STYLE[a.kind];
            return (
              <li key={`${a.token}-${a.block}-${a.logIndex}-${i}`}>
                <Link
                  href={`/token/${a.token}`}
                  className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition hover:bg-slate-50"
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-600">
                      {describe(a)}
                    </p>
                    <p className={`text-[11px] font-bold uppercase ${s.text}`}>
                      {s.label}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
