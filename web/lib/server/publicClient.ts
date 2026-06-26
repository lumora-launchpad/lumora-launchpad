import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { tokenAbi } from "@/lib/contracts";

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 84532);
export const serverChain = chainId === base.id ? base : baseSepolia;

const serverClient = createPublicClient({
  chain: serverChain,
  transport: http(),
});

// Reads a token's name and symbol on the server for metadata and OG images.
// Falls back to undefined fields so callers can render a generic card.
export async function readTokenBasics(
  address: string,
): Promise<{ name?: string; symbol?: string }> {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return {};
  try {
    const [name, symbol] = await Promise.all([
      serverClient.readContract({
        address: address as `0x${string}`,
        abi: tokenAbi,
        functionName: "name",
      }),
      serverClient.readContract({
        address: address as `0x${string}`,
        abi: tokenAbi,
        functionName: "symbol",
      }),
    ]);
    return { name: name as string, symbol: symbol as string };
  } catch {
    return {};
  }
}
