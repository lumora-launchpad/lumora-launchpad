"use client";

import { useEffect, useState } from "react";
import { formatEther, type Log } from "viem";
import { usePublicClient, useWatchContractEvent } from "wagmi";
import { tokenAbi } from "./contracts";

export type TradePoint = {
  price: number; // ETH per token
  side: "buy" | "sell";
  block: bigint;
  logIndex: number;
};

// Optional starting block to bound the historical scan. Public RPCs limit the
// getLogs range, so set NEXT_PUBLIC_START_BLOCK to the factory deploy block.
const START_BLOCK = process.env.NEXT_PUBLIC_START_BLOCK
  ? BigInt(process.env.NEXT_PUBLIC_START_BLOCK)
  : 0n;

function keyOf(p: TradePoint): string {
  return `${p.block}-${p.logIndex}`;
}

function priceOf(a: bigint, b: bigint): number | null {
  if (b === 0n) return null;
  const out = Number(formatEther(a)) / Number(formatEther(b));
  return Number.isFinite(out) && out > 0 ? out : null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPoint(log: any, side: "buy" | "sell"): TradePoint | null {
  const args = log.args ?? {};
  const price =
    side === "buy"
      ? priceOf(args.ethIn as bigint, args.tokensOut as bigint)
      : priceOf(args.ethOut as bigint, args.tokensIn as bigint);
  if (price === null) return null;
  return {
    price,
    side,
    block: log.blockNumber ?? 0n,
    logIndex: Number(log.logIndex ?? 0),
  };
}

function sortTrades(list: TradePoint[]): TradePoint[] {
  return [...list].sort((a, b) =>
    a.block === b.block
      ? a.logIndex - b.logIndex
      : a.block < b.block
        ? -1
        : 1,
  );
}

export function useTradeHistory(address: `0x${string}`): {
  trades: TradePoint[];
  isLoading: boolean;
} {
  const client = usePublicClient();
  const [trades, setTrades] = useState<TradePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Historical backfill.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!client) return;
      setIsLoading(true);
      try {
        const [buys, sells] = await Promise.all([
          client.getContractEvents({
            address,
            abi: tokenAbi,
            eventName: "Buy",
            fromBlock: START_BLOCK,
            toBlock: "latest",
          }),
          client.getContractEvents({
            address,
            abi: tokenAbi,
            eventName: "Sell",
            fromBlock: START_BLOCK,
            toBlock: "latest",
          }),
        ]);
        const points = [
          ...buys.map((l) => toPoint(l, "buy")),
          ...sells.map((l) => toPoint(l, "sell")),
        ].filter((p): p is TradePoint => p !== null);
        if (!cancelled) setTrades(sortTrades(points));
      } catch {
        // Range limited RPC. Fall back to live updates only.
        if (!cancelled) setTrades([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [client, address]);

  function append(incoming: (TradePoint | null)[]) {
    const fresh = incoming.filter((p): p is TradePoint => p !== null);
    if (fresh.length === 0) return;
    setTrades((prev) => {
      const seen = new Set(prev.map(keyOf));
      const merged = [...prev];
      for (const p of fresh) {
        if (!seen.has(keyOf(p))) {
          seen.add(keyOf(p));
          merged.push(p);
        }
      }
      return sortTrades(merged);
    });
  }

  useWatchContractEvent({
    address,
    abi: tokenAbi,
    eventName: "Buy",
    onLogs: (logs: Log[]) => append(logs.map((l) => toPoint(l, "buy"))),
  });

  useWatchContractEvent({
    address,
    abi: tokenAbi,
    eventName: "Sell",
    onLogs: (logs: Log[]) => append(logs.map((l) => toPoint(l, "sell"))),
  });

  return { trades, isLoading };
}
