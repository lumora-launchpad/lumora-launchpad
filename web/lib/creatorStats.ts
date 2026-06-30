"use client";

import { useDisplayCampaigns, type DisplayCampaign } from "./campaignDisplay";
import { accentFor } from "./tokens";
import { isVerified } from "./verified";

export type Badge = { id: string; label: string; tone: string };

export type CreatorProfile = {
  address: string;
  accent: string;
  total: number;
  successful: number;
  successRate: number; // 0..100
  totalRaised: number;
  totalSupporters: number;
  joinedAt: number; // unix seconds, earliest campaign we know
  campaigns: DisplayCampaign[];
  badges: Badge[];
  verified: boolean;
  sample: boolean;
};

const TONE = {
  violet: "text-base-violet bg-base-violet/10",
  blue: "text-base-blue bg-base-blue/10",
  pink: "text-base-pink bg-base-pink/10",
  mint: "text-base-mint bg-base-mint/10",
  amber: "text-amber-600 bg-amber-500/10",
  slate: "text-slate-600 bg-slate-100",
};

function badgesFor(p: Omit<CreatorProfile, "badges">): Badge[] {
  const out: Badge[] = [];
  if (p.verified) out.push({ id: "verified", label: "Verified Builder", tone: TONE.mint });
  if (p.total >= 1) out.push({ id: "first", label: "First Campaign", tone: TONE.slate });
  if (p.total >= 2 && p.successful >= 1)
    out.push({ id: "rising", label: "Rising Creator", tone: TONE.blue });
  if (p.successful >= 3)
    out.push({ id: "top", label: "Top Creator", tone: TONE.violet });
  if (p.campaigns.some((c) => c.progress >= 85))
    out.push({ id: "fast", label: "Fast Funding", tone: TONE.amber });
  if (p.successful >= 5)
    out.push({ id: "five", label: "5 Successful Campaigns", tone: TONE.violet });
  if (p.successful >= 10)
    out.push({ id: "ten", label: "10 Successful Campaigns", tone: TONE.pink });
  if (p.totalSupporters >= 100)
    out.push({ id: "hundred", label: "100 Supporters", tone: TONE.blue });
  if (p.totalSupporters >= 1000)
    out.push({ id: "thousand", label: "1000 Supporters", tone: TONE.pink });
  return out;
}

export function buildCreators(all: DisplayCampaign[]): CreatorProfile[] {
  const byCreator = new Map<string, DisplayCampaign[]>();
  for (const c of all) {
    const key = c.creator.toLowerCase();
    if (!byCreator.has(key)) byCreator.set(key, []);
    byCreator.get(key)!.push(c);
  }

  const profiles: CreatorProfile[] = [];
  for (const [, campaigns] of byCreator) {
    const address = campaigns[0].creator;
    const total = campaigns.length;
    const successful = campaigns.filter((c) => c.status === "graduated").length;
    const totalRaised = campaigns.reduce((s, c) => s + c.currentEth, 0);
    const totalSupporters = campaigns.reduce((s, c) => s + (c.supporters ?? 0), 0);
    const joinedAt = Math.min(...campaigns.map((c) => c.createdAt));
    const sample = campaigns.every((c) => c.sample);
    const verified =
      isVerified(address) || campaigns.some((c) => c.sample && c.featured);
    const base = {
      address,
      accent: accentFor(address),
      total,
      successful,
      successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
      totalRaised,
      totalSupporters,
      joinedAt,
      campaigns,
      verified,
      sample,
    };
    profiles.push({ ...base, badges: badgesFor(base) });
  }

  // Rank by a simple reputation score: successful campaigns, then total raised.
  profiles.sort(
    (a, b) =>
      b.successful - a.successful ||
      b.totalRaised - a.totalRaised ||
      b.totalSupporters - a.totalSupporters,
  );
  return profiles;
}

export function useCreators(): CreatorProfile[] {
  const { all } = useDisplayCampaigns();
  return buildCreators(all);
}

export function useCreator(address?: string): CreatorProfile | undefined {
  const creators = useCreators();
  if (!address) return undefined;
  return creators.find((c) => c.address.toLowerCase() === address.toLowerCase());
}
