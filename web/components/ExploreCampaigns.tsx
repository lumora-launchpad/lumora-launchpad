"use client";

import Link from "next/link";
import { useCampaigns, type CampaignView } from "@/lib/useCampaigns";
import { formatEth } from "@/lib/tokens";
import { Countdown } from "./Countdown";

function MiniCampaign({ c }: { c: CampaignView }) {
  return (
    <Link
      href={`/campaign/${c.address}`}
      className="card group block min-w-64 flex-1 transition hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="flex items-center gap-3">
        <div
          className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${c.accent} text-sm font-black text-white shadow-glow`}
        >
          {c.symbol.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold leading-tight">{c.name}</h3>
          <p className="text-xs font-medium text-slate-400">${c.symbol}</p>
        </div>
        <span className="ml-auto text-xs font-bold text-base-violet">
          <Countdown deadline={c.deadline} />
        </span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-gradient transition-all"
          style={{ width: `${Math.min(c.progress, 100)}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {formatEth(c.totalCommitted)} / {formatEth(c.targetEth)} ETH backed
      </p>
    </Link>
  );
}

export function ExploreCampaigns() {
  const { campaigns } = useCampaigns();

  const now = Math.floor(Date.now() / 1000);
  const live = campaigns
    .filter((c) => !c.launched && c.deadline > now)
    .slice(0, 4);

  if (live.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">
            Live <span className="gradient-text">campaigns</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Back a launch before it hits its target.
          </p>
        </div>
        <Link
          href="/campaigns"
          className="text-sm font-bold text-base-blue hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="mt-5 flex flex-wrap gap-4">
        {live.map((c) => (
          <MiniCampaign key={c.address} c={c} />
        ))}
      </div>
    </section>
  );
}
