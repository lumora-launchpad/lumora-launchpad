// Phased launch config. Set NEXT_PUBLIC_DEMAND_LAUNCH_AT to a unix timestamp
// (seconds) to run the pre launch phase where Instant Launch is available but
// Demand Campaigns open later with a countdown. A zero or unset value means
// Demand is open now, which is the default so testnet behaves normally.
export const DEMAND_LAUNCH_AT = Number(
  process.env.NEXT_PUBLIC_DEMAND_LAUNCH_AT ?? 0,
);

export function isDemandOpen(nowSec = Math.floor(Date.now() / 1000)): boolean {
  return DEMAND_LAUNCH_AT <= 0 || nowSec >= DEMAND_LAUNCH_AT;
}
