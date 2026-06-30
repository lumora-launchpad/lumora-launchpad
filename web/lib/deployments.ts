import { base, baseSepolia } from "viem/chains";

// Single source of truth for the deployed contracts, the active network, the
// block explorer, and the GitHub links, shared by the contracts page, the docs,
// and the footer. Reads the same env the rest of the app uses, so it stays in
// sync with whatever the app is pointed at.

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 84532);
const chain = chainId === base.id ? base : baseSepolia;

export const NETWORK_NAME = chain.name;
export const IS_MAINNET = chain.id === base.id;

const EXPLORER_BASE =
  process.env.NEXT_PUBLIC_EXPLORER_URL ??
  chain.blockExplorers?.default.url ??
  "https://sepolia.basescan.org";

export const EXPLORER_NAME = EXPLORER_BASE.includes("basescan")
  ? "Basescan"
  : "the block explorer";

export function addressExplorerUrl(address: string): string {
  return `${EXPLORER_BASE}/address/${address}`;
}

// Flip NEXT_PUBLIC_CONTRACTS_VERIFIED to true once the source is verified on the
// explorer, which shows the verified badge on the contracts page.
export const CONTRACTS_VERIFIED =
  process.env.NEXT_PUBLIC_CONTRACTS_VERIFIED === "true";

const ZERO = "0x0000000000000000000000000000000000000000";

export type DeployedContract = {
  name: string;
  description: string;
  address: string;
};

export const CONTRACTS: DeployedContract[] = (
  [
    {
      name: "LaunchpadFactory",
      description:
        "Deploys bonding curve tokens and holds the global curve config and the developer treasury.",
      address: process.env.NEXT_PUBLIC_FACTORY_ADDRESS ?? "",
    },
    {
      name: "CampaignFactory",
      description: "Deploys demand gated launch campaigns.",
      address: process.env.NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS ?? "",
    },
  ] as DeployedContract[]
).filter((c) => c.address && c.address !== ZERO);

export const GITHUB_REPO = "https://github.com/lumora-launchpad/lumora-launchpad";

export const GITHUB = {
  repo: GITHUB_REPO,
  contracts: `${GITHUB_REPO}/tree/main/contracts`,
  frontend: `${GITHUB_REPO}/tree/main/web`,
  issues: `${GITHUB_REPO}/issues`,
  releases: `${GITHUB_REPO}/releases`,
  readme: `${GITHUB_REPO}#readme`,
};

export const X_HANDLE = "LumoraLaunchpad";
export const X_URL = `https://x.com/${X_HANDLE}`;

// Protocol reference values shown on the contracts page. Treasury and router
// addresses are optional via env and show a placeholder until set, so the page
// is ready to display the official mainnet values after launch.
export const VERSION = process.env.NEXT_PUBLIC_VERSION ?? "v1.0";
export const AUDIT_STATUS =
  process.env.NEXT_PUBLIC_AUDIT_STATUS ??
  (IS_MAINNET ? "Pending" : "Unaudited, testnet");
export const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_DEV_TREASURY ?? "";
export const ROUTER_ADDRESS = process.env.NEXT_PUBLIC_ROUTER ?? "";
export const EXPLORER_HOME = EXPLORER_BASE;
