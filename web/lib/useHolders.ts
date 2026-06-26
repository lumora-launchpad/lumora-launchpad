"use client";

import { useEffect, useState } from "react";
import { formatEther, parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";
import { tokenAbi } from "./contracts";

export type Holder = {
  address: string;
  balance: number;
  pct: number; // percent of total supply
};

const TRANSFER = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)",
);

const START_BLOCK = process.env.NEXT_PUBLIC_START_BLOCK
  ? BigInt(process.env.NEXT_PUBLIC_START_BLOCK)
  : 0n;

const TOTAL_SUPPLY = 1_000_000_000n * 10n ** 18n;
const ZERO = "0x0000000000000000000000000000000000000000";
const DEAD = "0x000000000000000000000000000000000000dead";

// Builds a holders list for one token: scan its Transfer events for every
// address that ever touched the token, read current balances in one multicall,
// then keep non-zero balances sorted high to low. The token contract itself
// (the curve reserve) and the burn address are excluded.
export function useHolders(token: `0x${string}`): {
  holders: Holder[];
  isLoading: boolean;
} {
  const client = usePublicClient();
  const [holders, setHolders] = useState<Holder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!client) return;
      setIsLoading(true);
      try {
        const logs = await client.getLogs({
          address: token,
          event: TRANSFER,
          fromBlock: START_BLOCK,
          toBlock: "latest",
        });

        const addrs = new Set<string>();
        for (const l of logs) {
          const from = (l.args.from ?? "").toLowerCase();
          const to = (l.args.to ?? "").toLowerCase();
          if (from && from !== ZERO) addrs.add(from);
          if (to && to !== ZERO) addrs.add(to);
        }
        addrs.delete(token.toLowerCase());
        addrs.delete(DEAD);

        const list = [...addrs];
        if (list.length === 0) {
          if (!cancelled) setHolders([]);
          return;
        }

        const balances = await client.multicall({
          contracts: list.map((a) => ({
            address: token,
            abi: tokenAbi,
            functionName: "balanceOf" as const,
            args: [a as `0x${string}`],
          })),
        });

        const result: Holder[] = [];
        list.forEach((a, i) => {
          const r = balances[i];
          const bal = r.status === "success" ? (r.result as bigint) : 0n;
          if (bal > 0n) {
            result.push({
              address: a,
              balance: Number(formatEther(bal)),
              pct: Number((bal * 10000n) / TOTAL_SUPPLY) / 100,
            });
          }
        });
        result.sort((x, y) => y.balance - x.balance);
        if (!cancelled) setHolders(result);
      } catch {
        if (!cancelled) setHolders([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [client, token]);

  return { holders, isLoading };
}
