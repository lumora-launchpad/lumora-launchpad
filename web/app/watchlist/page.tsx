"use client";

import Link from "next/link";
import { useDisplayCampaigns } from "@/lib/campaignDisplay";
import { useWatchlist } from "@/lib/useWatchlist";
import { CampaignCard } from "@/components/dashboard/CampaignCard";
import { Icon } from "@/components/dashboard/icons";

export default function WatchlistPage() {
  const { all } = useDisplayCampaigns();
  const { list } = useWatchlist();

  const watched = new Set(list);
  const saved = all.filter(
    (c) => watched.has(c.key.toLowerCase()) || watched.has(c.key),
  );

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
          <Icon name="star" className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Watchlist</h1>
          <p className="mt-1 text-slate-500">
            Campaigns you saved. Track progress and catch launch or refund
            moments. Saved locally on this device.
          </p>
        </div>
      </div>

      {saved.length === 0 ? (
        <div className="glass-card px-6 py-16 text-center">
          <p className="text-lg font-black text-slate-900">Nothing saved yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            Tap the star on any campaign to save it here and follow its progress.
          </p>
          <Link href="/discover" className="btn-primary mt-6 inline-flex">
            Discover campaigns
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map((c) => (
            <CampaignCard key={c.key} c={c} />
          ))}
        </div>
      )}
    </div>
  );
}
