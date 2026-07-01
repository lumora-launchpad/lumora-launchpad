"use client";

import { useEffect, useState } from "react";
import { parseAbiItem, formatEther } from "viem";
import { usePublicClient } from "wagmi";
import { scanLogs } from "./scanLogs";

const BUY = parseAbiItem(
  "event Buy(address indexed buyer, uint256 ethIn, uint256 tokensOut, uint256 fee)",
);
const SELL = parseAbiItem(
  "event Sell(address indexed seller, uint256 ethOut, uint256 tokensIn, uint256 fee)",
);

const START_BLOCK = process.env.NEXT_PUBLIC_START_BLOCK
  ? BigInt(process.env.NEXT_PUBLIC_START_BLOCK)
  : 0n;

export type AccountTrade = {
  token: string;
  side: "buy" | "sell";
  eth: number;
  block: number;
};

export type AccountTrades = {
  trades: AccountTrade[]; // newest first
  netInvested: number; // total buy ETH minus total sell ETH
};

// Scans Buy and Sell events for the connected account across the given token
// addresses, filtered by the indexed trader, to build a trading history and a
// simple net invested figure for profit and loss.
export function useAccountTrades(
  account?: string,
  tokens: string[] = [],
): AccountTrades {
  const client = usePublicClient();
  const [data, setData] = useState<AccountTrades>({ trades: [], netInvested: 0 });
  const key = `${account?.toLowerCase() ?? ""}:${[...tokens].map((t) => t.toLowerCase()).sort().join(",")}`;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!client || !account || tokens.length === 0) {
        setData({ trades: [], netInvested: 0 });
        return;
      }
      try {
        const addrs = tokens.map((t) => t as `0x${string}`);
        const [buys, sells] = await Promise.all([
          scanLogs(client, START_BLOCK, (from, to) =>
            client.getLogs({ address: addrs, event: BUY, args: { buyer: account as `0x${string}` }, fromBlock: from, toBlock: to }),
          ),
          scanLogs(client, START_BLOCK, (from, to) =>
            client.getLogs({ address: addrs, event: SELL, args: { seller: account as `0x${string}` }, fromBlock: from, toBlock: to }),
          ),
        ]);
        if (cancelled) return;
        const trades: AccountTrade[] = [];
        let invested = 0;
        for (const l of buys) {
          const eth = Number(formatEther((l.args.ethIn ?? 0n) as bigint));
          invested += eth;
          trades.push({ token: l.address, side: "buy", eth, block: Number(l.blockNumber ?? 0n) });
        }
        for (const l of sells) {
          const eth = Number(formatEther((l.args.ethOut ?? 0n) as bigint));
          invested -= eth;
          trades.push({ token: l.address, side: "sell", eth, block: Number(l.blockNumber ?? 0n) });
        }
        trades.sort((a, b) => b.block - a.block);
        setData({ trades, netInvested: invested });
      } catch {
        setData({ trades: [], netInvested: 0 });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, key]);

  return data;
}
