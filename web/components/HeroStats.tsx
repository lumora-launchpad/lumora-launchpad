"use client";

import { useTokens } from "@/lib/useTokens";
import { useCampaigns } from "@/lib/useCampaigns";
import { useMarketStats } from "@/lib/useMarketStats";
import { useCountUp } from "@/lib/useCountUp";

// Live protocol statistics shown directly below the hero buttons. Values update
// from the same on chain hooks the rest of the app uses, so they stay live.
function Stat({
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
    <div className="text-center sm:text-left">
      <p className="text-2xl font-black gradient-text sm:text-3xl">
        {animated.toLocaleString("en-US", { maximumFractionDigits: digits })}
        {suffix}
      </p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}

export function HeroStats() {
  const { tokens } = useTokens();
  const { campaigns } = useCampaigns();
  const stats = useMarketStats(tokens.map((t) => t.address));

  const graduated = tokens.filter((t) => t.graduated).length;
  let volume = 0;
  for (const s of stats.values()) volume += s.volumeEth;

  return (
    <div className="glass-card mt-9 grid grid-cols-2 gap-5 p-5 sm:grid-cols-4 sm:gap-2">
      <Stat label="Total tokens" value={tokens.length} />
      <Stat label="Campaigns" value={campaigns.length} />
      <Stat label="Total volume" value={volume} digits={volume < 10 ? 2 : 0} suffix=" ETH" />
      <Stat label="Graduated" value={graduated} />
    </div>
  );
}
