import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { tokenAbi } from "@/lib/contracts";
import { metadataMessage } from "@/lib/metadataAuth";

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

// Reads the on-chain creator of a Lumora token or campaign. Both LaunchpadToken
// and LaunchCampaign expose a `creator` view that returns the address, so the
// same read works for instant tokens and demand gated campaigns. Returns the
// lowercased address, or undefined if the address is not a Lumora contract.
export async function readCreator(address: string): Promise<string | undefined> {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return undefined;
  try {
    const creator = await serverClient.readContract({
      address: address as `0x${string}`,
      abi: tokenAbi,
      functionName: "creator",
    });
    return (creator as string).toLowerCase();
  } catch {
    return undefined;
  }
}

// True when `signature` over the metadata message for `address`/`signedAt` was
// produced by that address's on-chain creator. Uses the public client's
// verifyMessage so both EOA and smart contract (EIP-1271) creators are
// supported.
export async function isCreatorSignature(
  address: string,
  signedAt: number,
  signature: `0x${string}`,
): Promise<boolean> {
  const creator = await readCreator(address);
  if (!creator) return false;
  try {
    return await serverClient.verifyMessage({
      address: creator as `0x${string}`,
      message: metadataMessage(address, signedAt),
      signature,
    });
  } catch {
    return false;
  }
}
