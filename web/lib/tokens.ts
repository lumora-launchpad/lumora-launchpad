import { formatEther } from "viem";

export type TokenView = {
  address: string;
  name: string;
  symbol: string;
  blurb?: string;
  imageUrl?: string;
  marketCap: string;
  raisedEth: number; // real ETH raised on the curve, numeric
  progress: number; // 0 to 100
  accent: string; // tailwind gradient classes
  graduated?: boolean;
  creator?: string;
};

export function shortAddress(addr?: string): string {
  if (!addr || addr.length < 10) return "unknown";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const ACCENTS = [
  "from-base-blue to-base-violet",
  "from-base-violet to-base-pink",
  "from-base-sky to-base-mint",
  "from-base-pink to-base-blue",
  "from-base-mint to-base-sky",
];

/// Deterministic gradient per token so every card looks distinct.
export function accentFor(address: string): string {
  let h = 0;
  for (let i = 2; i < address.length; i++) {
    h = (h * 31 + address.charCodeAt(i)) >>> 0;
  }
  return ACCENTS[h % ACCENTS.length];
}

export function formatEth(value?: bigint): string {
  if (!value) return "0";
  const n = Number(formatEther(value));
  if (n === 0) return "0";
  if (n < 0.001) return "<0.001";
  return n.toLocaleString("en-US", { maximumFractionDigits: 3 });
}
