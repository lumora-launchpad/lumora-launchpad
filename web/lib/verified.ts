// Curated set of verified token addresses, lowercased. This is the source of
// truth for the verified badge and the Verified filter. It is empty until a
// token is reviewed and added, so nothing is marked verified by default.
export const VERIFIED_ADDRESSES = new Set<string>([
  // "0x...": add reviewed token addresses here, lowercased.
]);

export function isVerified(address?: string): boolean {
  return !!address && VERIFIED_ADDRESSES.has(address.toLowerCase());
}
