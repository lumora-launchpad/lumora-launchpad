"use client";

import Link from "next/link";
import { DEMAND_LAUNCH_AT, isDemandOpen } from "@/lib/phase";
import { PhaseCountdown } from "./PhaseCountdown";
import { Icon } from "./icons";

// The phased launch banner. While Demand Campaigns are not open yet, the home
// page leads with a dual state: Instant Launch is available now, and Demand
// Campaign opens with a countdown. Renders nothing once Demand is open.
export function DemandCountdownBanner() {
  if (isDemandOpen()) return null;

  return (
    <section className="glass-card grid gap-4 p-5 sm:p-6 lg:grid-cols-2">
      {/* Instant available now */}
      <div className="flex flex-col justify-between rounded-2xl border border-base-blue/20 bg-base-blue/5 p-5">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-base-blue/10 px-3 py-1 text-xs font-bold text-base-blue">
            <span className="h-2 w-2 rounded-full bg-base-mint" />
            Available now
          </span>
          <h2 className="mt-3 text-xl font-black tracking-tight text-slate-900">Instant Launch</h2>
          <p className="mt-1 text-sm text-slate-500">
            Launch your token instantly. The full supply goes to a fair bonding
            curve and trading starts from second one.
          </p>
        </div>
        <Link href="/launch" className="btn-primary mt-4 w-full sm:w-auto">
          Launch your token
        </Link>
      </div>

      {/* Demand launching soon */}
      <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-brand-gradient p-5 text-white shadow-glow">
        <div className="orb right-[-3rem] top-[-3rem] h-32 w-32 bg-white/30 opacity-40" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">
            <Icon name="spark" className="h-4 w-4" />
            Coming soon
          </span>
          <h2 className="mt-3 text-xl font-black tracking-tight">Demand Campaign</h2>
          <p className="mt-1 text-sm text-white/80">
            Launch only when the community proves demand. Full refund if the
            target is not reached.
          </p>
        </div>
        <div className="relative mt-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/70">Funding opens in</p>
          <PhaseCountdown to={DEMAND_LAUNCH_AT} className="mt-2" />
        </div>
      </div>
    </section>
  );
}
