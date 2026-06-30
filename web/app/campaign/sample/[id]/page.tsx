"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { sampleCampaigns } from "@/lib/sampleCampaigns";
import { CampaignDetail, type CampaignDetailData } from "@/components/dashboard/CampaignDetail";

export default function SampleCampaignPage({
  params,
}: {
  params: { id: string };
}) {
  const s = sampleCampaigns.find((x) => x.id === params.id);
  if (!s) return notFound();

  const now = Math.floor(Date.now() / 1000);
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

  return <CampaignDetail c={data} action={action} comments={sampleThread} />;
}
