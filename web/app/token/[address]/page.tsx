"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatEther, parseEther } from "viem";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { tokenAbi } from "@/lib/contracts";
import { accentFor } from "@/lib/tokens";
import { txExplorerUrl } from "@/lib/wagmi";
import { PriceChart } from "@/components/PriceChart";
import { useToast } from "@/components/Toast";

type Side = "buy" | "sell";
type TokenMetadata = {
  description?: string;
  imageUrl?: string;
};

const SLIPPAGE_BPS = 500n; // 5 percent tolerance
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

function tryParseEther(v: string): bigint | null {
  try {
    if (!v || Number.isNaN(Number(v))) return null;
    const parsed = parseEther(v as `${number}`);
    return parsed > 0n ? parsed : null;
  } catch {
    return null;
  }
}

function fmt(v: bigint | undefined, max = 6): string {
  if (v === undefined) return "-";
  const n = Number(formatEther(v));
  if (n === 0) return "0";
  if (n < 0.000001) return n.toExponential(2);
  return n.toLocaleString("en-US", { maximumFractionDigits: max });
}

export default function TokenPage({
  params,
}: {
  params: { address: string };
}) {
  const address = params.address as `0x${string}`;
  const { address: account, isConnected } = useAccount();

  const [side, setSide] = useState<Side>("buy");
  const [amount, setAmount] = useState("");
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/token?address=${address}`)
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: TokenMetadata) => {
        if (active) setMetadata(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [address]);

  const description = metadata?.description || "No description provided yet.";
  const imageUrl = metadata?.imageUrl;

  const accent = accentFor(address);
  const short = useMemo(
    () => `${address.slice(0, 6)}...${address.slice(-4)}`,
    [address],
  );

  // Core token state.
  const { data: info, refetch: refetchInfo } = useReadContracts({
    contracts: [
      { address, abi: tokenAbi, functionName: "name" },
      { address, abi: tokenAbi, functionName: "symbol" },
      { address, abi: tokenAbi, functionName: "creator" },
      { address, abi: tokenAbi, functionName: "graduated" },
      { address, abi: tokenAbi, functionName: "currentPrice" },
      { address, abi: tokenAbi, functionName: "graduationProgressBps" },
      { address, abi: tokenAbi, functionName: "realEthReserve" },
    ],
  });

  const name = (info?.[0]?.result as string | undefined) ?? "Token";
  const symbol = (info?.[1]?.result as string | undefined) ?? "...";
  const creator = info?.[2]?.result as `0x${string}` | undefined;
  const graduated = Boolean(info?.[3]?.result);
  const price = info?.[4]?.result as bigint | undefined;
  const bps = info?.[5]?.result as bigint | undefined;
  const raised = info?.[6]?.result as bigint | undefined;
  const progress = bps ? Number(bps) / 100 : 0;

  // Connected wallet balance.
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address,
    abi: tokenAbi,
    functionName: "balanceOf",
    args: [account ?? ZERO_ADDRESS],
    query: { enabled: isConnected },
  });

  // Live quote for the amount the user typed. Two literal hooks keep types exact.
  const parsed = tryParseEther(amount);
  const { data: buyQuote } = useReadContract({
    address,
    abi: tokenAbi,
    functionName: "quoteBuy",
    args: [parsed ?? 0n],
    query: { enabled: side === "buy" && !!parsed && !graduated },
  });
  const { data: sellQuote } = useReadContract({
    address,
    abi: tokenAbi,
    functionName: "quoteSell",
    args: [parsed ?? 0n],
    query: { enabled: side === "sell" && !!parsed && !graduated },
  });
  const quoteOut = side === "buy" ? buyQuote : sellQuote;

  const minOut =
    quoteOut !== undefined
      ? ((quoteOut as bigint) * (10000n - SLIPPAGE_BPS)) / 10000n
      : 0n;

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
      refetchBalance();
    }
  }, [isSuccess, refetchInfo, refetchBalance]);

  useEffect(() => {
    if (isPending && pendingToastId.current === null) {
      pendingToastId.current = showToast({
        title: "Confirm in your wallet",
        description: side === "buy" ? "Approve the buy order." : "Approve the sell order.",
        variant: "pending",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      title: side === "buy" ? "Buy successful" : "Sell successful",
      description: "Your trade has been confirmed.",
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

  function handleTrade() {
    if (!parsed) return;
    if (side === "buy") {
      writeContract({
        address,
        abi: tokenAbi,
        functionName: "buy",
        args: [minOut],
        value: parsed,
      });
    } else {
      writeContract({
        address,
        abi: tokenAbi,
        functionName: "sell",
        args: [parsed, minOut],
      });
    }
  }

  function setSellPercent(pct: bigint) {
    if (!balance) return;
    const part = ((balance as bigint) * pct) / 100n;
    setAmount(formatEther(part));
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Token info */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="flex items-center gap-4">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
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
              <span className="pill ml-auto">
                <span
                  className={`h-2 w-2 rounded-full ${graduated ? "bg-base-violet" : "bg-base-mint"}`}
                />
                {graduated ? "Listed" : "On the curve"}
              </span>
            </div>

            <p className="mt-4 text-sm text-slate-500">{description}</p>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <Stat k="Price" v={`${fmt(price)} ETH`} />
              <Stat k="Raised" v={`${fmt(raised, 3)} ETH`} />
              <Stat
                k="Creator"
                v={creator ? `${creator.slice(0, 6)}...${creator.slice(-4)}` : "-"}
              />
            </div>

            <div className="mt-6">
              <PriceChart address={address} />
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-sm font-medium text-slate-500">
                <span>Progress to Uniswap</span>
                <span className="font-bold text-slate-700">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-gradient transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                When the curve fills, liquidity moves to Uniswap and the LP is locked.
              </p>
            </div>
          </div>
        </div>

        {/* Trade panel */}
        <div className="lg:col-span-2">
          <div className="card sticky top-24">
            {graduated ? (
              <div className="py-6 text-center">
                <p className="text-lg font-black">Token already listed</p>
                <p className="mt-2 text-sm text-slate-500">
                  Curve trading is complete. Liquidity has moved to Uniswap and
                  the token can be traded there.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
                  <button
                    onClick={() => {
                      setSide("buy");
                      setAmount("");
                    }}
                    className={`rounded-xl py-2.5 text-sm font-bold transition ${
                      side === "buy"
                        ? "bg-white text-base-blue shadow"
                        : "text-slate-500"
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => {
                      setSide("sell");
                      setAmount("");
                    }}
                    className={`rounded-xl py-2.5 text-sm font-bold transition ${
                      side === "sell"
                        ? "bg-white text-base-pink shadow"
                        : "text-slate-500"
                    }`}
                  >
                    Sell
                  </button>
                </div>

                <label className="mt-5 block">
                  <span className="flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>{side === "buy" ? "ETH amount" : `${symbol} amount`}</span>
                    {side === "sell" && balance !== undefined && (
                      <span className="text-xs font-medium text-slate-400">
                        Balance {fmt(balance as bigint, 2)}
                      </span>
                    )}
                  </span>
                  <input
                    className="field mt-2"
                    placeholder="0.0"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value.replace(/[^0-9.]/g, ""))
                    }
                  />
                </label>

                <div className="mt-3 flex gap-2">
                  {side === "buy"
                    ? ["0.05", "0.1", "0.5", "1"].map((q) => (
                        <button
                          key={q}
                          onClick={() => setAmount(q)}
                          className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-500 transition hover:border-base-blue hover:text-base-blue"
                        >
                          {q}
                        </button>
                      ))
                    : (
                        [
                          ["25%", 25n],
                          ["50%", 50n],
                          ["75%", 75n],
                          ["100%", 100n],
                        ] as const
                      ).map(([label, pct]) => (
                        <button
                          key={label}
                          onClick={() => setSellPercent(pct)}
                          className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-500 transition hover:border-base-pink hover:text-base-pink"
                        >
                          {label}
                        </button>
                      ))}
                </div>

                {parsed && quoteOut !== undefined && (
                  <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">You receive about</span>
                      <span className="font-bold text-slate-800">
                        {side === "buy"
                          ? `${fmt(quoteOut as bigint, 2)} ${symbol}`
                          : `${fmt(quoteOut as bigint)} ETH`}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                      <span>Slippage tolerance</span>
                      <span>5%</span>
                    </div>
                  </div>
                )}

                <div className="mt-5">
                  {!isConnected ? (
                    <div className="flex justify-center">
                      <ConnectButton />
                    </div>
                  ) : (
                    <button
                      onClick={handleTrade}
                      disabled={isPending || isConfirming || !parsed}
                      className="btn-primary w-full"
                    >
                      {isPending
                        ? "Confirm in wallet"
                        : isConfirming
                          ? "Processing"
                          : side === "buy"
                            ? "Buy token"
                            : "Sell token"}
                    </button>
                  )}
                </div>

                <p className="mt-4 text-center text-xs text-slate-400">
                  1 percent fee per trade. 65 developer, 35 creator.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 text-center">
      <p className="truncate text-lg font-black text-slate-800">{v}</p>
      <p className="mt-0.5 text-xs font-medium text-slate-400">{k}</p>
    </div>
  );
}
