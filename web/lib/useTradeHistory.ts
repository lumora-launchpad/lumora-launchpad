"use client";

import { useEffect, useRef, useState } from "react";
import { formatEther, type Log } from "viem";
import type { PublicClient } from "viem";
import { usePublicClient, useWatchContractEvent } from "wagmi";
import { tokenAbi } from "./contracts";

export type TradePoint = {
  price: number; // ETH per token
  side: "buy" | "sell";
  block: bigint;
  logIndex: number;
  time: number; // ms since epoch, from the block timestamp
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

type RawTradePoint = Omit<TradePoint, "time">;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPoint(log: any, side: "buy" | "sell"): RawTradePoint | null {
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

type BlockTimeCache = Map<bigint, Promise<number>>;

// Caches the in-flight getBlock promise per block number, so concurrent
// trades in the same block (or overlapping backfill/live calls) only ever
// trigger one getBlock request per block.
function getBlockTime(
  client: PublicClient,
  block: bigint,
  cache: BlockTimeCache,
): Promise<number> {
  const cached = cache.get(block);
  if (cached !== undefined) return cached;
  const pending = client
    .getBlock({ blockNumber: block })
    .then(({ timestamp }) => Number(timestamp) * 1000);
  cache.set(block, pending);
  return pending;
}

async function withTimes(
  client: PublicClient,
  points: RawTradePoint[],
  cache: BlockTimeCache,
): Promise<TradePoint[]> {
  const uniqueBlocks = [...new Set(points.map((p) => p.block))];
  const times = await Promise.all(
    uniqueBlocks.map((b) => getBlockTime(client, b, cache)),
  );
  const timeByBlock = new Map(uniqueBlocks.map((b, i) => [b, times[i]]));
  return points.map((p) => ({ ...p, time: timeByBlock.get(p.block) ?? 0 }));
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
  const blockTimeCache = useRef<BlockTimeCache>(new Map());

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
        const rawPoints = [
          ...buys.map((l) => toPoint(l, "buy")),
          ...sells.map((l) => toPoint(l, "sell")),
        ].filter((p): p is RawTradePoint => p !== null);
        const points = await withTimes(client, rawPoints, blockTimeCache.current);
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

  async function append(incoming: (RawTradePoint | null)[]) {
    const fresh = incoming.filter((p): p is RawTradePoint => p !== null);
    if (fresh.length === 0 || !client) return;
    const timed = await withTimes(client, fresh, blockTimeCache.current);
    setTrades((prev) => {
      const seen = new Set(prev.map(keyOf));
      const merged = [...prev];
      for (const p of timed) {
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
    onLogs: (logs: Log[]) => void append(logs.map((l) => toPoint(l, "buy"))),
  });

  useWatchContractEvent({
    address,
    abi: tokenAbi,
    eventName: "Sell",
    onLogs: (logs: Log[]) => void append(logs.map((l) => toPoint(l, "sell"))),
  });

  return { trades, isLoading };
}
