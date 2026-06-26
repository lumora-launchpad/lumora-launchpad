"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { parseEther } from "viem";
import {
  useAccount,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { campaignAbi } from "@/lib/campaigns";
import { accentFor, formatEth } from "@/lib/tokens";
import { txExplorerUrl } from "@/lib/wagmi";
import { Countdown } from "@/components/Countdown";
import { BackButton } from "@/components/BackButton";
import { useToast } from "@/components/Toast";

const ZERO = "0x0000000000000000000000000000000000000000" as const;

export default function CampaignPage({
  params,
}: {
  params: { address: string };
}) {
  const address = params.address as `0x${string}`;
  const { address: account, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [meta, setMeta] = useState<{ imageUrl?: string; description?: string }>({});

  useEffect(() => {
    let active = true;
    fetch(`/api/token?address=${address}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((d: { imageUrl?: string; description?: string }) => {
        if (active) setMeta(d ?? {});
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [address]);

  const accent = accentFor(address);
  const short = useMemo(
    () => `${address.slice(0, 6)}...${address.slice(-4)}`,
    [address],
  );

  const { data: info, refetch: refetchInfo } = useReadContracts({
    contracts: [
      { address, abi: campaignAbi, functionName: "name" },
      { address, abi: campaignAbi, functionName: "symbol" },
      { address, abi: campaignAbi, functionName: "creator" },
      { address, abi: campaignAbi, functionName: "targetEth" },
      { address, abi: campaignAbi, functionName: "totalCommitted" },
      { address, abi: campaignAbi, functionName: "deadline" },
      { address, abi: campaignAbi, functionName: "launched" },
      { address, abi: campaignAbi, functionName: "token" },
      { address, abi: campaignAbi, functionName: "progressBps" },
    ],
  });

  const name = (info?.[0]?.result as string | undefined) ?? "Campaign";
  const symbol = (info?.[1]?.result as string | undefined) ?? "...";
  const creator = info?.[2]?.result as `0x${string}` | undefined;
  const targetEth = (info?.[3]?.result as bigint | undefined) ?? 0n;
  const totalCommitted = (info?.[4]?.result as bigint | undefined) ?? 0n;
  const deadline = Number((info?.[5]?.result as bigint | undefined) ?? 0n);
  const launched = Boolean(info?.[6]?.result);
  const token = info?.[7]?.result as `0x${string}` | undefined;
  const progress = info?.[8]?.result
    ? Number(info[8].result as bigint) / 100
    : 0;

  const { data: mine, refetch: refetchMine } = useReadContracts({
    contracts: [
      { address, abi: campaignAbi, functionName: "committed", args: [account ?? ZERO] },
      { address, abi: campaignAbi, functionName: "claimable", args: [account ?? ZERO] },
      { address, abi: campaignAbi, functionName: "claimed", args: [account ?? ZERO] },
      { address, abi: campaignAbi, functionName: "refunded", args: [account ?? ZERO] },
    ],
    query: { enabled: isConnected },
  });

  const myCommit = (mine?.[0]?.result as bigint | undefined) ?? 0n;
  const myClaimable = (mine?.[1]?.result as bigint | undefined) ?? 0n;
  const claimed = Boolean(mine?.[2]?.result);
  const refunded = Boolean(mine?.[3]?.result);

  const now = Math.floor(Date.now() / 1000);
  const ended = now >= deadline;

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const { showToast, dismissToast } = useToast();
  const pendingToastId = useRef<number | null>(null);
  const reportedHash = useRef<string | null>(null);

  useEffect(() => {
    if (isSuccess) {
      setAmount("");
      refetchInfo();
      refetchMine();
    }
  }, [isSuccess, refetchInfo, refetchMine]);

  useEffect(() => {
    if (isPending && pendingToastId.current === null) {
      pendingToastId.current = showToast({
        title: "Confirm in your wallet",
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
      title: "Transaction confirmed",
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

  function doCommit() {
    let value: bigint;
    try {
      value = parseEther(amount as `${number}`);
    } catch {
      return;
    }
    if (value <= 0n) return;
    writeContract({ address, abi: campaignAbi, functionName: "commit", value });
  }

  const busy = isPending || isConfirming;
  const btn = isPending ? "Confirm in wallet" : isConfirming ? "Processing" : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <BackButton label="Back to campaigns" fallback="/campaigns" />

      <div className="card mt-4">
        <div className="flex items-center gap-4">
          {meta.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={meta.imageUrl}
              alt={name}
              className="h-16 w-16 rounded-2xl object-cover shadow-glow"
            />
          ) : (
            <div
              className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${accent} text-2xl font-black text-white shadow-glow`}
            >
              {symbol.slice(0, 2)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-black">{name}</h1>
            <p className="text-sm font-medium text-slate-400">
              ${symbol} / {short}
            </p>
          </div>
          <span
            className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${
              launched
                ? "bg-base-mint/15 text-base-mint"
                : ended
                  ? "bg-base-pink/15 text-base-pink"
                  : "bg-base-violet/10 text-base-violet"
            }`}
          >
            {launched ? (
              "Launched"
            ) : ended ? (
              "Did not reach"
            ) : (
              <Countdown deadline={deadline} />
            )}
          </span>
        </div>

        {meta.description && (
          <p className="mt-4 text-sm text-slate-500">{meta.description}</p>
        )}

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm font-medium text-slate-500">
            <span>{formatEth(totalCommitted)} / {formatEth(targetEth)} ETH backed</span>
            <span className="font-bold text-slate-700">{Math.round(progress)}%</span>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-gradient transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {creator && (
          <p className="mt-4 text-xs text-slate-400">
            Creator {creator.slice(0, 6)}...{creator.slice(-4)}
          </p>
        )}
      </div>

      {/* Action panel */}
      <div className="card mt-6">
        {launched ? (
          <div className="text-center">
            <p className="text-lg font-black">Launched on the curve</p>
            <p className="mt-1 text-sm text-slate-500">
              The token is live. Claim your backer allocation, then trade it on
              the curve.
            </p>
            <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {isConnected && myCommit > 0n && !claimed && (
                <button
                  onClick={() => writeContract({ address, abi: campaignAbi, functionName: "claim" })}
                  disabled={busy}
                  className="btn-primary"
                >
                  {btn ?? `Claim ${formatEth(myClaimable)} ${symbol}`}
                </button>
              )}
              {claimed && (
                <span className="text-sm font-semibold text-base-mint">
                  Claimed
                </span>
              )}
              {token && token !== ZERO && (
                <Link href={`/token/${token}`} className="btn-ghost">
                  Open token page
                </Link>
              )}
            </div>
          </div>
        ) : ended ? (
          <div className="text-center">
            <p className="text-lg font-black">Did not reach the target</p>
            <p className="mt-1 text-sm text-slate-500">
              This campaign fell short. Backers can refund their full
              commitment.
            </p>
            {isConnected && myCommit > 0n && !refunded && (
              <button
                onClick={() => writeContract({ address, abi: campaignAbi, functionName: "refund" })}
                disabled={busy}
                className="btn-primary mt-4"
              >
                {btn ?? `Refund ${formatEth(myCommit)} ETH`}
              </button>
            )}
            {refunded && (
              <p className="mt-4 text-sm font-semibold text-base-mint">Refunded</p>
            )}
          </div>
        ) : (
          <>
            <h3 className="text-sm font-bold text-slate-700">Back this launch</h3>
            <p className="mt-1 text-xs text-slate-400">
              Commit ETH. If the target is hit the token launches and you claim a
              share. If not, you refund in full after the deadline.
            </p>
            <div className="mt-4 flex gap-2">
              <input
                className="field"
                placeholder="0.0"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              />
              {!isConnected ? (
                <ConnectButton />
              ) : (
                <button
                  onClick={doCommit}
                  disabled={busy || !amount}
                  className="btn-primary shrink-0"
                >
                  {btn ?? "Commit"}
                </button>
              )}
            </div>
            {isConnected && myCommit > 0n && (
              <p className="mt-3 text-sm text-slate-500">
                You have committed{" "}
                <span className="font-bold text-slate-800">
                  {formatEth(myCommit)} ETH
                </span>
                .
              </p>
            )}
            <p className="mt-4 text-center text-xs text-slate-400">
              2 percent fee on launch. Token launches automatically at the target.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
