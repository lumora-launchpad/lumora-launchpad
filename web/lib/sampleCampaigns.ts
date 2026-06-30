// Rich sample campaigns used to preview the campaign experience on testnet and
// when the factory has few live campaigns. These are clearly flagged as samples
// in the UI (a "Sample" badge) and are switched off on mainnet, so production
// never shows invented data. They give every campaign feature real shaped data
// to render and test against.

export type CampaignCategory =
  | "AI"
  | "Meme"
  | "Gaming"
  | "DeFi"
  | "Infrastructure"
  | "NFT"
  | "Utility"
  | "SocialFi";

export type SampleCampaign = {
  id: string;
  name: string;
  symbol: string;
  creator: string;
  category: CampaignCategory;
  blurb: string;
  why: string;
  currentEth: number;
  targetEth: number;
  supporters: number;
  views: number;
  hoursLeft: number; // time remaining; ignored when graduated
  status: "live" | "graduated";
  accent: string;
  image?: string; // optional logo and banner image in public/tokens
  featured?: boolean;
  socials?: { website?: string; x?: string; telegram?: string; discord?: string };
  createdHoursAgo: number;
};

export const sampleCampaigns: SampleCampaign[] = [
  {
    id: "ai-cat",
    name: "AI CAT",
    symbol: "AICAT",
    creator: "0x8f71a4b2c0d9e5f6a7b8c34d2e1f0a9b8c7d6e5f",
    category: "AI",
    blurb: "An AI meme that brings the community into the next era.",
    why: "A playful AI mascot with a real product roadmap and an active community already building memes and tools around it.",
    currentEth: 0.52,
    targetEth: 0.6,
    supporters: 127,
    views: 4820,
    hoursLeft: 18,
    status: "live",
    accent: "from-base-blue to-base-violet",
    image: "/tokens/buddyai.png",
    featured: true,
    socials: { website: "https://example.com", x: "https://x.com", telegram: "https://t.me", discord: "https://discord.com" },
    createdHoursAgo: 30,
  },
  {
    id: "metaforge",
    name: "MetaForge",
    symbol: "FORGE",
    creator: "0x9da2f1b3c4d5e6a7b8c9d0e1f2a3b4c5d6e7f8a9",
    category: "Gaming",
    blurb: "An AI driven game and NFT world built natively on Base.",
    why: "A studio shipping an on chain game with a working demo and a community that wants a fair launch token.",
    currentEth: 0.51,
    targetEth: 0.6,
    supporters: 98,
    views: 3910,
    hoursLeft: 12,
    status: "live",
    accent: "from-base-violet to-base-pink",
    image: "/tokens/nebula.png",
    featured: true,
    socials: { website: "https://example.com", x: "https://x.com" },
    createdHoursAgo: 26,
  },
  {
    id: "basepunks",
    name: "BasePunks",
    symbol: "PUNK",
    creator: "0x77aae0d21b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
    category: "NFT",
    blurb: "Ten thousand unique PFPs on Base. Built for the community.",
    why: "A culture first NFT brand expanding into a community token, with art and a roadmap already public.",
    currentEth: 0.42,
    targetEth: 0.6,
    supporters: 76,
    views: 2640,
    hoursLeft: 26,
    status: "live",
    accent: "from-base-pink to-base-blue",
    image: "/tokens/dreamland.png",
    socials: { x: "https://x.com", discord: "https://discord.com" },
    createdHoursAgo: 20,
  },
  {
    id: "defiwave",
    name: "DeFiWave",
    symbol: "WAVE",
    creator: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
    category: "DeFi",
    blurb: "Yield strategies for everyone, simple and transparent on Base.",
    why: "An audited yield router with live TVL on testnet, moving to a community owned token model.",
    currentEth: 0.58,
    targetEth: 0.6,
    supporters: 164,
    views: 6120,
    hoursLeft: 8,
    status: "live",
    accent: "from-base-sky to-base-mint",
    image: "/tokens/aurora.png",
    featured: true,
    socials: { website: "https://example.com", x: "https://x.com", telegram: "https://t.me" },
    createdHoursAgo: 40,
  },
  {
    id: "nebula-infra",
    name: "Nebula",
    symbol: "NEB",
    creator: "0x1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d",
    category: "Infrastructure",
    blurb: "Open RPC and indexing infrastructure for Base builders.",
    why: "Developer tooling already used by early projects, raising to decentralize access with a token.",
    currentEth: 0.21,
    targetEth: 0.6,
    supporters: 39,
    views: 1480,
    hoursLeft: 44,
    status: "live",
    accent: "from-base-blue to-base-sky",
    socials: { website: "https://example.com", x: "https://x.com" },
    createdHoursAgo: 10,
  },
  {
    id: "socialbase",
    name: "SocialBase",
    symbol: "SOCL",
    creator: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
    category: "SocialFi",
    blurb: "A creator economy protocol where communities own their growth.",
    why: "A SocialFi app with weekly active users on testnet, aligning incentives through a fair launch.",
    currentEth: 0.34,
    targetEth: 0.6,
    supporters: 61,
    views: 2210,
    hoursLeft: 33,
    status: "live",
    accent: "from-base-violet to-base-blue",
    socials: { x: "https://x.com", telegram: "https://t.me" },
    createdHoursAgo: 6,
  },
  {
    id: "pixeldream",
    name: "PixelDream",
    symbol: "PXDR",
    creator: "0x2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e",
    category: "Gaming",
    blurb: "A retro pixel world with on chain rewards.",
    why: "A finished game looking to reward early players through a community token.",
    currentEth: 0.6,
    targetEth: 0.6,
    supporters: 212,
    views: 8030,
    hoursLeft: 0,
    status: "graduated",
    accent: "from-base-pink to-base-violet",
    socials: { website: "https://example.com", x: "https://x.com", discord: "https://discord.com" },
    createdHoursAgo: 96,
  },
  {
    id: "aurora-protocol",
    name: "Aurora Protocol",
    symbol: "AURP",
    creator: "0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a",
    category: "DeFi",
    blurb: "Cross market liquidity routing, now community owned.",
    why: "A protocol that hit its target and graduated, with liquidity locked on Uniswap.",
    currentEth: 0.6,
    targetEth: 0.6,
    supporters: 188,
    views: 7240,
    hoursLeft: 0,
    status: "graduated",
    accent: "from-base-sky to-base-violet",
    socials: { website: "https://example.com", x: "https://x.com" },
    createdHoursAgo: 120,
  },
];
