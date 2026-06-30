"use client";

import Link from "next/link";
import { type CampaignView } from "@/lib/useCampaigns";
import { formatEth } from "@/lib/tokens";
import { Countdown } from "@/components/Countdown";
import { Icon } from "./icons";

function statusOf(c: CampaignView): { label: string; tone: string } {
  const now = Math.floor(Date.now() / 1000);
  if (c.launched) return { label: "Launched", tone: "text-base-mint bg-base-mint/10" };
  if (c.progress >= 80) return { label: "Almost Funded", tone: "text-base-pink bg-base-pink/10" };
  if (c.deadline <= now) return { label: "Ended", tone: "text-slate-500 bg-slate-100" };
  return { label: "Live", tone: "text-base-blue bg-base-blue/10" };
}

export function CampaignCard({
  c,
  supporters,
}: {
  c: CampaignView;
  supporters?: number;
}) {
  const pct = Math.min(Math.round(c.progress), 100);
  const status = statusOf(c);

  return (
    <Link
      href={`/campaign/${c.address}`}
      className="glass-card group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-glow"
    >
      {/* Banner */}
      <div className={`relative h-28 bg-gradient-to-br ${c.accent}`}>
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(70%_80%_at_25%_15%,white,transparent)]" />
        <span className="absolute right-4 top-4 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
          {pct}% funded
        </span>
        <span className="pointer-events-none absolute -bottom-3 right-5 text-5xl font-black uppercase tracking-tight text-white/15">
          {c.symbol.slice(0, 4)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* Logo + name + category */}
        <div className="-mt-10 flex items-end gap-3">
          <span
            className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${c.accent} text-base font-black text-white shadow-glow ring-4 ring-white`}
          >
            {c.symbol.slice(0, 2)}
          </span>
          <div className="min-w-0 pb-1">
            <h3 className="truncate text-base font-bold leading-tight text-slate-900">
              {c.name}
            </h3>
            <p className="text-xs font-semibold text-slate-400">${c.symbol}</p>
          </div>
        </div>

        <span className={`mt-3 inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-bold ${status.tone}`}>
          {status.label}
        </span>

        <p className="mt-3 line-clamp-2 text-sm text-slate-500">
          Demand gated launch on Base. Supporters commit ETH and the token only
          launches once the target is reached.
        </p>

        {/* Funding progress */}
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-gradient transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">
              {formatEth(c.totalCommitted)} ETH
            </span>
            <span className="font-medium text-slate-400">
              of {formatEth(c.targetEth)} ETH
            </span>
          </div>
        </div>

        {/* Footer stats */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="users" className="h-4 w-4 text-slate-400" />
            {supporters ?? 0} supporters
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-base-violet">
            <Icon name="clock" className="h-4 w-4" />
            <Countdown deadline={c.deadline} />
          </span>
        </div>

        <span className="btn-primary mt-4 w-full !py-2.5 text-sm group-hover:brightness-110">
          View details
        </span>
      </div>
    </Link>
  );
}
