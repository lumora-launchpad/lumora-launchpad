"use client";

import { useTokens } from "@/lib/useTokens";
import { useCampaigns } from "@/lib/useCampaigns";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card py-5 text-center">
      <p className="text-3xl font-black gradient-text">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-400">{label}</p>
    </div>
  );
}

// Live activity strip shown on the landing page so the platform feels active
// from the first view. Renders nothing until real on-chain data is available,
// so the landing never shows empty zeros.
export function LandingStats() {
  const { tokens, hasFactory } = useTokens();
  const { campaigns } = useCampaigns();

  if (!hasFactory || tokens.length === 0) return null;

  const live = tokens.filter((t) => !t.graduated).length;
  const graduated = tokens.filter((t) => t.graduated).length;
  const raised = tokens.reduce((sum, t) => sum + t.raisedEth, 0);
  const now = Math.floor(Date.now() / 1000);
  const activeCampaigns = campaigns.filter(
    (c) => !c.launched && c.deadline > now,
  ).length;

  const raisedLabel = raised.toLocaleString("en-US", {
    maximumFractionDigits: raised < 10 ? 2 : 0,
  });

  return (
    <section className="pb-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Tokens" value={String(tokens.length)} />
        <Stat label="Live now" value={String(live)} />
        <Stat label="Graduated" value={String(graduated)} />
        <Stat label="ETH raised" value={raisedLabel} />
        <Stat label="Active campaigns" value={String(activeCampaigns)} />
      </div>
    </section>
  );
}
