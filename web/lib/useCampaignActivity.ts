"use client";

import { useEffect, useState } from "react";
import { parseAbiItem, formatEther } from "viem";
import { usePublicClient } from "wagmi";
import { scanLogs } from "./scanLogs";

const COMMITTED = parseAbiItem(
  "event Committed(address indexed backer, uint256 amount, uint256 total)",
);

const START_BLOCK = process.env.NEXT_PUBLIC_START_BLOCK
  ? BigInt(process.env.NEXT_PUBLIC_START_BLOCK)
  : 0n;

export type Commit = {
  backer: string;
  amount: number; // ETH
  total: number; // cumulative ETH after this commit
  block: number;
};

export type CampaignActivity = {
  commits: Commit[]; // newest first
  topSupporters: { backer: string; amount: number }[]; // by total committed, desc
};

// Reads the Committed events for a single campaign to build a recent funding
// feed and the top supporters. One getLogs call over the campaign address.
export function useCampaignActivity(address?: string): CampaignActivity {
  const client = usePublicClient();
  const [data, setData] = useState<CampaignActivity>({ commits: [], topSupporters: [] });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!client || !address) return;
      try {
        const logs = await scanLogs(client, START_BLOCK, (from, to) =>
          client.getLogs({ address: address as `0x${string}`, event: COMMITTED, fromBlock: from, toBlock: to }),
        );
        if (cancelled) return;
        const commits: Commit[] = logs.map((l) => ({
          backer: (l.args.backer ?? "") as string,
          amount: Number(formatEther((l.args.amount ?? 0n) as bigint)),
          total: Number(formatEther((l.args.total ?? 0n) as bigint)),
          block: Number(l.blockNumber ?? 0n),
        }));
        const byBacker = new Map<string, number>();
        for (const c of commits) {
          byBacker.set(c.backer.toLowerCase(), (byBacker.get(c.backer.toLowerCase()) ?? 0) + c.amount);
        }
        const topSupporters = [...byBacker.entries()]
          .map(([backer, amount]) => ({ backer, amount }))
          .sort((a, b) => b.amount - a.amount);
        setData({ commits: commits.reverse(), topSupporters });
      } catch {
        // range limited RPC; section just renders empty
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [client, address]);

  return data;
}
