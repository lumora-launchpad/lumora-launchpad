"use client";

import { useEffect, useState } from "react";
import { decodeEventLog } from "viem";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FACTORY_ADDRESS, factoryAbi } from "@/lib/contracts";

export default function CreatePage() {
  const { isConnected } = useAccount();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [blurb, setBlurb] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [metadataSaved, setMetadataSaved] = useState(false);

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !symbol) return;
    writeContract({
      address: FACTORY_ADDRESS,
      abi: factoryAbi,
      functionName: "createToken",
      args: [name, symbol.toUpperCase()],
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
    <div className="mx-auto max-w-5xl px-5 py-14">
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

          {isSuccess && (
            <p className="mt-4 rounded-2xl bg-base-mint/10 px-4 py-3 text-center text-sm font-semibold text-base-mint">
              Token launched successfully.
              {(blurb || imageUrl) &&
                (metadataSaved
                  ? " Description and image saved."
                  : " Saving description and image...")}
            </p>
          )}
          {error && (
            <p className="mt-4 rounded-2xl bg-base-pink/10 px-4 py-3 text-center text-sm font-semibold text-base-pink">
              {error.message.slice(0, 120)}
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
