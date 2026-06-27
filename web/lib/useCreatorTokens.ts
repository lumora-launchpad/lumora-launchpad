"use client";

import { formatEther } from "viem";
import { useReadContract, useReadContracts } from "wagmi";
import { FACTORY_ADDRESS, factoryAbi, tokenAbi } from "./contracts";
import { accentFor, formatEth, type TokenView } from "./tokens";

const ZERO = "0x0000000000000000000000000000000000000000";

// All tokens created by one address, read from the factory's per-creator
// registry, with their on-chain state.
export function useCreatorTokens(creator?: `0x${string}`): {
  tokens: TokenView[];
  isLoading: boolean;
} {
  const enabled =
    FACTORY_ADDRESS.toLowerCase() !== ZERO && !!creator;

  const { data: count, isLoading: countLoading } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    functionName: "creatorTokensCount",
    args: [creator ?? (ZERO as `0x${string}`)],
    query: { enabled },
  });

  const total = count ? Number(count) : 0;

  const { data: addrData, isLoading: addrLoading } = useReadContracts({
    contracts: Array.from({ length: total }, (_, i) => ({
      address: FACTORY_ADDRESS,
      abi: factoryAbi,
      functionName: "tokensByCreator" as const,
      args: [creator ?? (ZERO as `0x${string}`), BigInt(i)],
    })),
    query: { enabled: enabled && total > 0 },
  });

  const addresses = (addrData ?? [])
    .map((r) => r.result as `0x${string}` | undefined)
    .filter((a): a is `0x${string}` => !!a);
  // newest first
  const ordered = [...addresses].reverse();

  const { data: meta, isLoading: metaLoading } = useReadContracts({
    contracts: ordered.flatMap((addr) => [
      { address: addr, abi: tokenAbi, functionName: "name" } as const,
      { address: addr, abi: tokenAbi, functionName: "symbol" } as const,
      { address: addr, abi: tokenAbi, functionName: "graduationProgressBps" } as const,
      { address: addr, abi: tokenAbi, functionName: "realEthReserve" } as const,
      { address: addr, abi: tokenAbi, functionName: "graduated" } as const,
    ]),
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
        raisedEth: raised ? Number(formatEther(raised)) : 0,
        progress: bps ? Number(bps) / 100 : 0,
        accent: accentFor(ordered[i]),
        graduated: Boolean(graduated),
      });
    }
  }

  const isLoading =
    enabled &&
    (countLoading || (total > 0 && addrLoading) || (ordered.length > 0 && metaLoading));

  return { tokens, isLoading };
}
