"use client";

import { useEffect, useRef, useState } from "react";
import { formatEther, parseAbiItem, type PublicClient } from "viem";
import { usePublicClient } from "wagmi";
import { FACTORY_ADDRESS, factoryAbi } from "./contracts";

export type TokenStats = {
  volumeEth: number; // total ETH traded (buys + sells)
  trades: number;
  traders: number; // unique buyer/seller addresses
  price: number; // latest trade price, ETH per token
  spark: number[]; // recent price series, oldest to newest
  createdMs?: number; // creation block timestamp
};

const BUY = parseAbiItem(
  "event Buy(address indexed buyer, uint256 ethIn, uint256 tokensOut, uint256 fee)",
);
const SELL = parseAbiItem(
  "event Sell(address indexed seller, uint256 tokensIn, uint256 ethOut, uint256 fee)",
);

const START_BLOCK = process.env.NEXT_PUBLIC_START_BLOCK
  ? BigInt(process.env.NEXT_PUBLIC_START_BLOCK)
  : 0n;

const HAS_FACTORY =
  FACTORY_ADDRESS.toLowerCase() !== "0x0000000000000000000000000000000000000000";

const SPARK_MAX = 20;

function priceOf(a: bigint, b: bigint): number | null {
  if (!a || !b || b === 0n) return null;
  const out = Number(formatEther(a)) / Number(formatEther(b));
  return Number.isFinite(out) && out > 0 ? out : null;
}

type Row = {
  block: bigint;
  logIndex: number;
  token: string;
  actor: string;
  eth: number;
  price: number | null;
};

// Loads trade activity for every token in one pass: two getLogs calls fetch all
// Buy and Sell events platform wide, then they are grouped per token into
// volume, trade and trader counts, and a price sparkline. Far cheaper than
// scanning each token separately for a grid.
export function useMarketStats(addresses: string[]): Map<string, TokenStats> {
  const client = usePublicClient();
  const [stats, setStats] = useState<Map<string, TokenStats>>(new Map());
  const blockTime = useRef<Map<bigint, Promise<number>>>(new Map());

  // Stable dependency from the address set.
  const key = [...addresses].map((a) => a.toLowerCase()).sort().join(",");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!client || !HAS_FACTORY || addresses.length === 0) return;
      const wanted = new Set(addresses.map((a) => a.toLowerCase()));
      const tokenAddrs = addresses.map((a) => a as `0x${string}`);
      try {
        const [buys, sells, created] = await Promise.all([
          client.getLogs({
            address: tokenAddrs,
            event: BUY,
            fromBlock: START_BLOCK,
            toBlock: "latest",
          }),
          client.getLogs({
            address: tokenAddrs,
            event: SELL,
            fromBlock: START_BLOCK,
            toBlock: "latest",
          }),
          client.getContractEvents({
            address: FACTORY_ADDRESS,
            abi: factoryAbi,
            eventName: "TokenCreated",
            fromBlock: START_BLOCK,
            toBlock: "latest",
          }),
        ]);
        if (cancelled) return;

        const rows: Row[] = [];
        for (const l of buys) {
          const token = (l.address ?? "").toLowerCase();
          if (!wanted.has(token)) continue;
          const a = l.args;
          rows.push({
            block: l.blockNumber ?? 0n,
            logIndex: Number(l.logIndex ?? 0),
            token,
            actor: (a.buyer ?? "").toLowerCase(),
            eth: a.ethIn ? Number(formatEther(a.ethIn)) : 0,
            price: priceOf(a.ethIn as bigint, a.tokensOut as bigint),
          });
        }
        for (const l of sells) {
          const token = (l.address ?? "").toLowerCase();
          if (!wanted.has(token)) continue;
          const a = l.args;
          rows.push({
            block: l.blockNumber ?? 0n,
            logIndex: Number(l.logIndex ?? 0),
            token,
            actor: (a.seller ?? "").toLowerCase(),
            eth: a.ethOut ? Number(formatEther(a.ethOut)) : 0,
            price: priceOf(a.ethOut as bigint, a.tokensIn as bigint),
          });
        }

        // chronological
        rows.sort((x, y) =>
          x.block === y.block
            ? x.logIndex - y.logIndex
            : x.block < y.block
              ? -1
              : 1,
        );

        const map = new Map<string, TokenStats>();
        const traderSets = new Map<string, Set<string>>();
        for (const r of rows) {
          let s = map.get(r.token);
          if (!s) {
            s = { volumeEth: 0, trades: 0, traders: 0, price: 0, spark: [] };
            map.set(r.token, s);
            traderSets.set(r.token, new Set());
          }
          s.volumeEth += r.eth;
          s.trades += 1;
          if (r.actor) traderSets.get(r.token)!.add(r.actor);
          if (r.price !== null) {
            s.price = r.price;
            s.spark.push(r.price);
            if (s.spark.length > SPARK_MAX) s.spark.shift();
          }
        }
        for (const [token, set] of traderSets) {
          map.get(token)!.traders = set.size;
        }

        // creation timestamps (one getBlock per unique block, cached)
        const createdBlockByToken = new Map<string, bigint>();
        for (const l of created) {
          const t = ((l.args as { token?: string }).token ?? "").toLowerCase();
          if (t && wanted.has(t)) createdBlockByToken.set(t, l.blockNumber ?? 0n);
        }
        const uniqueBlocks = [...new Set(createdBlockByToken.values())];
        const times = await Promise.all(
          uniqueBlocks.map((b) => blockTimeOf(client, b, blockTime.current)),
        );
        if (cancelled) return;
        const timeByBlock = new Map(uniqueBlocks.map((b, i) => [b, times[i]]));
        for (const [token, blk] of createdBlockByToken) {
          const s = map.get(token) ?? {
            volumeEth: 0,
            trades: 0,
            traders: 0,
            price: 0,
            spark: [],
          };
          s.createdMs = timeByBlock.get(blk);
          map.set(token, s);
        }

        setStats(map);
      } catch {
        // range limited RPC; cards just render without extra stats
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, key]);

  return stats;
}

function blockTimeOf(
  client: PublicClient,
  block: bigint,
  cache: Map<bigint, Promise<number>>,
): Promise<number> {
  const hit = cache.get(block);
  if (hit !== undefined) return hit;
  const p = client
    .getBlock({ blockNumber: block })
    .then(({ timestamp }) => Number(timestamp) * 1000);
  cache.set(block, p);
  return p;
}
