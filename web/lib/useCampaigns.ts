"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { CAMPAIGN_FACTORY_ADDRESS, campaignFactoryAbi, campaignAbi } from "./campaigns";
import { accentFor, formatEth } from "./tokens";

export type CampaignView = {
  address: `0x${string}`;
  name: string;
  symbol: string;
  creator: `0x${string}`;
  targetEth: bigint;
  totalCommitted: bigint;
  deadline: number; // unix seconds
  launched: boolean;
  token: `0x${string}`;
  progress: number; // 0..100
  accent: string;
};

const ZERO = "0x0000000000000000000000000000000000000000";
const PAGE = 24;

export function useCampaigns(): {
  campaigns: CampaignView[];
  isLoading: boolean;
  hasFactory: boolean;
} {
  const hasFactory = CAMPAIGN_FACTORY_ADDRESS.toLowerCase() !== ZERO;

  const { data: count, isLoading: countLoading } = useReadContract({
    address: CAMPAIGN_FACTORY_ADDRESS,
    abi: campaignFactoryAbi,
    functionName: "campaignsCount",
    query: { enabled: hasFactory },
  });

  const total = count ? Number(count) : 0;
  const start = total > PAGE ? BigInt(total - PAGE) : 0n;

  const { data: addresses, isLoading: addrLoading } = useReadContract({
    address: CAMPAIGN_FACTORY_ADDRESS,
    abi: campaignFactoryAbi,
    functionName: "getCampaigns",
    args: [start, BigInt(PAGE)],
    query: { enabled: hasFactory && total > 0 },
  });

  const ordered = [...((addresses as readonly `0x${string}`[]) ?? [])].reverse();

  const contracts = ordered.flatMap((addr) => [
    { address: addr, abi: campaignAbi, functionName: "name" } as const,
    { address: addr, abi: campaignAbi, functionName: "symbol" } as const,
    { address: addr, abi: campaignAbi, functionName: "creator" } as const,
    { address: addr, abi: campaignAbi, functionName: "targetEth" } as const,
    { address: addr, abi: campaignAbi, functionName: "totalCommitted" } as const,
    { address: addr, abi: campaignAbi, functionName: "deadline" } as const,
    { address: addr, abi: campaignAbi, functionName: "launched" } as const,
    { address: addr, abi: campaignAbi, functionName: "token" } as const,
    { address: addr, abi: campaignAbi, functionName: "progressBps" } as const,
  ]);

  const { data: meta, isLoading: metaLoading } = useReadContracts({
    contracts,
    query: { enabled: ordered.length > 0 },
  });

  const campaigns: CampaignView[] = [];
  if (meta) {
    for (let i = 0; i < ordered.length; i++) {
      const b = i * 9;
      const name = meta[b]?.result as string | undefined;
      const symbol = meta[b + 1]?.result as string | undefined;
      if (!name || !symbol) continue;
      campaigns.push({
        address: ordered[i],
        name,
        symbol,
        creator: (meta[b + 2]?.result as `0x${string}`) ?? ZERO,
        targetEth: (meta[b + 3]?.result as bigint) ?? 0n,
        totalCommitted: (meta[b + 4]?.result as bigint) ?? 0n,
        deadline: Number((meta[b + 5]?.result as bigint) ?? 0n),
        launched: Boolean(meta[b + 6]?.result),
        token: (meta[b + 7]?.result as `0x${string}`) ?? ZERO,
        progress: meta[b + 8]?.result
          ? Number(meta[b + 8].result as bigint) / 100
          : 0,
        accent: accentFor(ordered[i]),
      });
    }
  }

  const isLoading =
    hasFactory &&
    (countLoading || (total > 0 && addrLoading) || (ordered.length > 0 && metaLoading));

  return { campaigns, isLoading, hasFactory };
}

export function targetLabel(c: CampaignView): string {
  return `${formatEth(c.totalCommitted)} / ${formatEth(c.targetEth)} ETH`;
}
