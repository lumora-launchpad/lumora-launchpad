"use client";

import { useEffect, useRef, useState } from "react";
import { decodeEventLog, formatEther, parseEther } from "viem";
import {
  useAccount,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSignMessage,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FACTORY_ADDRESS, factoryAbi } from "@/lib/contracts";
import { metadataMessage } from "@/lib/metadataAuth";
import { txExplorerUrl } from "@/lib/wagmi";
import { useToast } from "@/components/Toast";

const ZERO = "0x0000000000000000000000000000000000000000";
const TOTAL_SUPPLY = 1_000_000_000;
const CURVE_SUPPLY = 800_000_000;
const FEE = 0.01;

function fmt(n: number, digits = 2): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: digits });
}

// Returns an error string for an invalid optional link, or "" when ok or empty.
function linkError(value: string, host: RegExp, label: string): string {
  if (!value.trim()) return "";
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return `Enter a full ${label} URL starting with https://`;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return `Enter a valid ${label} URL`;
  }
  if (!host.test(url.hostname)) return `That does not look like ${label}`;
  return "";
}

export default function CreatePage() {
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [blurb, setBlurb] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [x, setX] = useState("");
  const [telegram, setTelegram] = useState("");
  const [initialBuy, setInitialBuy] = useState("");
  const [metadataSaved, setMetadataSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const { showToast, dismissToast } = useToast();
  const pendingToastId = useRef<number | null>(null);
  const reportedHash = useRef<string | null>(null);

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Read the live curve parameters so the preview can estimate the starting
  // price, market cap, and graduation target for a freshly launched token.
  const { data: curveParams } = useReadContracts({
    contracts: [
      { address: FACTORY_ADDRESS, abi: factoryAbi, functionName: "virtualEthReserve" },
      { address: FACTORY_ADDRESS, abi: factoryAbi, functionName: "graduationMarketCap" },
    ],
    query: { enabled: FACTORY_ADDRESS.toLowerCase() !== ZERO },
  });

  useEffect(() => {
    if (isPending && pendingToastId.current === null) {
      pendingToastId.current = showToast({
        title: "Confirm in your wallet",
        description: "Approve the transaction to launch your token.",
        variant: "pending",
      });
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
      description: "Waiting for confirmation on the network.",
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
      title: "Token launched successfully",
      description: "Your token is now live on the bonding curve.",
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
    showToast({
      title: "Transaction failed",
      description: error.message.slice(0, 120),
      variant: "error",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !symbol) return;
    let value: bigint | undefined;
    const amt = Number(initialBuy);
    if (initialBuy && !Number.isNaN(amt) && amt > 0) {
      try {
        value = parseEther(initialBuy as `${number}`);
      } catch {
        value = undefined;
      }
    }
    writeContract({
      address: FACTORY_ADDRESS,
      abi: factoryAbi,
      functionName: "createToken",
      args: [name, symbol.toUpperCase()],
      value,
    });
  }

  // Once the deploy transaction confirms, pull the new token address from
  // the TokenCreated event and store the off chain description and image.
  useEffect(() => {
    if (!isSuccess || !receipt) return;
    if (!blurb && !imageUrl && !website && !x && !telegram) return;

    const log = receipt.logs.find(
      (l) => l.address.toLowerCase() === FACTORY_ADDRESS.toLowerCase(),
    );
    if (!log) return;

    try {
      const decoded = decodeEventLog({
        abi: factoryAbi,
        eventName: "TokenCreated",
        data: log.data,
        topics: log.topics,
      });
      const tokenAddress = decoded.args.token as string;

      // Prove we are the creator by signing a time-bound message with the same
      // wallet that just launched the token, then save the metadata. If the
      // user rejects the signature the token is still live, only the off chain
      // description and image are skipped.
      void (async () => {
        try {
          const signedAt = Date.now();
          const signature = await signMessageAsync({
            message: metadataMessage(tokenAddress, signedAt),
          });
          await fetch("/api/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              address: tokenAddress,
              signedAt,
              signature,
              description: blurb,
              imageUrl,
              website,
              x,
              telegram,
            }),
          });
          setMetadataSaved(true);
        } catch {
          // Signature rejected or request failed; token remains live.
        }
      })();
    } catch {
      // Ignore logs that do not match the expected event shape.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, receipt]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) setImageUrl(data.url);
      else setUploadError(data.error || "Upload failed");
    } catch {
      setUploadError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const preview = symbol ? symbol.toUpperCase().slice(0, 2) : "LU";

  // Curve estimates for the preview. Falls back to the known defaults if the
  // factory read is not in yet, so the panel never shows blanks.
  const virtualEth = curveParams?.[0]?.result
    ? Number(formatEther(curveParams[0].result as bigint))
    : 1;
  const gradMcap = curveParams?.[1]?.result
    ? Number(formatEther(curveParams[1].result as bigint))
    : 20;
  const startPrice = virtualEth / CURVE_SUPPLY; // ETH per token
  const startMcap = startPrice * TOTAL_SUPPLY; // fully diluted, ETH

  // Graduation estimates. At graduation the marginal price equals the target
  // market cap divided by total supply; the curve's real ETH at that point
  // seeds the Uniswap pool (minus the ~1 percent graduation fee).
  const gradPrice = gradMcap / TOTAL_SUPPLY; // ETH per token at graduation
  const kProduct = virtualEth * CURVE_SUPPLY;
  const ethAtGrad = Math.sqrt(gradPrice * kProduct);
  const lpEth = Math.max(0, ethAtGrad - virtualEth) * 0.99;

  // If the creator adds an initial buy, simulate it on the constant product
  // curve to estimate tokens received and the share of total supply.
  const buyAmt = Number(initialBuy);
  let initialTokens = 0;
  let initialShare = 0;
  if (initialBuy && !Number.isNaN(buyAmt) && buyAmt > 0) {
    const k = virtualEth * CURVE_SUPPLY;
    const newEth = virtualEth + buyAmt * (1 - FEE);
    initialTokens = CURVE_SUPPLY - k / newEth;
    initialShare = (initialTokens / TOTAL_SUPPLY) * 100;
  }

  // Inline validation for the optional links and the ticker.
  const websiteErr = linkError(website, /.+/, "website");
  const xErr = linkError(x, /(^|\.)(x|twitter)\.com$/, "X");
  const telegramErr = linkError(telegram, /(^|\.)t\.me$/, "Telegram");
  const tickerErr =
    symbol.length > 0 && symbol.length < 2 ? "Ticker is too short" : "";
  const formInvalid =
    !!websiteErr || !!xErr || !!telegramErr || !!tickerErr;

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-black tracking-tight">
          Create <span className="gradient-text">a new token</span>
        </h1>
        <p className="mt-3 text-slate-500">
          Deploy your own price curve on Base. No coding, ready instantly.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        {/* Form */}
        <form onSubmit={handleSubmit} className="card lg:col-span-3">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Token name</span>
            <input
              className="field mt-2"
              placeholder="For example Aurora"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={32}
            />
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-slate-700">Symbol</span>
            <input
              className="field mt-2 uppercase"
              placeholder="AUR"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
              maxLength={8}
            />
            {tickerErr ? (
              <span className="mt-1 block text-xs font-semibold text-base-pink">
                {tickerErr}
              </span>
            ) : (
              symbol.length >= 2 && (
                <span className="mt-1 block text-xs font-semibold text-base-mint">
                  Ticker looks good
                </span>
              )
            )}
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-slate-700">
              Short description
            </span>
            <textarea
              className="field mt-2 min-h-24 resize-none"
              placeholder="Describe your token in one sentence."
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
              maxLength={140}
            />
            <span className="mt-1 block text-right text-xs text-slate-400">
              Description is stored off chain.
            </span>
          </label>

          <div className="mt-5">
            <span className="text-sm font-semibold text-slate-700">Image</span>
            <div className="mt-2 flex items-center gap-4">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Token"
                  loading="lazy"
                  decoding="async"
                  className="h-16 w-16 rounded-2xl object-cover shadow-glow"
                />
              ) : (
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-xs font-medium text-slate-400">
                  none
                </div>
              )}
              <div className="flex items-center gap-2">
                <label className="btn-ghost cursor-pointer !px-4 !py-2 text-sm">
                  {uploading
                    ? "Uploading"
                    : imageUrl
                      ? "Change image"
                      : "Choose image"}
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
            </div>
            <span className="mt-1 block text-xs text-slate-400">
              Optional. Pick from your gallery or device. PNG, JPG, WEBP, or GIF
              up to 2 MB.
            </span>
            {uploadError && (
              <span className="mt-1 block text-xs font-semibold text-base-pink">
                {uploadError}
              </span>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Website</span>
              <input
                className={`field mt-2 ${websiteErr ? "border-base-pink" : ""}`}
                placeholder="https://"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                maxLength={200}
              />
              {websiteErr && (
                <span className="mt-1 block text-xs font-semibold text-base-pink">
                  {websiteErr}
                </span>
              )}
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">X</span>
              <input
                className={`field mt-2 ${xErr ? "border-base-pink" : ""}`}
                placeholder="https://x.com/..."
                value={x}
                onChange={(e) => setX(e.target.value)}
                maxLength={200}
              />
              {xErr && (
                <span className="mt-1 block text-xs font-semibold text-base-pink">
                  {xErr}
                </span>
              )}
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Telegram</span>
              <input
                className={`field mt-2 ${telegramErr ? "border-base-pink" : ""}`}
                placeholder="https://t.me/..."
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                maxLength={200}
              />
              {telegramErr && (
                <span className="mt-1 block text-xs font-semibold text-base-pink">
                  {telegramErr}
                </span>
              )}
            </label>
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-slate-700">
              Initial buy (ETH)
            </span>
            <input
              className="field mt-2"
              placeholder="0.0"
              inputMode="decimal"
              value={initialBuy}
              onChange={(e) =>
                setInitialBuy(e.target.value.replace(/[^0-9.]/g, ""))
              }
            />
            <span className="mt-1 block text-right text-xs text-slate-400">
              Optional. Buy your own token in the same transaction, exempt from
              the anti snipe cap.
            </span>
          </label>

          <div className="mt-6">
            {!isConnected ? (
              <div className="space-y-3">
                <button
                  type="button"
                  disabled
                  className="btn-primary w-full"
                >
                  Connect wallet to continue
                </button>
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              </div>
            ) : (
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={
                  isPending || isConfirming || !name || !symbol || formInvalid
                }
              >
                {isPending
                  ? "Confirm in wallet"
                  : isConfirming
                    ? "Processing transaction"
                    : formInvalid
                      ? "Fix the errors above"
                      : "Launch token"}
              </button>
            )}
          </div>

          {isSuccess && (blurb || imageUrl) && (
            <p className="mt-4 rounded-2xl bg-base-mint/10 px-4 py-3 text-center text-sm font-semibold text-base-mint">
              {metadataSaved
                ? "Description and image saved."
                : "Saving description and image..."}
            </p>
          )}
        </form>

        {/* Live preview */}
        <div className="lg:col-span-2">
          <div className="card sticky top-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Preview
            </p>
            <div className="mt-4 flex items-center gap-4">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={name || "Token preview"}
                  loading="lazy"
                  decoding="async"
                  className="h-16 w-16 rounded-2xl object-cover shadow-glow"
                />
              ) : (
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient text-2xl font-black text-white shadow-glow">
                  {preview}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold">{name || "Token name"}</h3>
                <p className="text-sm font-medium text-slate-400">
                  ${symbol ? symbol.toUpperCase() : "SYMBOL"}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              {blurb || "Your token description will appear here."}
            </p>

            <div className="mt-6 space-y-3 text-sm">
              <Row k="Total supply" v="1,000,000,000" />
              <Row k="On the curve" v="800,000,000" />
              <Row k="Trading fee" v="1%" />
              <Row k="Your share" v="35% of fee" />
            </div>

            {/* At launch estimates from the live curve */}
            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                At launch
              </p>
              <div className="mt-3 space-y-3 text-sm">
                <Row
                  k="Starting price"
                  v={`${startPrice.toPrecision(2)} ETH`}
                />
                <Row k="Starting market cap" v={`${fmt(startMcap)} ETH`} />
                <Row k="Graduates at" v={`${fmt(gradMcap)} ETH`} />
                <Row
                  k="Graduation price"
                  v={`${gradPrice.toPrecision(2)} ETH`}
                />
                <Row k="Est. LP at graduation" v={`${fmt(lpEth)} ETH`} />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>Bonding curve</span>
                  <span className="font-bold text-slate-700">
                    {Math.min((startMcap / gradMcap) * 100, 100).toFixed(0)}% to
                    graduation
                  </span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-brand-gradient"
                    style={{
                      width: `${Math.min((startMcap / gradMcap) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {initialTokens > 0 && (
                <div className="mt-4 rounded-xl bg-white p-3 text-sm">
                  <p className="font-semibold text-slate-700">
                    Your initial buy
                  </p>
                  <div className="mt-2 space-y-2">
                    <Row
                      k="You receive"
                      v={`${fmt(initialTokens, 0)} ${symbol ? symbol.toUpperCase() : "tokens"}`}
                    />
                    <Row
                      k="Share of supply"
                      v={`${initialShare.toFixed(2)}%`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
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
