import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, baseSepolia } from "wagmi/chains";

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 84532);

export const activeChain = chainId === base.id ? base : baseSepolia;

export const wagmiConfig = getDefaultConfig({
  appName: "Lumora Launchpad",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID ?? "demo",
  chains: chainId === base.id ? [base] : [baseSepolia],
  ssr: true,
});
