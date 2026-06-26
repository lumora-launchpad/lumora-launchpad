"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { usePortfolio, type PortfolioHolding } from "@/lib/useTokens";
import { formatEth } from "@/lib/tokens";

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const { holdings, isLoading, hasFactory } = usePortfolio(address);

  const totalValueWei = holdings.reduce((sum, h) => sum + h.valueWei, 0n);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tight">
          Your <span className="gradient-text">portfolio</span>
        </h1>
        <p className="mt-1 text-slate-500">
          Every Lumora token held by the connected wallet.
        </p>
      </div>

      {!isConnected ? (
        <div className="card flex flex-col items-center gap-4 py-14 text-center">
          <p className="text-lg font-bold">Connect your wallet</p>
          <p className="max-w-sm text-sm text-slate-500">
            Connect a wallet to see the tokens you hold and their estimated
            value.
          </p>
          <ConnectButton />
        </div>
      ) : !hasFactory ? (
        <div className="card py-14 text-center text-sm text-slate-500">
          The factory is not connected yet. Set NEXT_PUBLIC_FACTORY_ADDRESS to
          see a live portfolio.
        </div>
      ) : isLoading ? (
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
      ) : holdings.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 py-14 text-center">
          <p className="text-lg font-bold">No tokens yet</p>
          <p className="max-w-sm text-sm text-slate-500">
            You do not hold any Lumora tokens yet. Explore the tokens that are
            rising and start trading.
          </p>
          <Link href="/" className="btn-primary">
            Explore tokens
          </Link>
        </div>
      ) : (
        <>
          <div className="card mb-8 flex flex-col items-center gap-1 bg-brand-gradient py-8 text-center text-white sm:flex-row sm:justify-between sm:px-10 sm:text-left">
            <div>
              <p className="text-sm font-medium text-white/80">
                Total portfolio value
              </p>
              <p className="mt-1 text-3xl font-black">
                {formatEth(totalValueWei)} ETH
              </p>
            </div>
            <p className="mt-2 text-sm text-white/80 sm:mt-0">
              {holdings.length} tokens held
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {holdings.map((h) => (
              <PortfolioCard key={h.address} holding={h} />
            ))}
          </div>
        </>
      )}
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
          <p className="text-xs font-medium text-slate-400">
            Estimated value
          </p>
          <p className="font-bold text-slate-800">
            {formatEth(holding.valueWei)} ETH
          </p>
        </div>
      </div>
    </Link>
  );
}
