"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatEther, parseEther } from "viem";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { tokenAbi } from "@/lib/contracts";
import { txExplorerUrl } from "@/lib/wagmi";
import { useToast } from "@/components/Toast";

const ZERO = "0x0000000000000000000000000000000000000000" as const;
type Side = "buy" | "sell";

function tryParseEther(v: string): bigint | null {
  try {
    if (!v || Number.isNaN(Number(v))) return null;
    const p = parseEther(v as `${number}`);
    return p > 0n ? p : null;
  } catch {
    return null;
  }
}

// A compact buy and sell widget for a bonding curve token, embedded on the
// project page once a campaign has launched. Mirrors the token terminal logic.
export function TokenTradePanel({
  token,
  symbol,
  graduated,
}: {
  token: `0x${string}`;
  symbol: string;
  graduated: boolean;
}) {
  const { address: account, isConnected } = useAccount();
  const [side, setSide] = useState<Side>("buy");
  const [amount, setAmount] = useState("");
  const [slippage] = useState(5);

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: token,
    abi: tokenAbi,
    functionName: "balanceOf",
    args: [account ?? ZERO],
    query: { enabled: isConnected },
  });

  const parsed = tryParseEther(amount);
  const { data: buyQuote } = useReadContract({
    address: token,
    abi: tokenAbi,
    functionName: "quoteBuy",
    args: [parsed ?? 0n],
    query: { enabled: side === "buy" && !!parsed && !graduated },
  });
  const { data: sellQuote } = useReadContract({
    address: token,
    abi: tokenAbi,
    functionName: "quoteSell",
    args: [parsed ?? 0n],
    query: { enabled: side === "sell" && !!parsed && !graduated },
  });
  const quoteOut = side === "buy" ? buyQuote : sellQuote;
  const slippageBps = BigInt(Math.round(slippage * 100));
  const minOut = quoteOut !== undefined ? ((quoteOut as bigint) * (10000n - slippageBps)) / 10000n : 0n;

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const { showToast, dismissToast } = useToast();
  const pending = useRef<number | null>(null);
  const reported = useRef<string | null>(null);

  useEffect(() => {
    if (isSuccess) {
      setAmount("");
      refetchBalance();
    }
  }, [isSuccess, refetchBalance]);

  useEffect(() => {
    if (!hash || reported.current === hash) return;
    reported.current = hash;
    if (pending.current !== null) dismissToast(pending.current);
    pending.current = showToast({ title: "Transaction submitted", variant: "pending", href: txExplorerUrl(hash) });
  }, [hash, showToast, dismissToast]);

  useEffect(() => {
    if (!isSuccess || !hash) return;
    if (pending.current !== null) { dismissToast(pending.current); pending.current = null; }
    showToast({ title: side === "buy" ? "Buy confirmed" : "Sell confirmed", variant: "success", href: txExplorerUrl(hash) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, hash]);

  useEffect(() => {
    if (!error) return;
    if (pending.current !== null) { dismissToast(pending.current); pending.current = null; }
    showToast({ title: "Transaction failed", description: error.message.slice(0, 120), variant: "error" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  function trade() {
    if (!parsed) return;
    if (side === "buy") {
      writeContract({ address: token, abi: tokenAbi, functionName: "buy", args: [minOut], value: parsed });
    } else {
      writeContract({ address: token, abi: tokenAbi, functionName: "sell", args: [parsed, minOut] });
    }
  }

  const busy = isPending || isConfirming;

  if (graduated) {
    return (
      <div className="glass-card p-5 text-center">
        <p className="text-lg font-black text-slate-900">Graduated to Uniswap</p>
        <p className="mt-1 text-sm text-slate-500">
          Curve trading is closed. ${symbol} now trades on Uniswap with locked
          liquidity.
        </p>
        <a
          href={`https://app.uniswap.org/swap?outputCurrency=${token}&chain=base`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-4 w-full"
        >
          Trade on Uniswap
        </a>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      {/* Buy / Sell toggle */}
      <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-100 p-1">
        {(["buy", "sell"] as Side[]).map((s) => (
          <button
            key={s}
            onClick={() => { setSide(s); setAmount(""); }}
            className={`rounded-xl py-2 text-sm font-bold capitalize transition ${
              side === s
                ? s === "buy" ? "bg-white text-base-mint shadow" : "bg-white text-base-pink shadow"
                : "text-slate-500"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-medium text-slate-400">
          <span>{side === "buy" ? "You pay (ETH)" : `You sell (${symbol})`}</span>
          {side === "sell" && balance !== undefined && (
            <span>Balance {Number(formatEther(balance as bigint)).toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
          )}
        </div>
        <input
          className="field mt-2"
          placeholder="0.0"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
        />
        {side === "sell" && (
          <div className="mt-2 grid grid-cols-4 gap-2">
            {[25n, 50n, 75n, 100n].map((pct) => (
              <button
                key={String(pct)}
                onClick={() => balance && setAmount(formatEther(((balance as bigint) * pct) / 100n))}
                className="rounded-lg border border-slate-200 py-1 text-xs font-bold text-slate-500 transition hover:text-slate-800"
              >
                {String(pct)}%
              </button>
            ))}
          </div>
        )}
      </div>

      {quoteOut !== undefined && parsed && (
        <p className="mt-3 text-center text-sm text-slate-500">
          You receive about{" "}
          <span className="font-bold text-slate-800">
            {Number(formatEther(quoteOut as bigint)).toLocaleString("en-US", { maximumFractionDigits: side === "buy" ? 0 : 4 })}{" "}
            {side === "buy" ? symbol : "ETH"}
          </span>
        </p>
      )}

      <div className="mt-4">
        {!isConnected ? (
          <ConnectButton />
        ) : (
          <button
            onClick={trade}
            disabled={busy || !parsed}
            className="btn-primary w-full"
          >
            {busy ? "Processing" : side === "buy" ? `Buy ${symbol}` : `Sell ${symbol}`}
          </button>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-slate-400">
        1 percent trade fee. Slippage {slippage}%.{" "}
        <Link href={`/token/${token}`} className="font-semibold text-base-blue hover:underline">
          Open full terminal
        </Link>
      </p>
    </div>
  );
}
