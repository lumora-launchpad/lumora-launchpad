"use client";

import { useTokens } from "@/lib/useTokens";
import { useCampaigns } from "@/lib/useCampaigns";
import { useMarketStats } from "@/lib/useMarketStats";
import { useCountUp } from "@/lib/useCountUp";

function AnimatedStat({
  label,
  value,
  digits = 0,
  suffix = "",
}: {
  label: string;
  value: number;
  digits?: number;
  suffix?: string;
}) {
  const animated = useCountUp(value);
  return (
    <div className="card py-6 text-center">
      <p className="text-4xl font-black gradient-text sm:text-5xl">
        {animated.toLocaleString("en-US", { maximumFractionDigits: digits })}
        {suffix}
      </p>
      <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}

// Live activity strip shown on the landing page so the platform feels active
// from the first view. Renders nothing until real on chain data is available,
// so the landing never shows empty zeros.
export function LandingStats() {
  const { tokens, hasFactory } = useTokens();
  const { campaigns } = useCampaigns();
  const stats = useMarketStats(tokens.map((t) => t.address));

  if (!hasFactory || tokens.length === 0) return null;

  const live = tokens.filter((t) => !t.graduated).length;
  const graduated = tokens.filter((t) => t.graduated).length;
  const raised = tokens.reduce((sum, t) => sum + t.raisedEth, 0);
  let volume = 0;
  for (const s of stats.values()) volume += s.volumeEth;
  const now = Math.floor(Date.now() / 1000);
  const activeCampaigns = campaigns.filter(
    (c) => !c.launched && c.deadline > now,
  ).length;

  return (
    <section className="pb-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <AnimatedStat label="Tokens" value={tokens.length} />
        <AnimatedStat label="Live now" value={live} />
        <AnimatedStat label="Graduated" value={graduated} />
        <AnimatedStat label="ETH raised" value={raised} digits={raised < 10 ? 2 : 0} />
        <AnimatedStat label="Total volume" value={volume} digits={volume < 10 ? 2 : 0} suffix="" />
        <AnimatedStat label="Active campaigns" value={activeCampaigns} />
      </div>
    </section>
  );
}
