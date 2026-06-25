import type { TokenView } from "./tokens";

// Placeholder data shown when the factory is not deployed yet or has no tokens.
export const sampleTokens: TokenView[] = [
  {
    address: "0x1111111111111111111111111111111111111111",
    name: "Aurora",
    symbol: "AUR",
    blurb: "Cahaya pertama di Base. Komunitas pagi yang cerah.",
    marketCap: "12.4 ETH",
    progress: 78,
    accent: "from-base-blue to-base-violet",
  },
  {
    address: "0x2222222222222222222222222222222222222222",
    name: "Prisma",
    symbol: "PRSM",
    blurb: "Spektrum penuh warna untuk kreator on chain.",
    marketCap: "8.9 ETH",
    progress: 54,
    accent: "from-base-violet to-base-pink",
  },
  {
    address: "0x3333333333333333333333333333333333333333",
    name: "Lumen",
    symbol: "LMN",
    blurb: "Satuan terang. Token energi untuk builder Base.",
    marketCap: "21.0 ETH",
    progress: 92,
    accent: "from-base-sky to-base-mint",
  },
  {
    address: "0x4444444444444444444444444444444444444444",
    name: "Solis",
    symbol: "SOL8",
    blurb: "Matahari kecil yang tidak pernah tenggelam.",
    marketCap: "3.2 ETH",
    progress: 27,
    accent: "from-base-pink to-base-blue",
  },
];
