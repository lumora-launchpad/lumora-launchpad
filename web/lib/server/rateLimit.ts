// A small in-memory sliding-window rate limiter. Fine for a single long lived
// server (this VPS). If the app is ever scaled to multiple instances, swap this
// for a shared store like Redis.

type Hits = number[];
const store = new Map<string, Hits>();
let calls = 0;

function sweep(now: number) {
  for (const [key, hits] of store) {
    const fresh = hits.filter((t) => now - t < 3_600_000);
    if (fresh.length === 0) store.delete(key);
    else store.set(key, fresh);
  }
}

/** Returns true if the action is allowed, false if the limit is exceeded. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (++calls % 2000 === 0) sweep(now);

  const hits = (store.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    store.set(key, hits);
    return false;
  }
  hits.push(now);
  store.set(key, hits);
  return true;
}

/** Best effort client IP from the reverse proxy headers. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
