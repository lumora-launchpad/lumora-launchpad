"use client";

import Link from "next/link";
import { useTokens } from "@/lib/useTokens";
import { useLiveActivity, type Activity } from "@/lib/useLiveActivity";
import { SHOW_SAMPLES } from "@/lib/campaignDisplay";

type CampaignEventKind =
  | "support"
  | "fifty"
  | "seventyfive"
  | "target"
  | "launched"
  | "created"
  | "refunded";

const KIND_STYLE: Record<CampaignEventKind, { label: string; dot: string; text: string }> = {
  support: { label: "Support", dot: "bg-base-mint", text: "text-base-mint" },
  fifty: { label: "Milestone", dot: "bg-base-blue", text: "text-base-blue" },
  seventyfive: { label: "Milestone", dot: "bg-base-blue", text: "text-base-blue" },
  target: { label: "Target", dot: "bg-base-violet", text: "text-base-violet" },
  launched: { label: "Launched", dot: "bg-base-violet", text: "text-base-violet" },
  created: { label: "Created", dot: "bg-base-sky", text: "text-base-sky" },
  refunded: { label: "Refunded", dot: "bg-base-pink", text: "text-base-pink" },
};

// A campaign centric preview feed shown on testnet so the activity feature can
// be seen and tested. Fixed times avoid hydration drift.
const SAMPLE_EVENTS: { kind: CampaignEventKind; text: string; mins: number }[] = [
  { kind: "support", text: "Wallet supported AI CAT", mins: 2 },
  { kind: "seventyfive", text: "MetaForge reached 75 percent", mins: 4 },
  { kind: "support", text: "Wallet supported DeFiWave", mins: 6 },
  { kind: "fifty", text: "BasePunks reached 50 percent", mins: 9 },
  { kind: "target", text: "DeFiWave reached its target", mins: 13 },
  { kind: "launched", text: "PixelDream launched its token", mins: 21 },
  { kind: "created", text: "SocialBase campaign created", mins: 28 },
  { kind: "support", text: "Wallet supported MetaForge", mins: 34 },
];

function ago(mins: number): string {
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  return `${h}h ago`;
}

const REAL_STYLE: Record<Activity["kind"], { label: string; dot: string; text: string }> = {
  launch: { label: "Launched", dot: "bg-base-blue", text: "text-base-blue" },
  buy: { label: "Bought", dot: "bg-base-mint", text: "text-base-mint" },
  sell: { label: "Sold", dot: "bg-base-pink", text: "text-base-pink" },
  graduate: { label: "Graduated", dot: "bg-base-violet", text: "text-base-violet" },
};

function describeReal(a: Activity): string {
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

function Shell({ children }: { children: React.ReactNode }) {
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
        <Link href="/explore" className="text-xs font-bold text-base-blue hover:underline">
          View all
        </Link>
      </div>
      {children}
    </section>
  );
}

export function ActivityPanel() {
  const { tokens } = useTokens();
  const symbolByAddress = new Map(
    tokens.map((t) => [t.address.toLowerCase(), t.symbol]),
  );
  const realItems = useLiveActivity(symbolByAddress);

  // On mainnet, only ever show real on chain activity.
  if (realItems.length > 0) {
    return (
      <Shell>
        <ul className="mt-4 space-y-1">
          {realItems.slice(0, 8).map((a, i) => {
            const s = REAL_STYLE[a.kind];
            return (
              <li key={`${a.token}-${a.block}-${a.logIndex}-${i}`}>
                <Link
                  href={`/token/${a.token}`}
                  className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition hover:bg-slate-50"
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-600">{describeReal(a)}</p>
                    <p className={`text-[11px] font-bold uppercase ${s.text}`}>{s.label}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </Shell>
    );
  }

  if (SHOW_SAMPLES) {
    return (
      <Shell>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-300">
          Sample preview
        </p>
        <ul className="mt-3 space-y-1">
          {SAMPLE_EVENTS.map((e, i) => {
            const s = KIND_STYLE[e.kind];
            return (
              <li key={i} className="flex items-start gap-3 rounded-xl px-2 py-2.5">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-600">{e.text}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold uppercase ${s.text}`}>{s.label}</span>
                    <span className="text-[11px] text-slate-300">{ago(e.mins)}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="mt-6 text-sm text-slate-400">
        No recent activity yet. New launches and trades will show up here in real
        time.
      </p>
    </Shell>
  );
}
