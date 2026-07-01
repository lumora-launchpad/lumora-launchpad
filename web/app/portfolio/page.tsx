"use client";

import { useState } from "react";
import Link from "next/link";
import { formatEther } from "viem";
import { useAccount, useBalance, useReadContracts } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { usePortfolio, type PortfolioHolding } from "@/lib/useTokens";
import { useCreatorTokens } from "@/lib/useCreatorTokens";
import { useCampaigns, type CampaignView } from "@/lib/useCampaigns";
import { useAccountTrades } from "@/lib/useAccountTrades";
import { campaignAbi } from "@/lib/campaigns";
import { formatEth, shortAddress } from "@/lib/tokens";
import { TokenCard } from "@/components/TokenCard";
import { Countdown } from "@/components/Countdown";

const ZERO = "0x0000000000000000000000000000000000000000" as `0x${string}`;

type Tab = "holdings" | "supported" | "created" | "trades";

const eth = (n: number, d = 3) => n.toLocaleString("en-US", { maximumFractionDigits: d });

function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="glass-card flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-lg font-bold">{title}</p>
      <p className="max-w-sm text-sm text-slate-500">{body}</p>
      {cta && (
        <Link href={cta.href} className="btn-primary mt-2">
          {cta.label}
        </Link>
      )}
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`glass-card p-5 ${accent ? "ring-2 ring-base-violet/30" : ""}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

function CampaignRow({
  c,
  committed,
  claimable,
}: {
  c: CampaignView;
  committed?: bigint;
  claimable?: bigint;
}) {
  const now = Math.floor(Date.now() / 1000);
  const ended = !c.launched && c.deadline <= now;
  const refundable = ended && committed != null && committed > 0n;
  return (
    <Link
      href={`/campaign/${c.address}`}
      className="glass-card group flex items-center gap-4 p-5 transition hover:-translate-y-1 hover:shadow-glow"
    >
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${c.accent} text-sm font-black text-white shadow-glow`}>
        {c.symbol.slice(0, 2)}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-bold leading-tight">{c.name}</h3>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${Math.min(c.progress, 100)}%` }} />
        </div>
        {committed != null && committed > 0n && (
          <p className="mt-1.5 text-xs text-slate-400">
            You committed <span className="font-semibold text-slate-600">{formatEth(committed)} ETH</span>
            {claimable != null && claimable > 0n && c.launched && (
              <span className="ml-2 font-semibold text-base-mint">claim available</span>
            )}
            {refundable && <span className="ml-2 font-semibold text-base-pink">refund available</span>}
          </p>
        )}
      </div>
      <span
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
          c.launched ? "bg-base-mint/15 text-base-mint" : ended ? "bg-slate-100 text-slate-500" : "bg-base-violet/10 text-base-violet"
        }`}
      >
        {c.launched ? "Launched" : ended ? "Ended" : <Countdown deadline={c.deadline} />}
      </span>
    </Link>
  );
}

function PortfolioCard({ holding }: { holding: PortfolioHolding }) {
  return (
    <Link href={`/token/${holding.address}`} className="glass-card group block p-5 transition hover:-translate-y-1 hover:shadow-glow">
      <div className="flex items-center gap-4">
        <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${holding.accent} text-xl font-black text-white shadow-glow`}>
          {holding.symbol.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold leading-tight">{holding.name}</h3>
          <p className="text-sm font-medium text-slate-400">${holding.symbol}</p>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">Balance</p>
          <p className="font-bold text-slate-800">{formatEth(holding.balance)} {holding.symbol}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-slate-400">Estimated value</p>
          <p className="font-bold text-slate-800">{formatEth(holding.valueWei)} ETH</p>
        </div>
      </div>
    </Link>
  );
}

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState<Tab>("holdings");

  const { holdings, isLoading, hasFactory } = usePortfolio(address);
  const { tokens: created } = useCreatorTokens(address);
  const { campaigns } = useCampaigns();
  const { data: bal } = useBalance({ address });
  const { trades } = useAccountTrades(address, holdings.map((h) => h.address));

  const myCampaigns = campaigns.filter(
    (c) => address && c.creator.toLowerCase() === address.toLowerCase(),
  );

  const { data: backedData } = useReadContracts({
    contracts: campaigns.flatMap((c) => [
      { address: c.address, abi: campaignAbi, functionName: "committed", args: [address ?? ZERO] } as const,
      { address: c.address, abi: campaignAbi, functionName: "claimable", args: [address ?? ZERO] } as const,
    ]),
    query: { enabled: isConnected && campaigns.length > 0 },
  });

  const now = Math.floor(Date.now() / 1000);
  const backed = campaigns
    .map((c, i) => ({
      c,
      committed: (backedData?.[i * 2]?.result as bigint) ?? 0n,
      claimable: (backedData?.[i * 2 + 1]?.result as bigint) ?? 0n,
    }))
    .filter((x) => x.committed > 0n);

  // Money figures
  const walletEth = bal ? Number(formatEther(bal.value)) : 0;
  const holdingsValueEth = Number(formatEther(holdings.reduce((s, h) => s + h.valueWei, 0n)));
  const committedEth = backed.reduce((s, b) => s + Number(formatEther(b.committed)), 0);
  const claimableEth = backed
    .filter((b) => b.c.launched)
    .reduce((s, b) => s + Number(formatEther(b.claimable)), 0);
  const refundableEth = backed
    .filter((b) => !b.c.launched && b.c.deadline <= now)
    .reduce((s, b) => s + Number(formatEther(b.committed)), 0);
  const portfolioValue = walletEth + holdingsValueEth + committedEth;

  // Estimated PnL: current holdings value minus net ETH put into those tokens.
  const netInvested = trades.reduce((s, t) => s + (t.side === "buy" ? t.eth : -t.eth), 0);
  const pnl = holdingsValueEth - netInvested;

  const symbolByToken = new Map<string, string>();
  for (const h of holdings) symbolByToken.set(h.address.toLowerCase(), h.symbol);
  for (const t of created) symbolByToken.set(t.address.toLowerCase(), t.symbol);

  const TABS: { id: Tab; label: string; count: number }[] = [
    { id: "holdings", label: "Owned Tokens", count: holdings.length },
    { id: "supported", label: "Supported Campaigns", count: backed.length },
    { id: "created", label: "Created Projects", count: created.length + myCampaigns.length },
    { id: "trades", label: "Trading History", count: trades.length },
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Portfolio</h1>
        <p className="mt-1 text-slate-500">
          Your wallet, holdings, supported campaigns, created projects, and
          trading history.
        </p>
      </div>

      {!isConnected ? (
        <div className="glass-card flex flex-col items-center gap-4 py-14 text-center">
          <p className="text-lg font-bold">Connect your wallet</p>
          <p className="max-w-sm text-sm text-slate-500">
            Connect a wallet to see your portfolio value, holdings, and history.
          </p>
          <ConnectButton />
        </div>
      ) : !hasFactory ? (
        <div className="glass-card py-14 text-center text-sm text-slate-500">
          The factory is not connected yet.
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryCard label="Portfolio Value" value={`${eth(portfolioValue)} ETH`} accent />
            <SummaryCard label="Wallet Balance" value={`${eth(walletEth)} ETH`} />
            <SummaryCard label="Claimable Tokens" value={claimableEth > 0 ? `${eth(claimableEth)} ETH` : "None"} />
            <SummaryCard label="Refundable ETH" value={refundableEth > 0 ? `${eth(refundableEth)} ETH` : "None"} />
          </div>

          {/* PnL bar */}
          <div className="glass-card mb-6 flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Holdings value</p>
                <p className="text-lg font-black text-slate-900">{eth(holdingsValueEth)} ETH</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Net invested</p>
                <p className="text-lg font-black text-slate-900">{eth(netInvested)} ETH</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Estimated PnL</p>
                <p className={`text-lg font-black ${pnl >= 0 ? "text-base-mint" : "text-base-pink"}`}>
                  {pnl >= 0 ? "+" : ""}{eth(pnl)} ETH
                </p>
              </div>
            </div>
            <p className="max-w-xs text-xs text-slate-400">
              PnL is an estimate from your on chain buys and sells against the
              current curve value of your holdings.
            </p>
          </div>

          {/* Tabs */}
          <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                  tab === t.id ? "bg-brand-gradient text-white shadow-glow" : "border border-slate-200 bg-white/70 text-slate-600 hover:border-base-blue hover:text-base-blue"
                }`}
              >
                {t.label} <span className="opacity-60">{t.count}</span>
              </button>
            ))}
          </div>

          {tab === "holdings" &&
            (isLoading ? (
              <p className="text-sm text-slate-400">Loading holdings...</p>
            ) : holdings.length === 0 ? (
              <EmptyState title="No tokens held yet" body="Explore what is rising and start trading." cta={{ href: "/explore", label: "Explore" }} />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {holdings.map((h) => (
                  <PortfolioCard key={h.address} holding={h} />
                ))}
              </div>
            ))}

          {tab === "supported" &&
            (backed.length === 0 ? (
              <EmptyState title="No campaigns supported yet" body="Back a campaign. If it hits the target you claim tokens pro rata, otherwise you refund in full." cta={{ href: "/explore", label: "Browse campaigns" }} />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {backed.map(({ c, committed, claimable }) => (
                  <CampaignRow key={c.address} c={c} committed={committed} claimable={claimable} />
                ))}
              </div>
            ))}

          {tab === "created" &&
            (created.length + myCampaigns.length === 0 ? (
              <EmptyState title="No projects created yet" body="Launch a token or run a demand campaign from the Launch page." cta={{ href: "/launch", label: "Launch a project" }} />
            ) : (
              <div className="space-y-6">
                {myCampaigns.length > 0 && (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {myCampaigns.map((c) => (
                      <CampaignRow key={c.address} c={c} />
                    ))}
                  </div>
                )}
                {created.length > 0 && (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {created.map((t) => (
                      <TokenCard key={t.address} token={t} />
                    ))}
                  </div>
                )}
              </div>
            ))}

          {tab === "trades" &&
            (trades.length === 0 ? (
              <EmptyState title="No trades yet" body="Your buys and sells on the bonding curve will show up here." cta={{ href: "/explore", label: "Explore tokens" }} />
            ) : (
              <div className="glass-card divide-y divide-slate-100 overflow-hidden p-0">
                {trades.map((t, i) => (
                  <div key={`${t.token}-${t.block}-${i}`} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${t.side === "buy" ? "bg-base-mint/10 text-base-mint" : "bg-base-pink/10 text-base-pink"}`}>
                        {t.side === "buy" ? "Buy" : "Sell"}
                      </span>
                      <Link href={`/token/${t.token}`} className="text-sm font-bold text-slate-800 hover:underline">
                        ${symbolByToken.get(t.token.toLowerCase()) ?? shortAddress(t.token)}
                      </Link>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{eth(t.eth)} ETH</span>
                  </div>
                ))}
              </div>
            ))}
        </>
      )}
    </div>
  );
}
