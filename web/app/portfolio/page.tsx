"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount, useReadContracts } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { usePortfolio, type PortfolioHolding } from "@/lib/useTokens";
import { useCreatorTokens } from "@/lib/useCreatorTokens";
import { useCampaigns, type CampaignView } from "@/lib/useCampaigns";
import { campaignAbi } from "@/lib/campaigns";
import { formatEth } from "@/lib/tokens";
import { TokenCard } from "@/components/TokenCard";
import { Countdown } from "@/components/Countdown";

const ZERO = "0x0000000000000000000000000000000000000000" as `0x${string}`;

type Tab = "holdings" | "created" | "campaigns" | "backed";

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
    <div className="card flex flex-col items-center gap-4 py-16 text-center">
      <svg viewBox="0 0 64 64" className="h-16 w-16 text-slate-200" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="10" y="18" width="44" height="34" rx="6" />
        <path d="M10 28h44M22 18v-4a4 4 0 014-4h12a4 4 0 014 4v4" />
        <circle cx="32" cy="40" r="5" />
      </svg>
      <p className="text-lg font-bold">{title}</p>
      <p className="max-w-sm text-sm text-slate-500">{body}</p>
      {cta && (
        <Link href={cta.href} className="btn-primary">
          {cta.label}
        </Link>
      )}
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
  return (
    <Link
      href={`/campaign/${c.address}`}
      className="card group flex items-center gap-4 transition hover:-translate-y-1 hover:shadow-glow"
    >
      <div
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${c.accent} text-sm font-black text-white shadow-glow`}
      >
        {c.symbol.slice(0, 2)}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-bold leading-tight">{c.name}</h3>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-gradient"
            style={{ width: `${Math.min(c.progress, 100)}%` }}
          />
        </div>
        {committed != null && committed > 0n && (
          <p className="mt-1.5 text-xs text-slate-400">
            You committed{" "}
            <span className="font-semibold text-slate-600">
              {formatEth(committed)} ETH
            </span>
            {claimable != null && claimable > 0n && c.launched && (
              <span className="ml-2 font-semibold text-base-mint">
                claimable now
              </span>
            )}
          </p>
        )}
      </div>
      <span
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
          c.launched
            ? "bg-base-mint/15 text-base-mint"
            : ended
              ? "bg-slate-100 text-slate-500"
              : "bg-base-violet/10 text-base-violet"
        }`}
      >
        {c.launched ? "Launched" : ended ? "Ended" : <Countdown deadline={c.deadline} />}
      </span>
    </Link>
  );
}

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState<Tab>("holdings");

  const { holdings, isLoading, hasFactory } = usePortfolio(address);
  const { tokens: created } = useCreatorTokens(address);
  const { campaigns } = useCampaigns();

  const myCampaigns = campaigns.filter(
    (c) => address && c.creator.toLowerCase() === address.toLowerCase(),
  );

  // Read the connected wallet's commitment and claimable amount on every
  // campaign, to find the ones they backed.
  const { data: backedData } = useReadContracts({
    contracts: campaigns.flatMap((c) => [
      { address: c.address, abi: campaignAbi, functionName: "committed", args: [address ?? ZERO] } as const,
      { address: c.address, abi: campaignAbi, functionName: "claimable", args: [address ?? ZERO] } as const,
    ]),
    query: { enabled: isConnected && campaigns.length > 0 },
  });

  const backed = campaigns
    .map((c, i) => ({
      c,
      committed: (backedData?.[i * 2]?.result as bigint) ?? 0n,
      claimable: (backedData?.[i * 2 + 1]?.result as bigint) ?? 0n,
    }))
    .filter((x) => x.committed > 0n);

  const totalValueWei = holdings.reduce((sum, h) => sum + h.valueWei, 0n);

  const TABS: { id: Tab; label: string; count: number }[] = [
    { id: "holdings", label: "Holdings", count: holdings.length },
    { id: "created", label: "Created tokens", count: created.length },
    { id: "campaigns", label: "My campaigns", count: myCampaigns.length },
    { id: "backed", label: "Backed", count: backed.length },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight">
          Your <span className="gradient-text">portfolio</span>
        </h1>
        <p className="mt-1 text-slate-500">
          Tokens you hold and create, and the campaigns you run and back.
        </p>
      </div>

      {!isConnected ? (
        <div className="card flex flex-col items-center gap-4 py-14 text-center">
          <p className="text-lg font-bold">Connect your wallet</p>
          <p className="max-w-sm text-sm text-slate-500">
            Connect a wallet to see your holdings, tokens, and campaigns.
          </p>
          <ConnectButton />
        </div>
      ) : !hasFactory ? (
        <div className="card py-14 text-center text-sm text-slate-500">
          The factory is not connected yet. Set NEXT_PUBLIC_FACTORY_ADDRESS to
          see a live portfolio.
        </div>
      ) : (
        <>
          {/* Value summary */}
          <div className="card mb-8 flex flex-col items-center gap-1 bg-brand-gradient py-8 text-center text-white sm:flex-row sm:justify-between sm:px-10 sm:text-left">
            <div>
              <p className="text-sm font-medium text-white/80">
                Total holdings value
              </p>
              <p className="mt-1 text-3xl font-black">
                {formatEth(totalValueWei)} ETH
              </p>
            </div>
            <p className="mt-2 text-sm text-white/80 sm:mt-0">
              {holdings.length} held, {created.length} created,{" "}
              {backed.length} backed
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex flex-wrap gap-1.5 rounded-2xl bg-slate-100 p-1 sm:w-fit">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-xl px-4 py-1.5 text-sm font-bold transition ${
                  tab === t.id
                    ? "bg-white text-base-blue shadow"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.label}
                <span className="ml-1.5 text-xs text-slate-400">{t.count}</span>
              </button>
            ))}
          </div>

          {/* Holdings */}
          {tab === "holdings" &&
            (isLoading ? (
              <GridSkeleton />
            ) : holdings.length === 0 ? (
              <EmptyState
                title="No tokens held yet"
                body="You do not hold any Lumora tokens yet. Explore what is rising and start trading."
                cta={{ href: "/explore", label: "Explore tokens" }}
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {holdings.map((h) => (
                  <PortfolioCard key={h.address} holding={h} />
                ))}
              </div>
            ))}

          {/* Created tokens */}
          {tab === "created" &&
            (created.length === 0 ? (
              <EmptyState
                title="No tokens created yet"
                body="Launch your first token on a fair bonding curve in seconds."
                cta={{ href: "/create", label: "Create a token" }}
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {created.map((t) => (
                  <TokenCard key={t.address} token={t} />
                ))}
              </div>
            ))}

          {/* My campaigns */}
          {tab === "campaigns" &&
            (myCampaigns.length === 0 ? (
              <EmptyState
                title="No campaigns yet"
                body="Run a demand gated campaign so your token launches only when real backers commit."
                cta={{ href: "/campaigns", label: "Start a campaign" }}
              />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {myCampaigns.map((c) => (
                  <CampaignRow key={c.address} c={c} />
                ))}
              </div>
            ))}

          {/* Backed campaigns */}
          {tab === "backed" &&
            (backed.length === 0 ? (
              <EmptyState
                title="No campaigns backed yet"
                body="Back a campaign you believe in. If it hits the target you claim tokens pro rata, otherwise you refund in full."
                cta={{ href: "/campaigns", label: "Browse campaigns" }}
              />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {backed.map(({ c, committed, claimable }) => (
                  <CampaignRow
                    key={c.address}
                    c={c}
                    committed={committed}
                    claimable={claimable}
                  />
                ))}
              </div>
            ))}
        </>
      )}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-100" />
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-slate-100" />
              <div className="h-3 w-16 rounded bg-slate-100" />
            </div>
          </div>
          <div className="mt-6 h-4 w-20 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function PortfolioCard({ holding }: { holding: PortfolioHolding }) {
  return (
    <Link
      href={`/token/${holding.address}`}
      className="card group block transition hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="flex items-center gap-4">
        <div
          className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${holding.accent} text-xl font-black text-white shadow-glow`}
        >
          {holding.symbol.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold leading-tight">
            {holding.name}
          </h3>
          <p className="text-sm font-medium text-slate-400">
            ${holding.symbol}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">Balance</p>
          <p className="font-bold text-slate-800">
            {formatEth(holding.balance)} {holding.symbol}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-slate-400">Estimated value</p>
          <p className="font-bold text-slate-800">
            {formatEth(holding.valueWei)} ETH
          </p>
        </div>
      </div>
    </Link>
  );
}
