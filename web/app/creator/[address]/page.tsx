"use client";

import { useMemo } from "react";
import { TokenCard } from "@/components/TokenCard";
import { BackButton } from "@/components/BackButton";
import { CampaignCard } from "@/components/dashboard/CampaignCard";
import { Badges } from "@/components/dashboard/CreatorCard";
import { Icon } from "@/components/dashboard/icons";
import { useCreatorTokens } from "@/lib/useCreatorTokens";
import { useCreator } from "@/lib/creatorStats";
import { accentFor, shortAddress } from "@/lib/tokens";

function fmtDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/60 p-4 text-center">
      <p className="text-xl font-black gradient-text">{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}

export default function CreatorPage({
  params,
}: {
  params: { address: string };
}) {
  const address = params.address as `0x${string}`;
  const { tokens, isLoading } = useCreatorTokens(address);
  const profile = useCreator(address);

  const accent = accentFor(address);
  const short = useMemo(() => shortAddress(address), [address]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <BackButton label="Back" fallback="/leaderboard" />
      </div>

      {/* Profile header */}
      <div className="glass-card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div
            className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${accent} text-lg font-black text-white shadow-glow`}
          >
            {address.slice(2, 4).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-2xl font-black">{short}</h1>
              {profile?.verified && (
                <span
                  title="Verified Builder"
                  className="inline-grid h-5 w-5 place-items-center rounded-full bg-base-mint text-white"
                >
                  <Icon name="check" className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-400">
              Creator
              {profile && (
                <span suppressHydrationWarning> / joined {fmtDate(profile.joinedAt)}</span>
              )}
            </p>
          </div>
        </div>

        {profile && profile.badges.length > 0 && (
          <div className="mt-5">
            <Badges badges={profile.badges} max={9} />
          </div>
        )}

        {profile && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Stat label="Campaigns" value={String(profile.total)} />
            <Stat label="Successful" value={String(profile.successful)} />
            <Stat label="Success Rate" value={`${profile.successRate}%`} />
            <Stat
              label="Total Raised"
              value={`${profile.totalRaised.toLocaleString("en-US", { maximumFractionDigits: 2 })} ETH`}
            />
            <Stat
              label="Supporters"
              value={profile.totalSupporters.toLocaleString("en-US")}
            />
          </div>
        )}
      </div>

      {/* Campaigns */}
      {profile && profile.campaigns.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-black tracking-tight text-slate-900">Campaigns</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {profile.campaigns.map((c) => (
              <CampaignCard key={c.key} c={c} />
            ))}
          </div>
        </section>
      )}

      {/* Tokens */}
      <section className="mt-8">
        <h2 className="text-lg font-black tracking-tight text-slate-900">Tokens</h2>
        {isLoading ? (
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card h-44 animate-pulse bg-slate-50" />
            ))}
          </div>
        ) : tokens.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-slate-200 bg-white/60 px-4 py-10 text-center text-sm text-slate-500">
            This creator has not launched any tokens yet.
          </p>
        ) : (
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tokens.map((t) => (
              <TokenCard key={t.address} token={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
