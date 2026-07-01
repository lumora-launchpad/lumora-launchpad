"use client";

import { useState } from "react";
import Link from "next/link";
import { formatEther } from "viem";
import { useReadContracts } from "wagmi";
import { tokenAbi } from "@/lib/contracts";
import { shortAddress } from "@/lib/tokens";
import { type DisplayCampaign } from "@/lib/campaignDisplay";
import { useTradeHistory } from "@/lib/useTradeHistory";
import { LIFECYCLE_META } from "@/lib/lifecycle";
import { BackButton } from "@/components/BackButton";
import { ShareButton } from "@/components/ShareButton";
import { PriceChart } from "@/components/PriceChart";
import { TradeFeed } from "@/components/TradeFeed";
import { Holders } from "@/components/Holders";
import { Comments } from "@/components/Comments";
import { CampaignCard } from "./CampaignCard";
import { TokenTradePanel } from "./TokenTradePanel";
import { Icon } from "./icons";

type Tab = "chart" | "trades" | "holders" | "comments";

function fmtEth(v: bigint | undefined, max = 6): string {
  if (v === undefined) return "-";
  const n = Number(formatEther(v));
  if (n === 0) return "0";
  if (n < 0.000001) return n.toExponential(2);
  return n.toLocaleString("en-US", { maximumFractionDigits: max });
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/70 bg-white/60 p-4">
      <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 truncate text-base font-black text-slate-900 sm:text-lg">{value}</p>
    </div>
  );
}

export type LaunchedProjectData = {
  token: `0x${string}`;
  name: string;
  symbol: string;
  creator: string;
  accent: string;
  verified?: boolean;
  imageUrl?: string;
  bannerUrl?: string;
  category?: string;
  fundedEth: number;
  targetEth: number;
  supporters?: number;
  committed: bigint; // viewer's commitment
  claimable: bigint; // viewer's claimable token amount
  claimed: boolean;
};

export function LaunchedProject({
  d,
  claimNode,
  related,
}: {
  d: LaunchedProjectData;
  claimNode: React.ReactNode;
  related: DisplayCampaign[];
}) {
  const [tab, setTab] = useState<Tab>("chart");
  const { trades, isLoading: tradesLoading } = useTradeHistory(d.token);

  const { data: info } = useReadContracts({
    contracts: [
      { address: d.token, abi: tokenAbi, functionName: "currentPrice" },
      { address: d.token, abi: tokenAbi, functionName: "marketCap" },
      { address: d.token, abi: tokenAbi, functionName: "graduationProgressBps" },
      { address: d.token, abi: tokenAbi, functionName: "realEthReserve" },
      { address: d.token, abi: tokenAbi, functionName: "graduated" },
    ],
  });
  const price = info?.[0]?.result as bigint | undefined;
  const mcap = info?.[1]?.result as bigint | undefined;
  const bps = info?.[2]?.result as bigint | undefined;
  const reserve = info?.[3]?.result as bigint | undefined;
  const graduated = Boolean(info?.[4]?.result);
  const gradProgress = bps ? Math.min(Number(bps) / 100, 100) : 0;

  const life = graduated ? LIFECYCLE_META.graduated : LIFECYCLE_META.trading;
  const isBacker = d.committed > 0n;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <BackButton label="Back to explore" fallback="/explore" />

      {/* Header */}
      <div className="glass-card mt-4 overflow-hidden">
        <div className={`relative h-36 bg-gradient-to-br ${d.accent} sm:h-44`}>
          {(d.bannerUrl || d.imageUrl) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={d.bannerUrl || d.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
          )}
          <div className="absolute inset-0 opacity-30 [background:radial-gradient(70%_80%_at_25%_15%,white,transparent)]" />
          <span className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur">
            {graduated ? "Graduated" : `${Math.round(gradProgress)}% to graduation`}
          </span>
        </div>
        <div className="p-5 sm:p-6">
          <div className="-mt-16 flex flex-wrap items-end gap-4">
            {d.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.imageUrl} alt={d.name} className="h-20 w-20 rounded-2xl object-cover shadow-glow ring-4 ring-white" />
            ) : (
              <span className={`grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br ${d.accent} text-2xl font-black text-white shadow-glow ring-4 ring-white`}>
                {d.symbol.slice(0, 2)}
              </span>
            )}
            <div className="min-w-0 flex-1 pb-1">
              <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900">
                <span className="truncate">{d.name}</span>
                {d.verified && (
                  <span title="Verified Builder" className="inline-grid h-5 w-5 shrink-0 place-items-center rounded-full bg-base-mint text-white">
                    <Icon name="check" className="h-3.5 w-3.5" />
                  </span>
                )}
              </h1>
              <p className="text-sm font-semibold text-slate-400">${d.symbol} / {shortAddress(d.token)}</p>
            </div>
            <ShareButton name={d.name} symbol={d.symbol} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {d.category && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{d.category}</span>}
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${life.tone}`}>
              <span className={`h-2 w-2 rounded-full ${life.dot}`} />
              {life.label}
            </span>
          </div>

          {/* Graduation progress replaces funding progress */}
          {!graduated && (
            <div className="mt-5">
              <div className="flex items-center justify-between text-sm font-medium text-slate-500">
                <span>Graduation progress</span>
                <span className="font-bold text-slate-700">{Math.round(gradProgress)}%</span>
              </div>
              <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand-gradient transition-all" style={{ width: `${gradProgress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Launch moment / early supporter */}
      {isBacker && (
        <section className="mt-4 overflow-hidden rounded-3xl border border-base-violet/20 bg-brand-gradient p-5 text-white shadow-glow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold backdrop-blur">
                <Icon name="spark" className="h-3.5 w-3.5" /> Early supporter
              </p>
              <p className="mt-2 text-lg font-black">Demand proven. {d.symbol} launched.</p>
              <p className="text-sm text-white/80">
                You committed {fmtEth(d.committed, 4)} ETH to make this happen.
                {d.claimed ? " You claimed your allocation." : " Claim your tokens below."}
              </p>
            </div>
            <div className="shrink-0">{claimNode}</div>
          </div>
        </section>
      )}

      {/* Campaign summary strip */}
      <section className="glass-card mt-4 flex flex-wrap items-center gap-x-8 gap-y-2 p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Funded</p>
          <p className="text-sm font-black text-slate-900">
            {d.fundedEth.toLocaleString("en-US", { maximumFractionDigits: 3 })} / {d.targetEth.toLocaleString("en-US", { maximumFractionDigits: 2 })} ETH
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Supporters</p>
          <p className="text-sm font-black text-slate-900">{(d.supporters ?? 0).toLocaleString("en-US")}</p>
        </div>
        <p className="text-xs text-slate-400">This project proved demand as a campaign, then launched its token.</p>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left: stats + chart + tabs */}
        <div className="min-w-0 space-y-6">
          <section className="glass-card p-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Price" value={`${fmtEth(price)} ETH`} />
              <Stat label="Market Cap" value={`${fmtEth(mcap, 2)} ETH`} />
              <Stat label={graduated ? "Status" : "Graduation"} value={graduated ? "Graduated" : `${Math.round(gradProgress)}%`} />
              <Stat label={graduated ? "Liquidity" : "In curve"} value={`${fmtEth(reserve, 3)} ETH`} />
            </div>
          </section>

          <section className="glass-card p-6">
            <div className="-mx-2 flex gap-1 overflow-x-auto px-2">
              {(["chart", "trades", "holders", "comments"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold capitalize transition ${
                    tab === t ? "bg-brand-gradient text-white shadow-glow" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="mt-5">
              {tab === "chart" && <PriceChart trades={trades} isLoading={tradesLoading} />}
              {tab === "trades" && <TradeFeed trades={trades} isLoading={tradesLoading} />}
              {tab === "holders" && <Holders address={d.token} />}
              {tab === "comments" && <Comments address={d.token} />}
            </div>
          </section>
        </div>

        {/* Right: trade */}
        <div className="min-w-0 space-y-6">
          <TokenTradePanel token={d.token} symbol={d.symbol} graduated={graduated} />
          <div className="glass-card p-5 text-sm text-slate-600">
            <p className="font-bold text-slate-800">by {shortAddress(d.creator)}</p>
            <Link href={`/creator/${d.creator}`} className="text-xs font-semibold text-base-blue hover:underline">
              View creator profile
            </Link>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-black tracking-tight text-slate-900">
            Related <span className="gradient-text">campaigns</span>
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {related.slice(0, 3).map((rc) => (
              <CampaignCard key={rc.key} c={rc} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
