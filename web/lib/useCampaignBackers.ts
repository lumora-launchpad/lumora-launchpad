"use client";

import { useEffect, useState } from "react";
import { parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";
import { CAMPAIGN_FACTORY_ADDRESS } from "./campaigns";

const COMMITTED = parseAbiItem(
  "event Committed(address indexed backer, uint256 amount, uint256 total)",
);

const START_BLOCK = process.env.NEXT_PUBLIC_START_BLOCK
  ? BigInt(process.env.NEXT_PUBLIC_START_BLOCK)
  : 0n;

const HAS_FACTORY =
  CAMPAIGN_FACTORY_ADDRESS.toLowerCase() !==
  "0x0000000000000000000000000000000000000000";

// Counts unique backers per campaign in one wide getLogs over all Committed
// events, keyed by the campaign address set. Cheap, no per-campaign scan.
export function useCampaignBackers(addresses: string[]): Map<string, number> {
  const client = usePublicClient();
  const [counts, setCounts] = useState<Map<string, number>>(new Map());
  const key = [...addresses].map((a) => a.toLowerCase()).sort().join(",");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!client || !HAS_FACTORY || addresses.length === 0) return;
      try {
        const logs = await client.getLogs({
          address: addresses.map((a) => a as `0x${string}`),
          event: COMMITTED,
          fromBlock: START_BLOCK,
          toBlock: "latest",
        });
        if (cancelled) return;
        const sets = new Map<string, Set<string>>();
        for (const l of logs) {
          const c = (l.address ?? "").toLowerCase();
          const backer = (l.args.backer ?? "").toLowerCase();
          if (!c || !backer) continue;
          if (!sets.has(c)) sets.set(c, new Set());
          sets.get(c)!.add(backer);
        }
        const out = new Map<string, number>();
        for (const [c, set] of sets) out.set(c, set.size);
        setCounts(out);
      } catch {
        // range limited RPC; cards just render without backer counts
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, key]);

  return counts;
}
