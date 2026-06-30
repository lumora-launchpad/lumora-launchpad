"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useDisplayCampaigns, type DisplayCampaign } from "@/lib/campaignDisplay";
import { useTokens } from "@/lib/useTokens";
import { useMarketStats } from "@/lib/useMarketStats";
import { type TokenView } from "@/lib/tokens";
import { CampaignCard } from "@/components/dashboard/CampaignCard";
import { TokenCard } from "@/components/TokenCard";
import { NewTokenTicker } from "@/components/NewTokenTicker";

const TABS = [
  "All",
  "Demand Campaign",
  "Instant Launch",
  "Trending",
  "Almost Funded",
  "Ending Soon",
  "Successful",
  "New Launches",
] as const;
const CATEGORIES = [
  "All",
  "AI",
  "Meme",
  "Gaming",
  "DeFi",
  "NFT",
  "Infrastructure",
  "Utility",
  "SocialFi",
] as const;
const SORTS = [
  "Newest",
  "Oldest",
  "Highest Funding",
  "Highest Supporters",
  "Highest Trading Volume",
  "Most Viewed",
] as const;

type Tab = (typeof TABS)[number];
type Sort = (typeof SORTS)[number];

type Item = {
  kind: "campaign" | "token";
  key: string;
  name: string;
  symbol: string;
  creator: string;
  category?: string;
  createdAt: number;
  graduated: boolean;
  live: boolean;
  progress: number;
  deadline: number;
  funding: number;
  supporters: number;
  views: number;
  volume: number;
  campaign?: DisplayCampaign;
  token?: TokenView;
};

const PAGE = 12;

export default function ExplorePage() {
  const { all: campaigns } = useDisplayCampaigns();
  const { tokens } = useTokens();
  const stats = useMarketStats(tokens.map((t) => t.address));

  const [tab, setTab] = useState<Tab>("All");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [sort, setSort] = useState<Sort>("Newest");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const now = Math.floor(Date.now() / 1000);

  const items = useMemo<Item[]>(() => {
    const campaignItems: Item[] = campaigns.map((c) => ({
      kind: "campaign",
      key: c.key,
      name: c.name,
      symbol: c.symbol,
      creator: c.creator,
      category: c.category,
      createdAt: c.createdAt,
      graduated: c.status === "graduated",
      live: c.status === "live" && c.deadline > now,
      progress: c.progress,
      deadline: c.deadline,
      funding: c.currentEth,
      supporters: c.supporters ?? 0,
      views: c.views ?? 0,
      volume: 0,
      campaign: c,
    }));
    const tokenItems: Item[] = tokens.map((t, i) => ({
      kind: "token",
      key: t.address,
      name: t.name,
      symbol: t.symbol,
      creator: t.creator ?? "",
      category: undefined,
      createdAt: now - i,
      graduated: Boolean(t.graduated),
      live: !t.graduated,
      progress: t.progress,
      deadline: 0,
      funding: t.raisedEth,
      supporters: 0,
      views: 0,
      volume: stats.get(t.address.toLowerCase())?.volumeEth ?? 0,
      token: t,
    }));
    return [...campaignItems, ...tokenItems];
  }, [campaigns, tokens, stats, now]);

  const results = useMemo<Item[]>(() => {
    let list = items;

    switch (tab) {
      case "Demand Campaign":
        list = list.filter((i) => i.kind === "campaign");
        break;
      case "Instant Launch":
        list = list.filter((i) => i.kind === "token");
        break;
      case "Almost Funded":
        list = list.filter((i) => i.kind === "campaign" && i.live && i.progress >= 50);
        break;
      case "Ending Soon":
        list = list.filter((i) => i.kind === "campaign" && i.live);
        break;
      case "Successful":
        list = list.filter((i) => i.graduated);
        break;
      default:
        break;
    }

    if (cat !== "All") list = list.filter((i) => i.category === cat);

    const s = q.trim().toLowerCase();
    if (s) {
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(s) ||
          i.symbol.toLowerCase().includes(s) ||
          i.creator.toLowerCase().includes(s),
      );
    }

    const arr = [...list];
    if (tab === "Trending") {
      arr.sort(
        (a, b) =>
          b.progress * (b.supporters || 1) + b.volume * 100 -
          (a.progress * (a.supporters || 1) + a.volume * 100),
      );
    } else if (tab === "Ending Soon") {
      arr.sort((a, b) => (a.deadline || Infinity) - (b.deadline || Infinity));
    } else {
      switch (sort) {
        case "Newest":
          arr.sort((a, b) => b.createdAt - a.createdAt);
          break;
        case "Oldest":
          arr.sort((a, b) => a.createdAt - b.createdAt);
          break;
        case "Highest Funding":
          arr.sort((a, b) => b.funding - a.funding);
          break;
        case "Highest Supporters":
          arr.sort((a, b) => b.supporters - a.supporters);
          break;
        case "Highest Trading Volume":
          arr.sort((a, b) => b.volume - a.volume);
          break;
        case "Most Viewed":
          arr.sort((a, b) => b.views - a.views);
          break;
      }
    }
    return arr;
  }, [items, tab, cat, sort, q]);

  const visible = results.slice(0, limit);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <NewTokenTicker />

      <div className="mb-6 mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Explore</h1>
          <p className="mt-1 text-slate-500">
            Discover every demand campaign and instant launch on Base.
          </p>
        </div>
        <Link href="/launch" className="btn-primary !px-5 !py-2.5 text-sm">
          Launch yours
        </Link>
      </div>

      {/* Search */}
      <input
        className="field"
        placeholder="Search by project name, token symbol, or creator"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setLimit(PAGE);
        }}
      />

      {/* Tabs */}
      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setLimit(PAGE);
            }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
              tab === t
                ? "bg-brand-gradient text-white shadow-glow"
                : "border border-slate-200 bg-white/70 text-slate-600 hover:border-base-blue hover:text-base-blue"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Categories */}
      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCat(c);
              setLimit(PAGE);
            }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${
              cat === c
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white/70 text-slate-500 hover:text-slate-800"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sort</span>
        <select
          className="field !w-auto !py-2 text-sm"
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          disabled={tab === "Trending" || tab === "Ending Soon"}
        >
          {SORTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="ml-auto text-sm text-slate-400">{results.length} results</span>
      </div>

      {/* Results */}
      {visible.length === 0 ? (
        <div className="glass-card mt-6 px-6 py-16 text-center">
          <p className="text-lg font-black text-slate-900">Nothing matches</p>
          <p className="mt-2 text-sm text-slate-500">Try another tab, category, or search.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((i) =>
              i.kind === "campaign" && i.campaign ? (
                <CampaignCard key={i.key} c={i.campaign} />
              ) : i.token ? (
                <TokenCard key={i.key} token={i.token} />
              ) : null,
            )}
          </div>
          {results.length > limit && (
            <div className="mt-8 flex justify-center">
              <button onClick={() => setLimit((n) => n + PAGE)} className="btn-ghost">
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
