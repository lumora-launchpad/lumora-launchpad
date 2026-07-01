"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { sampleCampaigns } from "@/lib/sampleCampaigns";
import { useDisplayCampaigns } from "@/lib/campaignDisplay";
import { CampaignDetail, type CampaignDetailData } from "@/components/dashboard/CampaignDetail";

const FAKE_BACKERS = [
  "0x4a2f9c10b7d3e6481529ab6c0d7e8f90a1b2c3d4",
  "0x91bd7e02c4a5f6178293b04c5d6e7f8091a2b3c4",
  "0x2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e",
  "0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a",
  "0xa1c2d3e4f5061728394a5b6c7d8e9f0a1b2c3d4e",
];

export default function SampleCampaignPage({
  params,
}: {
  params: { id: string };
}) {
  const s = sampleCampaigns.find((x) => x.id === params.id);
  const { all } = useDisplayCampaigns();
  if (!s) return notFound();

  const now = Math.floor(Date.now() / 1000);

  // Synthesized supporters and funding activity for the preview.
  const fractions = [0.34, 0.24, 0.18, 0.14, 0.1];
  const topSupporters = FAKE_BACKERS.map((backer, i) => ({
    backer,
    amount: Number((s.currentEth * fractions[i]).toFixed(3)),
  }));
  let running = 0;
  const recentActivity = topSupporters
    .map((r) => {
      running += r.amount;
      return { backer: r.backer, amount: r.amount, total: Number(running.toFixed(3)) };
    })
    .reverse();
  const related = all
    .filter((rc) => rc.key !== `sample-${s.id}` && rc.category === s.category)
    .slice(0, 3);
  const data: CampaignDetailData = {
    name: s.name,
    symbol: s.symbol,
    address: null,
    creator: s.creator,
    accent: s.accent,
    imageUrl: s.image,
    bannerUrl: s.image,
    category: s.category,
    description: s.blurb,
    why: s.why,
    socials: s.socials,
    currentEth: s.currentEth,
    targetEth: s.targetEth,
    progress: Math.min(Math.round((s.currentEth / s.targetEth) * 100), 100),
    supporters: s.supporters,
    views: s.views,
    shares: Math.round(s.views / 40),
    deadline: now + s.hoursLeft * 3600,
    status: s.status === "graduated" ? "launched" : "live",
    fundingSpeedPerDay:
      s.createdHoursAgo > 0 ? s.currentEth / (s.createdHoursAgo / 24) : undefined,
    sample: true,
    watchKey: `sample-${s.id}`,
    verified: Boolean(s.featured),
  };

  const sampleThread = (
    <ul className="space-y-3">
      {[
        { who: "0x4a2f...9c10", text: "What is the plan after the token launches?", reply: false },
        {
          who: `${s.creator.slice(0, 6)}...${s.creator.slice(-4)} (creator)`,
          text: "Liquidity locks on Uniswap and we ship the next milestone from the roadmap.",
          reply: true,
        },
        { who: "0x91bd...7e02", text: "Backing this one. Love the demand first model.", reply: false },
      ].map((m, i) => (
        <li
          key={i}
          className={`rounded-2xl border p-3 text-sm ${
            m.reply ? "border-base-violet/20 bg-base-violet/5" : "border-slate-200 bg-white/60"
          }`}
        >
          <p className="text-xs font-bold text-slate-500">{m.who}</p>
          <p className="mt-1 text-slate-600">{m.text}</p>
        </li>
      ))}
    </ul>
  );

  const action = (
    <div className="glass-card p-5 text-center">
      <p className="text-lg font-black">Sample preview</p>
      <p className="mt-1 text-sm text-slate-500">
        This is a demo campaign that shows how the page looks. Create a real
        campaign to start accepting commitments.
      </p>
      <Link href="/campaigns" className="btn-primary mt-4 w-full">
        Launch a campaign
      </Link>
    </div>
  );

  return (
    <CampaignDetail
      c={data}
      action={action}
      comments={sampleThread}
      topSupporters={topSupporters}
      recentActivity={recentActivity}
      related={related}
    />
  );
}
