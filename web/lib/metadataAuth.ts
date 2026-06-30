// Shared message format for authenticating off-chain metadata writes.
//
// A token's (or campaign's) on-chain creator signs this message, and the API
// verifies the signature came from that creator before accepting an edit, so a
// stranger cannot overwrite someone else's token metadata. The client (when
// saving) and the server (when verifying) both build the message here so the
// bytes always match.

// How long a signature stays valid, to bound replay of a captured signature.
export const METADATA_SIG_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

// Binds the signature to a specific token address and a moment in time.
export function metadataMessage(address: string, signedAt: number): string {
  return [
    "Lumora metadata update",
    `Token: ${address.toLowerCase()}`,
    `Time: ${signedAt}`,
  ].join("\n");
}
