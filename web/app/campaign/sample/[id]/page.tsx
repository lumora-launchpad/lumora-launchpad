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
  };

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

  return <CampaignDetail c={data} action={action} />;
}
