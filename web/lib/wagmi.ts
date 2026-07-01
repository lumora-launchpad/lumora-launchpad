import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { cookieStorage, createStorage } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 84532);

export const activeChain = chainId === base.id ? base : baseSepolia;

export function txExplorerUrl(hash: string): string {
  const baseUrl = activeChain.blockExplorers?.default.url ?? "https://basescan.org";
  return `${baseUrl}/tx/${hash}`;
}

export const wagmiConfig = getDefaultConfig({
  appName: "Lumora Launchpad",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID ?? "demo",
  chains: chainId === base.id ? [base] : [baseSepolia],
  ssr: true,
  // Namespace the persisted wallet state by active chain. When the app switched
  // from Base Sepolia to Base mainnet, wagmi tried to restore the old persisted
  // chain (84532), which is no longer in `chains`, and threw "Chain not
  // configured" on connect. A chain scoped storage key makes the old testnet
  // state be ignored so every visitor starts fresh on the current network.
  storage: createStorage({
    storage: cookieStorage,
    key: `lumora.wagmi.${chainId}`,
  }),
});
