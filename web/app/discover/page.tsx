"use client";

import { useState } from "react";
import { useDisplayCampaigns, type DisplayCampaign } from "@/lib/campaignDisplay";
import { CampaignCard } from "@/components/dashboard/CampaignCard";
import { WeeklyEvent } from "@/components/dashboard/WeeklyEvent";

const CATEGORIES = [
  "All",
  "AI",
  "Meme",
  "Gaming",
  "DeFi",
  "Infrastructure",
  "NFT",
  "Utility",
  "SocialFi",
] as const;

const SORTS = [
  "Trending",
  "New",
  "Almost Funded",
  "Ending Soon",
  "Most Supported",
  "Highest Funding",
] as const;

type Sort = (typeof SORTS)[number];

function sortCampaigns(list: DisplayCampaign[], sort: Sort): DisplayCampaign[] {
  const now = Math.floor(Date.now() / 1000);
  const arr = [...list];
  switch (sort) {
    case "Trending":
      return arr.sort(
        (a, b) => b.progress * (b.supporters ?? 1) - a.progress * (a.supporters ?? 1),
      );
    case "New":
      return arr.sort((a, b) => b.createdAt - a.createdAt);
    case "Almost Funded":
      return arr
        .filter((c) => c.status === "live")
        .sort((a, b) => b.progress - a.progress);
    case "Ending Soon":
      return arr
        .filter((c) => c.status === "live" && c.deadline > now)
        .sort((a, b) => a.deadline - b.deadline);
    case "Most Supported":
      return arr.sort((a, b) => (b.supporters ?? 0) - (a.supporters ?? 0));
    case "Highest Funding":
      return arr.sort((a, b) => b.currentEth - a.currentEth);
  }
}

export default function DiscoverPage() {
  const { all } = useDisplayCampaigns();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [sort, setSort] = useState<Sort>("Trending");

  const filtered = category === "All" ? all : all.filter((c) => c.category === category);
  const results = sortCampaigns(filtered, sort);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Explore campaigns
        </h1>
        <p className="mt-1 text-slate-500">
          Find demand campaigns by category and momentum.
        </p>
      </div>

      <div className="mb-6">
        <WeeklyEvent />
      </div>

      {/* Category filters */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
              category === cat
                ? "bg-brand-gradient text-white shadow-glow"
                : "border border-slate-200 bg-white/70 text-slate-600 hover:border-base-blue hover:text-base-blue"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sort filters */}
      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {SORTS.map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${
              sort === s
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white/70 text-slate-500 hover:text-slate-800"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="glass-card mt-6 px-6 py-16 text-center">
          <p className="text-lg font-black text-slate-900">No campaigns in this category</p>
          <p className="mt-2 text-sm text-slate-500">Try another category or sort.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((c) => (
            <CampaignCard key={c.key} c={c} />
          ))}
        </div>
      )}
    </div>
  );
}
