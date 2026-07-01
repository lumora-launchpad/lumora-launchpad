"use client";

import { useEffect, useRef, useState } from "react";
import { decodeEventLog, parseEther } from "viem";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSignMessage,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FACTORY_ADDRESS, factoryAbi } from "@/lib/contracts";
import { CAMPAIGN_FACTORY_ADDRESS, campaignFactoryAbi } from "@/lib/campaigns";
import { metadataMessage } from "@/lib/metadataAuth";
import { txExplorerUrl } from "@/lib/wagmi";
import { useToast } from "@/components/Toast";
import { Icon } from "@/components/dashboard/icons";
import { DEMAND_LAUNCH_AT, isDemandOpen } from "@/lib/phase";
import { PhaseCountdown } from "@/components/dashboard/PhaseCountdown";

type Mode = "demand" | "instant";

const CATEGORIES = ["AI", "Meme", "Gaming", "DeFi", "NFT", "Infrastructure", "Utility", "SocialFi"];
const DURATIONS = [
  { label: "1 day", secs: 86400 },
  { label: "3 days", secs: 259200 },
  { label: "7 days", secs: 604800 },
];

export default function LaunchPage() {
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { showToast, dismissToast } = useToast();

  const [mode, setMode] = useState<Mode>("demand");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [website, setWebsite] = useState("");
  const [x, setX] = useState("");
  const [telegram, setTelegram] = useState("");
  const [discord, setDiscord] = useState("");
  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");
  const [target, setTarget] = useState("");
  const [duration, setDuration] = useState(DURATIONS[1].secs);
  const [uploading, setUploading] = useState<"" | "logo" | "banner">("");

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { data: receipt, isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  const pendingToastId = useRef<number | null>(null);
  const reportedHash = useRef<string | null>(null);
  const saved = useRef(false);

  useEffect(() => {
    if (isPending && pendingToastId.current === null) {
      pendingToastId.current = showToast({ title: "Confirm in your wallet", variant: "pending" });
    }
  }, [isPending, showToast]);

  useEffect(() => {
    if (!hash || reportedHash.current === hash) return;
    reportedHash.current = hash;
    if (pendingToastId.current !== null) {
      dismissToast(pendingToastId.current);
      pendingToastId.current = null;
    }
    pendingToastId.current = showToast({
      title: "Transaction submitted",
      description: "Waiting for confirmation.",
      variant: "pending",
      href: txExplorerUrl(hash),
    });
  }, [hash, showToast, dismissToast]);

  useEffect(() => {
    if (!isSuccess || !hash) return;
    if (pendingToastId.current !== null) {
      dismissToast(pendingToastId.current);
      pendingToastId.current = null;
    }
    showToast({
      title: mode === "demand" ? "Campaign created" : "Token launched",
      variant: "success",
      href: txExplorerUrl(hash),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, hash]);

  useEffect(() => {
    if (!error) return;
    if (pendingToastId.current !== null) {
      dismissToast(pendingToastId.current);
      pendingToastId.current = null;
    }
    showToast({ title: "Transaction failed", description: error.message.slice(0, 120), variant: "error" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  // After deploy, store the off chain metadata keyed by the new address.
  useEffect(() => {
    if (!isSuccess || !receipt || saved.current) return;
    const hasMeta = description || logo || banner || category || website || x || telegram || discord;
    if (!hasMeta) return;

    const factory = mode === "demand" ? CAMPAIGN_FACTORY_ADDRESS : FACTORY_ADDRESS;
    const log = receipt.logs.find((l) => l.address.toLowerCase() === factory.toLowerCase());
    if (!log) return;

    try {
      const decoded =
        mode === "demand"
          ? decodeEventLog({ abi: campaignFactoryAbi, eventName: "CampaignCreated", data: log.data, topics: log.topics })
          : decodeEventLog({ abi: factoryAbi, eventName: "TokenCreated", data: log.data, topics: log.topics });
      const address = (mode === "demand"
        ? (decoded.args as { campaign: string }).campaign
        : (decoded.args as { token: string }).token) as string;
      saved.current = true;
      void (async () => {
        try {
          const signedAt = Date.now();
          const signature = await signMessageAsync({ message: metadataMessage(address, signedAt) });
          await fetch("/api/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              address,
              signedAt,
              signature,
              description,
              category,
              imageUrl: logo,
              bannerUrl: banner,
              website,
              x,
              telegram,
              discord,
            }),
          });
        } catch {
          // Signature rejected or request failed; the project is still live.
        }
      })();
    } catch {
      // ignore non matching logs
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, receipt]);

  async function upload(e: React.ChangeEvent<HTMLInputElement>, which: "logo" | "banner") {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(which);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) (which === "logo" ? setLogo : setBanner)(data.url);
    } catch {
      // ignore
    } finally {
      setUploading("");
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || symbol.length < 2) return;
    saved.current = false;
    if (mode === "instant") {
      writeContract({ address: FACTORY_ADDRESS, abi: factoryAbi, functionName: "createToken", args: [name, symbol.toUpperCase()] });
      return;
    }
    let targetWei: bigint;
    try {
      targetWei = parseEther(target as `${number}`);
    } catch {
      return;
    }
    if (targetWei <= 0n) return;
    writeContract({
      address: CAMPAIGN_FACTORY_ADDRESS,
      abi: campaignFactoryAbi,
      functionName: "createCampaign",
      args: [name, symbol.toUpperCase(), targetWei, BigInt(duration)],
    });
  }

  const busy = isPending || isConfirming;
  const demandLocked = mode === "demand" && !isDemandOpen();
  const canSubmit = name && symbol.length >= 2 && (mode === "instant" || Number(target) > 0);
  const cta = isPending
    ? "Confirm in wallet"
    : isConfirming
      ? "Processing"
      : mode === "demand"
        ? "Create campaign"
        : "Launch now";

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Launch</h1>
        <p className="mt-1 text-slate-500">
          Create a new project on Base. Both mint the full supply to a fair
          bonding curve, with no presale and no insider allocation.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {[
          { id: "demand" as Mode, icon: "target", title: "Demand Campaign", desc: "Launch only when supporters reach the target. Full refunds if it falls short." },
          { id: "instant" as Mode, icon: "bolt", title: "Instant Launch", desc: "Deploy now and trade from second one. No target, no waiting." },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`glass-card flex items-start gap-3 p-5 text-left transition ${
              mode === m.id ? "ring-2 ring-base-violet" : "hover:shadow-glow"
            }`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
              <Icon name={m.icon as "target" | "bolt"} className="h-5 w-5" />
            </span>
            <span>
              <span className="flex items-center gap-2 font-black text-slate-900">
                {m.title}
                {m.id === "demand" && !isDemandOpen() && (
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                    Opens soon
                  </span>
                )}
                {m.id === "instant" && !isDemandOpen() && (
                  <span className="rounded-full bg-base-mint/10 px-2 py-0.5 text-[10px] font-bold text-base-mint">
                    Available now
                  </span>
                )}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">{m.desc}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form */}
        <form onSubmit={submit} className="glass-card p-6 lg:col-span-3">
          {/* Images */}
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageField label="Project logo" url={logo} busy={uploading === "logo"} onPick={(e) => upload(e, "logo")} onClear={() => setLogo("")} square />
            <ImageField label="Project banner" url={banner} busy={uploading === "banner"} onPick={(e) => upload(e, "banner")} onClear={() => setBanner("")} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Labeled label="Project name">
              <input className="field" placeholder="For example NovaPlay" value={name} maxLength={32} onChange={(e) => setName(e.target.value)} />
            </Labeled>
            <Labeled label="Token symbol">
              <input className="field uppercase" placeholder="NOVA" value={symbol} maxLength={8} onChange={(e) => setSymbol(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))} />
            </Labeled>
          </div>

          <Labeled label="Description" className="mt-3">
            <textarea className="field min-h-20 resize-none" placeholder="Describe your project in a sentence or two." value={description} maxLength={280} onChange={(e) => setDescription(e.target.value)} />
          </Labeled>

          <Labeled label="Category" className="mt-3">
            <select className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select a category (optional)</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Labeled>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Labeled label="Website"><input className="field" placeholder="https://" value={website} onChange={(e) => setWebsite(e.target.value)} /></Labeled>
            <Labeled label="X account"><input className="field" placeholder="https://x.com/..." value={x} onChange={(e) => setX(e.target.value)} /></Labeled>
            <Labeled label="Telegram"><input className="field" placeholder="https://t.me/..." value={telegram} onChange={(e) => setTelegram(e.target.value)} /></Labeled>
            <Labeled label="Discord"><input className="field" placeholder="https://discord.gg/..." value={discord} onChange={(e) => setDiscord(e.target.value)} /></Labeled>
          </div>

          {/* Demand only */}
          {mode === "demand" && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Labeled label="Funding target (ETH)">
                <input className="field" inputMode="decimal" placeholder="0.6" value={target} onChange={(e) => setTarget(e.target.value.replace(/[^0-9.]/g, ""))} />
              </Labeled>
              <Labeled label="Campaign duration">
                <select className="field" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                  {DURATIONS.map((d) => (
                    <option key={d.secs} value={d.secs}>{d.label}</option>
                  ))}
                </select>
              </Labeled>
            </div>
          )}

          <div className="mt-6">
            {demandLocked ? (
              <div className="rounded-2xl bg-brand-gradient p-5 text-center text-white shadow-glow">
                <p className="text-sm font-bold">Demand Campaigns open in</p>
                <PhaseCountdown to={DEMAND_LAUNCH_AT} className="mt-3 justify-center" />
                <p className="mt-4 text-xs text-white/80">
                  Prepare your campaign now. Publishing opens on launch day.
                  Instant Launch is available right now.
                </p>
              </div>
            ) : !isConnected ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-slate-500">Connect your wallet to launch.</p>
                <ConnectButton />
              </div>
            ) : (
              <button type="submit" disabled={busy || !canSubmit} className="btn-primary w-full">
                {cta}
              </button>
            )}
          </div>
          {isSuccess && (
            <p className="mt-3 rounded-2xl bg-base-mint/10 px-4 py-3 text-center text-sm font-semibold text-base-mint">
              {mode === "demand" ? "Campaign created. It will appear in Explore shortly." : "Token launched and live on the curve."}
            </p>
          )}
        </form>

        {/* Review */}
        <aside className="lg:col-span-2">
          <div className="glass-card sticky top-24 overflow-hidden">
            <div className={`relative h-24 ${banner ? "" : "bg-brand-gradient"}`}>
              {banner && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={banner} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="p-5">
              <div className="-mt-12 flex items-end gap-3">
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt="" className="h-16 w-16 rounded-2xl object-cover shadow-glow ring-4 ring-white" />
                ) : (
                  <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient text-xl font-black text-white shadow-glow ring-4 ring-white">
                    {symbol ? symbol.toUpperCase().slice(0, 2) : "LU"}
                  </span>
                )}
                <div className="min-w-0 pb-1">
                  <h3 className="truncate text-lg font-black text-slate-900">{name || "Project name"}</h3>
                  <p className="text-xs font-semibold text-slate-400">${symbol ? symbol.toUpperCase() : "SYMBOL"}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                  {mode === "demand" ? "Demand Campaign" : "Instant Launch"}
                </span>
                {category && <span className="rounded-full bg-base-blue/10 px-2.5 py-1 text-[11px] font-bold text-base-blue">{category}</span>}
              </div>
              <p className="mt-3 text-sm text-slate-500">{description || "Your description will appear here."}</p>

              <div className="mt-5 space-y-2 text-sm">
                <Row k="Total supply" v="1,000,000,000" />
                <Row k="On the bonding curve" v="100%" />
                <Row k="Presale / insiders" v="0%" />
                {mode === "demand" ? (
                  <>
                    <Row k="Funding target" v={target ? `${target} ETH` : "Set a target"} />
                    <Row k="Duration" v={DURATIONS.find((d) => d.secs === duration)?.label ?? ""} />
                    <Row k="If target missed" v="Full refund" />
                  </>
                ) : (
                  <>
                    <Row k="Trading" v="Starts immediately" />
                    <Row k="Funding target" v="None" />
                  </>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Labeled({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
      <span className="text-slate-500">{k}</span>
      <span className="font-bold text-slate-800">{v}</span>
    </div>
  );
}

function ImageField({
  label,
  url,
  busy,
  onPick,
  onClear,
  square = false,
}: {
  label: string;
  url: string;
  busy: boolean;
  onPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  square?: boolean;
}) {
  return (
    <div>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="mt-2">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className={`${square ? "h-20 w-20" : "h-20 w-full"} rounded-2xl object-cover shadow-glow`} />
        ) : (
          <div className={`grid ${square ? "h-20 w-20" : "h-20 w-full"} place-items-center rounded-2xl bg-slate-100 text-xs font-medium text-slate-400`}>
            none
          </div>
        )}
        <div className="mt-2 flex items-center gap-2">
          <label className="btn-ghost cursor-pointer !px-3 !py-1.5 text-xs">
            {busy ? "Uploading" : url ? "Change" : "Upload"}
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" disabled={busy} onChange={onPick} />
          </label>
          {url && (
            <button type="button" onClick={onClear} className="text-xs font-semibold text-slate-400 transition hover:text-base-pink">
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
