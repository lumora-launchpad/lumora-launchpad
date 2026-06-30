"use client";

import { useDisplayCampaigns } from "@/lib/campaignDisplay";
import { useCreators } from "@/lib/creatorStats";
import { CampaignCard } from "@/components/dashboard/CampaignCard";
import { CreatorCard } from "@/components/dashboard/CreatorCard";
import { Icon, type IconName } from "@/components/dashboard/icons";

function Header({ icon, title, accent, subtitle }: { icon: IconName; title: string; accent: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div>
        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
          {title} <span className="gradient-text">{accent}</span>
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const { all } = useDisplayCampaigns();
  const creators = useCreators();
  const now = Math.floor(Date.now() / 1000);

  const ageHours = (createdAt: number) => Math.max((now - createdAt) / 3600, 1);
  const speed = (c: { currentEth: number; createdAt: number }) =>
    c.currentEth / ageHours(c.createdAt);

  const topCampaigns = [...all].sort(
    (a, b) => b.progress * (b.supporters ?? 1) - a.progress * (a.supporters ?? 1),
  );
  const mostSupporters = [...all].sort((a, b) => (b.supporters ?? 0) - (a.supporters ?? 0));
  const fastestFunded = [...all].sort((a, b) => speed(b) - speed(a));
  const highestRaised = [...all].sort((a, b) => b.currentEth - a.currentEth);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Leaderboards
        </h1>
        <p className="mt-1 text-slate-500">
          The creators and campaigns leading on Lumora.
        </p>
      </div>

      <div className="space-y-12">
        {/* Top Creators */}
        <section id="creators" className="scroll-mt-24">
          <Header
            icon="trophy"
            title="Top"
            accent="Creators"
            subtitle="Ranked by successful campaigns, then total raised."
          />
          {creators.length > 0 && (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {creators.slice(0, 9).map((c, i) => (
                <CreatorCard key={c.address} c={c} rank={i + 1} />
              ))}
            </div>
          )}
        </section>

        {/* Top Campaigns */}
        <section>
          <Header
            icon="fire"
            title="Top"
            accent="Campaigns"
            subtitle="The campaigns with the most demand."
          />
          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {topCampaigns.slice(0, 6).map((c) => (
              <CampaignCard key={c.key} c={c} />
            ))}
          </div>
        </section>

        {/* Most Supporters */}
        <section>
          <Header
            icon="users"
            title="Most"
            accent="Supporters"
            subtitle="The most backed campaigns on the platform."
          />
          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {mostSupporters.slice(0, 6).map((c) => (
              <CampaignCard key={c.key} c={c} />
            ))}
          </div>
        </section>

        {/* Fastest Funded */}
        <section>
          <Header
            icon="bolt"
            title="Fastest"
            accent="Funded"
            subtitle="Campaigns raising the most ETH per hour."
          />
          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {fastestFunded.slice(0, 6).map((c) => (
              <CampaignCard key={c.key} c={c} />
            ))}
          </div>
        </section>

        {/* Highest Raised */}
        <section>
          <Header
            icon="target"
            title="Highest"
            accent="Raised"
            subtitle="The campaigns that have raised the most ETH."
          />
          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {highestRaised.slice(0, 6).map((c) => (
              <CampaignCard key={c.key} c={c} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
