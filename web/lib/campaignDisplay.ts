"use client";

import { formatEther } from "viem";
import { useCampaigns } from "./useCampaigns";
import { useCampaignBackers } from "./useCampaignBackers";
import { IS_MAINNET } from "./deployments";
import { sampleCampaigns } from "./sampleCampaigns";

// A single shape the dashboard renders, whether the campaign is a real on chain
// campaign or a clearly flagged sample. Real campaigns link to their detail
// page; samples are preview only.
export type DisplayCampaign = {
  key: string;
  href: string | null;
  name: string;
  symbol: string;
  creator: string;
  category?: string;
  blurb?: string;
  currentEth: number;
  targetEth: number;
  progress: number; // 0..100
  supporters?: number;
  views?: number;
  deadline: number; // unix seconds
  status: "live" | "graduated";
  accent: string;
  image?: string;
  featured?: boolean;
  sample: boolean;
  createdAt: number; // unix seconds, for ordering New
};

export type RiskLevel = "Low" | "Medium" | "High";

// Risk reflects demand momentum, not financial advice: the more demand a
// campaign has proven, the lower the chance it falls short and refunds.
export function riskLabel(progress: number): RiskLevel {
  if (progress >= 70) return "Low";
  if (progress >= 35) return "Medium";
  return "High";
}

export const RISK_TONE: Record<RiskLevel, string> = {
  Low: "text-base-mint bg-base-mint/10",
  Medium: "text-amber-600 bg-amber-500/10",
  High: "text-base-pink bg-base-pink/10",
};

// Samples are a preview only and are switched off on mainnet, so production
// never renders invented campaigns.
export const SHOW_SAMPLES = !IS_MAINNET;

export function useDisplayCampaigns(): {
  all: DisplayCampaign[];
  hasRealData: boolean;
} {
  const { campaigns } = useCampaigns();
  const backers = useCampaignBackers(campaigns.map((c) => c.address));
  const now = Math.floor(Date.now() / 1000);

  const real: DisplayCampaign[] = campaigns.map((c, i) => ({
    key: c.address,
    href: `/campaign/${c.address}`,
    name: c.name,
    symbol: c.symbol,
    creator: c.creator,
    currentEth: Number(formatEther(c.totalCommitted)),
    targetEth: Number(formatEther(c.targetEth)),
    progress: c.progress,
    supporters: backers.get(c.address.toLowerCase()),
    deadline: c.deadline,
    status: c.launched ? "graduated" : "live",
    accent: c.accent,
    sample: false,
    createdAt: now - i, // real campaigns are returned newest first
  }));

  const samples: DisplayCampaign[] = SHOW_SAMPLES
    ? sampleCampaigns.map((s) => ({
        key: `sample-${s.id}`,
        href: `/campaign/sample/${s.id}`,
        name: s.name,
        symbol: s.symbol,
        creator: s.creator,
        category: s.category,
        blurb: s.blurb,
        currentEth: s.currentEth,
        targetEth: s.targetEth,
        progress: Math.min(Math.round((s.currentEth / s.targetEth) * 100), 100),
        supporters: s.supporters,
        views: s.views,
        deadline: now + s.hoursLeft * 3600,
        status: s.status,
        accent: s.accent,
        image: s.image,
        featured: s.featured,
        sample: true,
        createdAt: now - s.createdHoursAgo * 3600,
      }))
    : [];

  return { all: [...real, ...samples], hasRealData: campaigns.length > 0 };
}
