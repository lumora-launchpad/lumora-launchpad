"use client";

import Link from "next/link";
import { useDisplayCampaigns } from "@/lib/campaignDisplay";
import { shortAddress } from "@/lib/tokens";

function fmtDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function GraduatedPage() {
  const { all } = useDisplayCampaigns();
  const graduated = all
    .filter((c) => c.status === "graduated")
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Successful campaigns
        </h1>
        <p className="mt-1 text-slate-500">
          Campaigns that proved demand, hit their target, and launched their
          token with liquidity locked on Uniswap.
        </p>
      </div>

      {graduated.length === 0 ? (
        <div className="glass-card px-6 py-16 text-center">
          <p className="text-lg font-black text-slate-900">No graduations yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            When a campaign reaches its target, it launches and appears here.
          </p>
          <Link href="/campaigns" className="btn-primary mt-6 inline-flex">
            Explore campaigns
          </Link>
        </div>
      ) : (
        <div className="glass-card overflow-hidden p-0">
          {/* Header row, desktop only */}
          <div className="hidden grid-cols-12 gap-4 border-b border-slate-100 px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400 md:grid">
            <div className="col-span-4">Project</div>
            <div className="col-span-2">Funding</div>
            <div className="col-span-2">Launch date</div>
            <div className="col-span-2">Supporters</div>
            <div className="col-span-2 text-right">Trading status</div>
          </div>

          <ul className="divide-y divide-slate-100">
            {graduated.map((c) => {
              const row = (
                <div className="grid grid-cols-2 items-center gap-4 px-5 py-4 transition hover:bg-slate-50 md:grid-cols-12">
                  {/* Project */}
                  <div className="col-span-2 flex items-center gap-3 md:col-span-4">
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.image}
                        alt={c.name}
                        className="h-10 w-10 rounded-xl object-cover shadow-glow"
                      />
                    ) : (
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${c.accent} text-xs font-black text-white shadow-glow`}
                      >
                        {c.symbol.slice(0, 2)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">{c.name}</p>
                      <p className="text-xs text-slate-400">
                        ${c.symbol}
                        {c.category ? ` / ${c.category}` : ""}
                      </p>
                    </div>
                  </div>
                  {/* Funding */}
                  <div className="md:col-span-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">
                      Funding
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {c.currentEth.toLocaleString("en-US", { maximumFractionDigits: 2 })} ETH
                    </p>
                    <p className="text-xs text-slate-400">by {shortAddress(c.creator)}</p>
                  </div>
                  {/* Launch date */}
                  <div className="md:col-span-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">
                      Launch date
                    </p>
                    <p className="text-sm font-medium text-slate-600">
                      {c.sample ? fmtDate(c.createdAt) : "On chain"}
                    </p>
                  </div>
                  {/* Supporters */}
                  <div className="md:col-span-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">
                      Supporters
                    </p>
                    <p className="text-sm font-medium text-slate-600">
                      {(c.supporters ?? 0).toLocaleString("en-US")}
                    </p>
                  </div>
                  {/* Trading status */}
                  <div className="col-span-2 md:col-span-2 md:text-right">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-base-mint/10 px-2.5 py-1 text-xs font-bold text-base-mint">
                      <span className="h-1.5 w-1.5 rounded-full bg-base-mint" />
                      Trading
                    </span>
                  </div>
                </div>
              );
              return (
                <li key={c.key}>
                  {c.href ? <Link href={c.href}>{row}</Link> : row}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
