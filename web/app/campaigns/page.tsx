"use client";

import { useState } from "react";
import Link from "next/link";
import { parseEther } from "viem";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  CAMPAIGN_FACTORY_ADDRESS,
  campaignFactoryAbi,
} from "@/lib/campaigns";
import { useCampaigns, type CampaignView } from "@/lib/useCampaigns";
import { Countdown } from "@/components/Countdown";

const DURATIONS = [
  { label: "1 day", secs: 86400 },
  { label: "3 days", secs: 259200 },
  { label: "7 days", secs: 604800 },
];

function CampaignCard({ c }: { c: CampaignView }) {
  return (
    <Link
      href={`/campaign/${c.address}`}
      className="card group block transition hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="flex items-center gap-4">
        <div
          className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${c.accent} text-xl font-black text-white shadow-glow`}
        >
          {c.symbol.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold leading-tight">{c.name}</h3>
          <p className="text-sm font-medium text-slate-400">${c.symbol}</p>
        </div>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${
            c.launched
              ? "bg-base-mint/15 text-base-mint"
              : "bg-base-violet/10 text-base-violet"
          }`}
        >
          {c.launched ? "Launched" : <Countdown deadline={c.deadline} />}
        </span>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Backed</span>
          <span className="font-bold text-slate-700">
            {Math.round(c.progress)}%
          </span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-gradient transition-all"
            style={{ width: `${Math.min(c.progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-sm font-bold text-base-blue transition group-hover:translate-x-1">
          {c.launched ? "View token" : "Back this"}
        </span>
      </div>
    </Link>
  );
}

function CreateForm() {
  const { isConnected } = useAccount();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [target, setTarget] = useState("");
  const [duration, setDuration] = useState(DURATIONS[1].secs);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !symbol || !target) return;
    let targetWei: bigint;
    try {
      targetWei = parseEther(target as `${number}`);
    } catch {
      return;
    }
    writeContract({
      address: CAMPAIGN_FACTORY_ADDRESS,
      abi: campaignFactoryAbi,
      functionName: "createCampaign",
      args: [name, symbol.toUpperCase(), targetWei, BigInt(duration)],
    });
  }

  return (
    <form onSubmit={submit} className="card">
      <h2 className="text-lg font-black">Start a campaign</h2>
      <p className="mt-1 text-sm text-slate-500">
        Raise commitments. When the target is reached, the token launches and
        backers claim their share. If it falls short, everyone refunds.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <input
          className="field"
          placeholder="Token name"
          value={name}
          maxLength={32}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="field uppercase"
          placeholder="Symbol"
          value={symbol}
          maxLength={8}
          onChange={(e) =>
            setSymbol(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))
          }
        />
        <input
          className="field"
          placeholder="Target (ETH)"
          inputMode="decimal"
          value={target}
          onChange={(e) => setTarget(e.target.value.replace(/[^0-9.]/g, ""))}
        />
        <select
          className="field"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        >
          {DURATIONS.map((d) => (
            <option key={d.secs} value={d.secs}>
              {d.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-5">
        {!isConnected ? (
          <ConnectButton />
        ) : (
          <button
            type="submit"
            className="btn-primary w-full sm:w-auto"
            disabled={isPending || isConfirming || !name || !symbol || !target}
          >
            {isPending
              ? "Confirm in wallet"
              : isConfirming
                ? "Creating"
                : "Create campaign"}
          </button>
        )}
      </div>
      {isSuccess && (
        <p className="mt-3 text-sm font-semibold text-base-mint">
          Campaign created. It will appear below shortly.
        </p>
      )}
    </form>
  );
}

export default function CampaignsPage() {
  const { campaigns, isLoading, hasFactory } = useCampaigns();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight">
          Launch <span className="gradient-text">campaigns</span>
        </h1>
        <p className="mt-1 text-slate-500">
          Demand gated launches. A token only goes live once enough people back
          it, so no empty coins.
        </p>
      </div>

      <CreateForm />

      {!hasFactory ? (
        <p className="mt-8 rounded-2xl border border-slate-200 bg-white/60 px-4 py-10 text-center text-sm text-slate-500">
          Campaign factory not connected. Set NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS.
        </p>
      ) : isLoading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-44 animate-pulse bg-slate-50" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-slate-200 bg-white/60 px-4 py-10 text-center text-sm text-slate-500">
          No campaigns yet. Start the first one above.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {campaigns.map((c) => (
            <CampaignCard key={c.address} c={c} />
          ))}
        </div>
      )}
    </div>
  );
}
