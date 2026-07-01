"use client";

import { useEffect, useState } from "react";
import { formatEther, parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";
import { FACTORY_ADDRESS, factoryAbi } from "./contracts";
import { scanLogs } from "./scanLogs";

export type Activity = {
  kind: "launch" | "buy" | "sell" | "graduate";
  token: string;
  symbol: string;
  eth?: number;
  block: bigint;
  logIndex: number;
};

const BUY = parseAbiItem(
  "event Buy(address indexed buyer, uint256 ethIn, uint256 tokensOut, uint256 fee)",
);
const SELL = parseAbiItem(
  "event Sell(address indexed seller, uint256 tokensIn, uint256 ethOut, uint256 fee)",
);
const GRADUATED = parseAbiItem(
  "event Graduated(address indexed pair, uint256 ethLiquidity, uint256 tokenLiquidity, uint256 devFee)",
);

const START_BLOCK = process.env.NEXT_PUBLIC_START_BLOCK
  ? BigInt(process.env.NEXT_PUBLIC_START_BLOCK)
  : 0n;

const HAS_FACTORY =
  FACTORY_ADDRESS.toLowerCase() !== "0x0000000000000000000000000000000000000000";

// Merges the most recent launches, trades, and graduations into one feed so the
// explore page shows a live pulse of the platform. Reuses the same wide getLogs
// pattern as the market stats, keyed by the token address set.
export function useLiveActivity(
  symbolByAddress: Map<string, string>,
  limit = 8,
): Activity[] {
  const client = usePublicClient();
  const [items, setItems] = useState<Activity[]>([]);
  const key = [...symbolByAddress.keys()].sort().join(",");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!client || !HAS_FACTORY || symbolByAddress.size === 0) return;
      const addrs = [...symbolByAddress.keys()].map((a) => a as `0x${string}`);
      const sym = (a?: string) => symbolByAddress.get((a ?? "").toLowerCase()) ?? "";
      try {
        const [buys, sells, grads, created] = await Promise.all([
          scanLogs(client, START_BLOCK, (from, to) => client.getLogs({ address: addrs, event: BUY, fromBlock: from, toBlock: to })),
          scanLogs(client, START_BLOCK, (from, to) => client.getLogs({ address: addrs, event: SELL, fromBlock: from, toBlock: to })),
          scanLogs(client, START_BLOCK, (from, to) => client.getLogs({ address: addrs, event: GRADUATED, fromBlock: from, toBlock: to })),
          scanLogs(client, START_BLOCK, (from, to) =>
            client.getContractEvents({ address: FACTORY_ADDRESS, abi: factoryAbi, eventName: "TokenCreated", fromBlock: from, toBlock: to }),
          ),
        ]);
        if (cancelled) return;

        const out: Activity[] = [];
        for (const l of buys) {
          const token = (l.address ?? "").toLowerCase();
          out.push({
            kind: "buy",
            token,
            symbol: sym(token),
            eth: l.args.ethIn ? Number(formatEther(l.args.ethIn)) : 0,
            block: l.blockNumber ?? 0n,
            logIndex: Number(l.logIndex ?? 0),
          });
        }
        for (const l of sells) {
          const token = (l.address ?? "").toLowerCase();
          out.push({
            kind: "sell",
            token,
            symbol: sym(token),
            eth: l.args.ethOut ? Number(formatEther(l.args.ethOut)) : 0,
            block: l.blockNumber ?? 0n,
            logIndex: Number(l.logIndex ?? 0),
          });
        }
        for (const l of grads) {
          const token = (l.address ?? "").toLowerCase();
          out.push({
            kind: "graduate",
            token,
            symbol: sym(token),
            block: l.blockNumber ?? 0n,
            logIndex: Number(l.logIndex ?? 0),
          });
        }
        for (const l of created) {
          const token = ((l.args as { token?: string }).token ?? "").toLowerCase();
          out.push({
            kind: "launch",
            token,
            symbol: (l.args as { symbol?: string }).symbol ?? sym(token),
            block: l.blockNumber ?? 0n,
            logIndex: Number(l.logIndex ?? 0),
          });
        }

        // newest first
        out.sort((a, b) =>
          a.block === b.block ? b.logIndex - a.logIndex : a.block < b.block ? 1 : -1,
        );
        setItems(out.slice(0, limit));
      } catch {
        // range limited RPC; the feed just stays empty
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, key, limit]);

  return items;
}
