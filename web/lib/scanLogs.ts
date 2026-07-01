import type { PublicClient } from "viem";

// The public Base RPC caps eth_getLogs at a 2000 block range. This splits a
// wide scan into windows within that cap, runs them, and merges the results.
// Each caller passes its own typed getLogs call as fetchWindow, so log types
// are preserved. A lookback cap bounds the number of requests as the chain
// grows; the most recent windows are always covered.
const MAX_RANGE = 2000n;
const MAX_WINDOWS = 40n;

export async function scanLogs<T>(
  client: PublicClient,
  fromBlock: bigint,
  fetchWindow: (from: bigint, to: bigint) => Promise<T[]>,
): Promise<T[]> {
  const latest = await client.getBlockNumber();
  let from = fromBlock;
  const span = MAX_RANGE * MAX_WINDOWS;
  if (latest - from > span) from = latest > span ? latest - span : 0n;

  const ranges: [bigint, bigint][] = [];
  for (let s = from; s <= latest; s += MAX_RANGE) {
    const e = s + MAX_RANGE - 1n < latest ? s + MAX_RANGE - 1n : latest;
    ranges.push([s, e]);
    if (e >= latest) break;
  }

  const settled = await Promise.allSettled(ranges.map(([f, t]) => fetchWindow(f, t)));
  const out: T[] = [];
  for (const r of settled) if (r.status === "fulfilled") out.push(...r.value);
  return out;
}
