"use client";

import { useEffect, useRef, useState } from "react";
import type { Log } from "viem";
import { usePublicClient, useWatchContractEvent } from "wagmi";
import { FACTORY_ADDRESS, factoryAbi } from "./contracts";
import { accentFor } from "./tokens";

export type Launch = {
  address: `0x${string}`;
  name: string;
  symbol: string;
  accent: string;
  block: bigint;
  fresh?: boolean; // arrived live this session
};

const START_BLOCK = process.env.NEXT_PUBLIC_START_BLOCK
  ? BigInt(process.env.NEXT_PUBLIC_START_BLOCK)
  : 0n;

const HAS_FACTORY =
  FACTORY_ADDRESS.toLowerCase() !== "0x0000000000000000000000000000000000000000";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toLaunch(log: any, fresh: boolean): Launch | null {
  const a = log.args ?? {};
  if (!a.token) return null;
  return {
    address: a.token as `0x${string}`,
    name: (a.name as string) ?? "Token",
    symbol: (a.symbol as string) ?? "",
    accent: accentFor(a.token as string),
    block: log.blockNumber ?? 0n,
    fresh,
  };
}

// Streams the most recent token launches from the factory: a one shot backfill
// of past TokenCreated events plus live updates. The event already carries the
// name and symbol, so this needs no per token contract reads.
export function useRecentLaunches(limit = 16): Launch[] {
  const client = usePublicClient();
  const [launches, setLaunches] = useState<Launch[]>([]);
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!client || !HAS_FACTORY) return;
      try {
        const logs = await client.getContractEvents({
          address: FACTORY_ADDRESS,
          abi: factoryAbi,
          eventName: "TokenCreated",
          fromBlock: START_BLOCK,
          toBlock: "latest",
        });
        if (cancelled) return;
        const items = logs
          .map((l) => toLaunch(l, false))
          .filter((l): l is Launch => l !== null);
        for (const l of items) seen.current.add(l.address.toLowerCase());
        // newest first
        items.reverse();
        setLaunches(items.slice(0, limit));
      } catch {
        // ignore range limited RPC; live updates still fill the strip
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [client, limit]);

  useWatchContractEvent({
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    eventName: "TokenCreated",
    onLogs: (logs: Log[]) => {
      const fresh = logs
        .map((l) => toLaunch(l, true))
        .filter((l): l is Launch => l !== null)
        .filter((l) => !seen.current.has(l.address.toLowerCase()));
      if (fresh.length === 0) return;
      for (const l of fresh) seen.current.add(l.address.toLowerCase());
      setLaunches((prev) => [...fresh.reverse(), ...prev].slice(0, limit));
    },
  });

  return launches;
}
