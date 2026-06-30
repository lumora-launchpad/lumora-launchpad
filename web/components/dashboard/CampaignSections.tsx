"use client";

import Link from "next/link";
import { useCampaigns, type CampaignView } from "@/lib/useCampaigns";
import { useCampaignBackers } from "@/lib/useCampaignBackers";
import { CampaignCard } from "./CampaignCard";

function Section({
  id,
  title,
  accentWord,
  subtitle,
  items,
  backers,
}: {
  id?: string;
  title: string;
  accentWord: string;
  subtitle: string;
  items: CampaignView[];
  backers: Map<string, number>;
}) {
  if (items.length === 0) return null;
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            {title} <span className="gradient-text">{accentWord}</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <Link
          href="/campaigns"
          className="shrink-0 text-sm font-bold text-base-blue hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((c) => (
          <CampaignCard
            key={c.address}
            c={c}
            supporters={backers.get(c.address.toLowerCase())}
          />
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
      <Link href="/campaigns" className="btn-primary mt-6">
        Launch Campaign
      </Link>
    </section>
  );
}

export function CampaignSections() {
  const { campaigns, hasFactory } = useCampaigns();
  const backers = useCampaignBackers(campaigns.map((c) => c.address));

  const now = Math.floor(Date.now() / 1000);
  const live = campaigns.filter((c) => !c.launched && c.deadline > now);

  if (!hasFactory || campaigns.length === 0) {
    return <EmptyState />;
  }

  const trending = [...live].sort((a, b) => b.progress - a.progress).slice(0, 6);
  const almostFunded = [...live]
    .filter((c) => c.progress >= 50)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);
  const endingSoon = [...live]
    .sort((a, b) => a.deadline - b.deadline)
    .slice(0, 3);
  const fresh = campaigns.slice(0, 3);

  return (
    <div className="space-y-10">
      <Section
        title="Trending"
        accentWord="Campaigns"
        subtitle="The campaigns with the most demand right now."
        items={trending}
        backers={backers}
      />
      <Section
        id="almost-funded"
        title="Almost"
        accentWord="Funded"
        subtitle="So close to the target. A few commitments left to graduate."
        items={almostFunded}
        backers={backers}
      />
      <Section
        id="ending-soon"
        title="Ending"
        accentWord="Soon"
        subtitle="The clock is running down on these campaigns."
        items={endingSoon}
        backers={backers}
      />
      <Section
        title="New"
        accentWord="Campaigns"
        subtitle="The latest demand campaigns to go live on Base."
        items={fresh}
        backers={backers}
      />
    </div>
  );
}
