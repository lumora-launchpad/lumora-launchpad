import type { TokenView } from "./tokens";

// Placeholder data shown when the factory is not deployed yet or has no tokens.
export const sampleTokens: TokenView[] = [
  {
    address: "0x1111111111111111111111111111111111111111",
    name: "Aurora",
    symbol: "AUR",
    blurb: "The first light on Base. A bright morning community.",
    marketCap: "12.4 ETH",
    raisedEth: 12.4,
    progress: 78,
    accent: "from-base-blue to-base-violet",
  },
  {
    address: "0x2222222222222222222222222222222222222222",
    name: "Prisma",
    symbol: "PRSM",
    blurb: "A full color spectrum for on chain creators.",
    marketCap: "8.9 ETH",
    raisedEth: 8.9,
    progress: 54,
    accent: "from-base-violet to-base-pink",
  },
  {
    address: "0x3333333333333333333333333333333333333333",
    name: "Lumen",
    symbol: "LMN",
    blurb: "A unit of brightness. An energy token for Base builders.",
    marketCap: "21.0 ETH",
    raisedEth: 21.0,
    progress: 92,
    accent: "from-base-sky to-base-mint",
  },
  {
    address: "0x4444444444444444444444444444444444444444",
    name: "Solis",
    symbol: "SOL8",
    blurb: "A little sun that never sets.",
    marketCap: "3.2 ETH",
    raisedEth: 3.2,
    progress: 27,
    accent: "from-base-pink to-base-blue",
  },
];
