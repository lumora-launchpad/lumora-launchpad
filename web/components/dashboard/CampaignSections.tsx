"use client";

import Link from "next/link";
import { useDisplayCampaigns, type DisplayCampaign } from "@/lib/campaignDisplay";
import { CampaignCard } from "./CampaignCard";
import { Icon, type IconName } from "./icons";

function Section({
  id,
  icon,
  title,
  accentWord,
  subtitle,
  items,
  limit = 3,
}: {
  id?: string;
  icon: IconName;
  title: string;
  accentWord: string;
  subtitle: string;
  items: DisplayCampaign[];
  limit?: number;
}) {
  if (items.length === 0) return null;
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
            <Icon name={icon} className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              {title} <span className="gradient-text">{accentWord}</span>
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>
        <Link
          href="/explore"
          className="shrink-0 text-sm font-bold text-base-blue hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.slice(0, limit).map((c) => (
          <CampaignCard key={c.key} c={c} />
        ))}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <section className="glass-card flex flex-col items-center px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-2xl font-black text-white shadow-glow">
        L
      </div>
      <h2 className="mt-5 text-xl font-black tracking-tight text-slate-900">
        No campaigns yet
      </h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        Be the first to launch a demand campaign. Prove the demand, then launch
        only when your target is reached.
      </p>
      <Link href="/launch" className="btn-primary mt-6">
        Launch Campaign
      </Link>
    </section>
  );
}

export function CampaignSections() {
  const { all } = useDisplayCampaigns();
  const now = Math.floor(Date.now() / 1000);

  if (all.length === 0) return <EmptyState />;

  const live = all.filter((c) => c.status === "live" && c.deadline > now);
  const graduated = all.filter((c) => c.status === "graduated");

  const trending = [...live].sort(
    (a, b) => b.progress * (b.supporters ?? 1) - a.progress * (a.supporters ?? 1),
  );
  const almostFunded = [...live]
    .filter((c) => c.progress >= 70)
    .sort((a, b) => b.progress - a.progress);
  const endingSoon = [...live].sort((a, b) => a.deadline - b.deadline);
  const featured = [...all]
    .filter((c) => c.featured || (!c.sample && c.progress >= 80))
    .sort((a, b) => b.progress - a.progress);
  const fresh = [...all].sort((a, b) => b.createdAt - a.createdAt);
  const topSupporters = [...all].sort(
    (a, b) => (b.supporters ?? 0) - (a.supporters ?? 0),
  );
  const topFunding = [...all].sort((a, b) => b.currentEth - a.currentEth);
  const recentlyGraduated = [...graduated].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-10">
      <Section
        icon="fire"
        title="Trending"
        accentWord="Campaigns"
        subtitle="The campaigns with the most demand right now."
        items={trending}
        limit={6}
      />
      <Section
        id="almost-funded"
        icon="target"
        title="Almost"
        accentWord="Funded"
        subtitle="So close to the target. A few commitments left to launch."
        items={almostFunded}
      />
      <Section
        id="ending-soon"
        icon="clock"
        title="Ending"
        accentWord="Soon"
        subtitle="The clock is running down on these campaigns."
        items={endingSoon}
      />
      <Section
        icon="spark"
        title="Featured"
        accentWord="Campaigns"
        subtitle="Hand picked campaigns worth a closer look."
        items={featured}
      />
      <Section
        icon="rocket"
        title="New"
        accentWord="Campaigns"
        subtitle="The latest demand campaigns to go live on Base."
        items={fresh}
        limit={6}
      />
      <Section
        icon="users"
        title="Highest"
        accentWord="Supporters"
        subtitle="The campaigns the community is backing the most."
        items={topSupporters}
      />
      <Section
        icon="bolt"
        title="Highest"
        accentWord="Funding"
        subtitle="The campaigns that have raised the most ETH."
        items={topFunding}
      />
      <Section
        id="recently-graduated"
        icon="check"
        title="Recently"
        accentWord="Graduated"
        subtitle="Campaigns that proved demand and launched their token."
        items={recentlyGraduated}
      />
    </div>
  );
}
