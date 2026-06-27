"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { parseEther, decodeEventLog } from "viem";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  CAMPAIGN_FACTORY_ADDRESS,
  campaignFactoryAbi,
} from "@/lib/campaigns";
import { useCampaigns, type CampaignView } from "@/lib/useCampaigns";
import { useCampaignBackers } from "@/lib/useCampaignBackers";
import { Countdown } from "@/components/Countdown";
import { formatEth, shortAddress } from "@/lib/tokens";

const DURATIONS = [
  { label: "1 day", secs: 86400 },
  { label: "3 days", secs: 259200 },
  { label: "7 days", secs: 604800 },
];

function CMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
  );
}

function CampaignCard({ c, backers }: { c: CampaignView; backers?: number }) {
  const [img, setImg] = useState("");
  useEffect(() => {
    let active = true;
    fetch(`/api/token?address=${c.address}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((d: { imageUrl?: string }) => {
        if (active && d.imageUrl) setImg(d.imageUrl);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [c.address]);

  const now = Math.floor(Date.now() / 1000);
  const ended = !c.launched && c.deadline <= now;

  return (
    <Link
      href={`/campaign/${c.address}`}
      className="card group block overflow-hidden transition hover:-translate-y-1 hover:shadow-glow"
    >
      {/* Cover */}
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img}
          alt={c.name}
          loading="lazy"
          decoding="async"
          className="-mx-6 -mt-6 mb-4 h-28 w-[calc(100%+3rem)] object-cover"
        />
      ) : (
        <div
          className={`-mx-6 -mt-6 mb-4 h-28 w-[calc(100%+3rem)] bg-gradient-to-br ${c.accent}`}
        />
      )}

      <div className="flex items-center gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold leading-tight">{c.name}</h3>
          <p className="text-sm font-medium text-slate-400">${c.symbol}</p>
        </div>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${
            c.launched
              ? "bg-base-mint/15 text-base-mint"
              : ended
                ? "bg-slate-100 text-slate-500"
                : "bg-base-violet/10 text-base-violet"
          }`}
        >
          {c.launched ? (
            "Launched"
          ) : ended ? (
            "Ended"
          ) : (
            <Countdown deadline={c.deadline} />
          )}
        </span>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        By{" "}
        <span className="font-semibold text-slate-600">
          {shortAddress(c.creator)}
        </span>
      </p>

      <div className="mt-4">
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

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 px-4 py-3">
        <CMetric label="Committed" value={`${formatEth(c.totalCommitted)} ETH`} />
        <CMetric label="Target" value={`${formatEth(c.targetEth)} ETH`} />
        <CMetric label="Backers" value={backers != null ? String(backers) : "0"} />
      </div>

      <div className="mt-4 flex items-center justify-end">
        <span className="text-sm font-bold text-base-blue transition group-hover:translate-x-1">
          {c.launched ? "View token" : ended ? "View" : "Back this"}
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
  const [blurb, setBlurb] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({ hash });
  const saved = useRef(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) setImageUrl(data.url);
    } catch {
      // ignore
    } finally {
      setUploading(false);
    }
  }

  // After the campaign deploys, store its image and description off chain,
  // keyed by the new campaign address from the CampaignCreated event.
  useEffect(() => {
    if (!isSuccess || !receipt || saved.current) return;
    if (!blurb && !imageUrl) return;
    const log = receipt.logs.find(
      (l) => l.address.toLowerCase() === CAMPAIGN_FACTORY_ADDRESS.toLowerCase(),
    );
    if (!log) return;
    try {
      const decoded = decodeEventLog({
        abi: campaignFactoryAbi,
        eventName: "CampaignCreated",
        data: log.data,
        topics: log.topics,
      });
      const campaignAddress = decoded.args.campaign as string;
      saved.current = true;
      fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: campaignAddress,
          description: blurb,
          imageUrl,
        }),
      }).catch(() => {});
    } catch {
      // ignore non-matching logs
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, receipt]);

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

  const deadlineDate = new Date(Date.now() + duration * 1000);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <form onSubmit={submit} className="card lg:col-span-3">
      <p className="text-sm text-slate-500">
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

      <textarea
        className="field mt-3 min-h-20 resize-none"
        placeholder="Short description (optional)"
        value={blurb}
        maxLength={140}
        onChange={(e) => setBlurb(e.target.value)}
      />

      <div className="mt-3 flex items-center gap-4">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="Campaign"
            loading="lazy"
            decoding="async"
            className="h-14 w-14 rounded-2xl object-cover shadow-glow"
          />
        ) : (
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-xs font-medium text-slate-400">
            none
          </div>
        )}
        <label className="btn-ghost cursor-pointer !px-4 !py-2 text-sm">
          {uploading ? "Uploading" : imageUrl ? "Change image" : "Choose image"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            disabled={uploading}
            onChange={handleFile}
          />
        </label>
        {imageUrl && (
          <button
            type="button"
            onClick={() => setImageUrl("")}
            className="text-xs font-semibold text-slate-400 transition hover:text-base-pink"
          >
            Remove
          </button>
        )}
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

      {/* Live preview */}
      <aside className="lg:col-span-2">
        <div className="card sticky top-24">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Preview
          </p>
          <div className="mt-4 flex items-center gap-4">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={name || "Campaign"}
                loading="lazy"
                decoding="async"
                className="h-16 w-16 rounded-2xl object-cover shadow-glow"
              />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient text-2xl font-black text-white shadow-glow">
                {symbol ? symbol.toUpperCase().slice(0, 2) : "LU"}
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold">{name || "Campaign name"}</h3>
              <p className="text-sm font-medium text-slate-400">
                ${symbol ? symbol.toUpperCase() : "SYMBOL"}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            {blurb || "Your campaign description will appear here."}
          </p>

          <div className="mt-6 space-y-3 text-sm">
            <PRow k="Target" v={target ? `${target} ETH` : "Set a target"} />
            <PRow
              k="Deadline"
              v={deadlineDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            />
            <PRow k="Creator share" v="60% of fees" />
            <PRow k="Commit fee" v="2%" />
          </div>

          <div className="mt-5 space-y-2 rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
            <p>Launches instantly the moment the target is reached.</p>
            <p>
              If the target is not met by the deadline, every backer refunds in
              full.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function PRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
      <span className="text-slate-500">{k}</span>
      <span className="font-bold text-slate-800">{v}</span>
    </div>
  );
}

type Filter = "all" | "active" | "launched" | "ended";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "launched", label: "Launched" },
  { id: "ended", label: "Ended" },
];

export default function CampaignsPage() {
  const { campaigns, isLoading, hasFactory } = useCampaigns();
  const [filter, setFilter] = useState<Filter>("all");
  const backers = useCampaignBackers(campaigns.map((c) => c.address));

  const now = Math.floor(Date.now() / 1000);
  const list = campaigns.filter((c) => {
    if (filter === "launched") return c.launched;
    if (filter === "active") return !c.launched && c.deadline > now;
    if (filter === "ended") return !c.launched && c.deadline <= now;
    return true;
  });

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

      {/* Running campaigns first, so the page feels alive before the form */}
      {hasFactory && campaigns.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-black tracking-tight">Live campaigns</h2>
          <div className="flex gap-1.5 rounded-2xl bg-slate-100 p-1 sm:w-fit">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex-1 rounded-xl px-3 py-1.5 text-sm font-bold transition sm:flex-none ${
                  filter === f.id
                    ? "bg-white text-base-blue shadow"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {!hasFactory ? (
        <p className="rounded-2xl border border-slate-200 bg-white/60 px-4 py-10 text-center text-sm text-slate-500">
          Campaign factory not connected. Set NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS.
        </p>
      ) : isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-44 animate-pulse bg-slate-50" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white/60 px-4 py-10 text-center text-sm text-slate-500">
          {campaigns.length === 0
            ? "No campaigns yet. Start the first one below."
            : "No campaigns match this filter."}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((c) => (
            <CampaignCard
              key={c.address}
              c={c}
              backers={backers.get(c.address.toLowerCase())}
            />
          ))}
        </div>
      )}

      {/* Start a new campaign */}
      <div className="mt-12">
        <h2 className="mb-4 text-xl font-black tracking-tight">
          Start a <span className="gradient-text">campaign</span>
        </h2>
        <CreateForm />
      </div>
    </div>
  );
}
