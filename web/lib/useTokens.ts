"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { FACTORY_ADDRESS, factoryAbi, tokenAbi } from "./contracts";
import { accentFor, formatEth, type TokenView } from "./tokens";

const ZERO = "0x0000000000000000000000000000000000000000";
const PAGE = 24; // newest tokens to show on the landing

export function useTokens(): {
  tokens: TokenView[];
  isLoading: boolean;
  hasFactory: boolean;
} {
  const hasFactory = FACTORY_ADDRESS.toLowerCase() !== ZERO;

  const { data: count, isLoading: countLoading } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    functionName: "tokensCount",
    query: { enabled: hasFactory },
  });

  const total = count ? Number(count) : 0;
  const start = total > PAGE ? BigInt(total - PAGE) : 0n;

  const { data: addresses, isLoading: addrLoading } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    functionName: "getTokens",
    args: [start, BigInt(PAGE)],
    query: { enabled: hasFactory && total > 0 },
  });

  // Newest first.
  const ordered = [...((addresses as readonly `0x${string}`[]) ?? [])].reverse();

  const contracts = ordered.flatMap((addr) => [
    { address: addr, abi: tokenAbi, functionName: "name" } as const,
    { address: addr, abi: tokenAbi, functionName: "symbol" } as const,
    { address: addr, abi: tokenAbi, functionName: "graduationProgressBps" } as const,
    { address: addr, abi: tokenAbi, functionName: "realEthReserve" } as const,
    { address: addr, abi: tokenAbi, functionName: "graduated" } as const,
  ]);

  const { data: meta, isLoading: metaLoading } = useReadContracts({
    contracts,
    query: { enabled: ordered.length > 0 },
  });

  const tokens: TokenView[] = [];
  if (meta) {
    for (let i = 0; i < ordered.length; i++) {
      const b = i * 5;
      const name = meta[b]?.result as string | undefined;
      const symbol = meta[b + 1]?.result as string | undefined;
      const bps = meta[b + 2]?.result as bigint | undefined;
      const raised = meta[b + 3]?.result as bigint | undefined;
      const graduated = meta[b + 4]?.result as boolean | undefined;
      if (!name || !symbol) continue;

      tokens.push({
        address: ordered[i],
        name,
        symbol,
        marketCap: `${formatEth(raised)} ETH`,
        progress: bps ? Number(bps) / 100 : 0,
        accent: accentFor(ordered[i]),
        graduated: Boolean(graduated),
      });
    }
  }

  const isLoading =
    hasFactory &&
    (countLoading ||
      (total > 0 && addrLoading) ||
      (ordered.length > 0 && metaLoading));

  return { tokens, isLoading, hasFactory };
}
