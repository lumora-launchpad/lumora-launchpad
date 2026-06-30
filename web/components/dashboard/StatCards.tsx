"use client";

import { formatEther } from "viem";
import { useCampaigns } from "@/lib/useCampaigns";
import { useCampaignBackers } from "@/lib/useCampaignBackers";
import { useCountUp } from "@/lib/useCountUp";
import { Icon, type IconName } from "./icons";

function StatCard({
  label,
  value,
  digits = 0,
  suffix = "",
  icon,
}: {
  label: string;
  value: number;
  digits?: number;
  suffix?: string;
  icon: IconName;
}) {
  const animated = useCountUp(value);
  return (
    <div className="glass-card lift p-5">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
        <Icon name={icon} className="h-5 w-5" />
      </div>
      <p className="mt-4 text-2xl font-black tracking-tight text-slate-900">
        {animated.toLocaleString("en-US", { maximumFractionDigits: digits })}
        {suffix}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}

export function StatCards() {
  const { campaigns } = useCampaigns();
  const backers = useCampaignBackers(campaigns.map((c) => c.address));

  const total = campaigns.length;
  const successful = campaigns.filter((c) => c.launched).length;

  let raisedWei = 0n;
  for (const c of campaigns) raisedWei += c.totalCommitted;
  const raised = Number(formatEther(raisedWei));

  let supporters = 0;
  for (const n of backers.values()) supporters += n;

  const creators = new Set(campaigns.map((c) => c.creator.toLowerCase())).size;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard label="Total Campaigns" value={total} icon="rocket" />
      <StatCard label="Successful Campaigns" value={successful} icon="check" />
      <StatCard
        label="Total ETH Raised"
        value={raised}
        digits={raised < 100 ? 2 : 0}
        suffix=" ETH"
        icon="target"
      />
      <StatCard label="Total Supporters" value={supporters} icon="users" />
      <StatCard label="Total Creators" value={creators} icon="trophy" />
    </div>
  );
}
