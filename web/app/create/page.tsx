"use client";

import { useEffect, useRef, useState } from "react";
import { decodeEventLog, parseEther } from "viem";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FACTORY_ADDRESS, factoryAbi } from "@/lib/contracts";
import { txExplorerUrl } from "@/lib/wagmi";
import { useToast } from "@/components/Toast";

export default function CreatePage() {
  const { isConnected } = useAccount();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [blurb, setBlurb] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [initialBuy, setInitialBuy] = useState("");
  const [metadataSaved, setMetadataSaved] = useState(false);

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
    if (!isSuccess || !receipt || (!blurb && !imageUrl)) return;

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

      fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: tokenAddress,
          description: blurb,
          imageUrl,
        }),
      })
        .then(() => setMetadataSaved(true))
        .catch(() => {});
    } catch {
      // Ignore logs that do not match the expected event shape.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, receipt]);

  const preview = symbol ? symbol.toUpperCase().slice(0, 2) : "LU";

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

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-slate-700">
              Image URL
            </span>
            <input
              className="field mt-2"
              placeholder="https://example.com/logo.png"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              maxLength={2048}
            />
            <span className="mt-1 block text-right text-xs text-slate-400">
              Optional. Also stored off chain.
            </span>
          </label>

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
              the anti-snipe cap.
            </span>
          </label>

          <div className="mt-6">
            {!isConnected ? (
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            ) : (
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={isPending || isConfirming || !name || !symbol}
              >
                {isPending
                  ? "Confirm in wallet"
                  : isConfirming
                    ? "Processing transaction"
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
