import Link from "next/link";
import { LiveTokenGrid } from "@/components/LiveTokenGrid";
import { NewTokenTicker } from "@/components/NewTokenTicker";
import { ExploreCampaigns } from "@/components/ExploreCampaigns";
import { LiveActivity } from "@/components/LiveActivity";

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <NewTokenTicker />

      <div className="mt-8">
        <LiveActivity />
      </div>

      <div className="mt-10">
        <ExploreCampaigns />
      </div>

      <section id="explore" className="mt-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Explore <span className="gradient-text">tokens</span>
            </h1>
            <p className="mt-1 text-slate-500">
              Every token launched by the community, live on the curve.
            </p>
          </div>
          <Link
            href="/create"
            className="hidden text-sm font-bold text-base-blue hover:underline sm:block"
          >
            Launch yours
          </Link>
        </div>

        <LiveTokenGrid />
      </section>
    </div>
  );
}
