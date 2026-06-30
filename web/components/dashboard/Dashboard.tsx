"use client";

import Link from "next/link";
import { StatCards } from "./StatCards";
import { CampaignSections } from "./CampaignSections";
import { TopCreators } from "./TopCreators";
import { ActivityPanel } from "./ActivityPanel";
import { TrustPanel } from "./TrustPanel";
import { RiskNotice } from "./RiskNotice";
import { HeroVisual } from "@/components/HeroVisual";
import { Icon } from "./icons";

function Hero() {
  return (
    <section className="glass-card relative overflow-hidden p-6 sm:p-9">
      {/* Ambient glow */}
      <div className="orb left-[-6rem] top-[-6rem] h-72 w-72 bg-brand-gradient opacity-30 animate-drift" />
      <div className="orb bottom-[-8rem] right-[-4rem] h-72 w-72 bg-base-pink/40 opacity-20 animate-drift [animation-delay:3s]" />

      <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="pill">
            <span className="h-2 w-2 rounded-full bg-base-violet" />
            Demand based launchpad on Base
          </span>
          <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
            Demand First.
            <br />
            <span className="gradient-text">Launch Second.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base text-slate-500 sm:text-lg">
            Support campaigns with confidence. If a campaign reaches its target,
            the token launches. If it does not, you can withdraw one hundred
            percent of your committed ETH, anytime before it launches.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/explore" className="btn-primary w-full sm:w-auto">
              Explore Campaigns
              <Icon name="arrowRight" className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/campaigns" className="btn-ghost w-full sm:w-auto">
              Launch Campaign
            </Link>
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm animate-float [animation-duration:9s] lg:max-w-none">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

export function Dashboard() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main column */}
        <div className="min-w-0 space-y-8">
          <Hero />
          <StatCards />
          <CampaignSections />
          <TopCreators />
        </div>

        {/* Right rail */}
        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <RiskNotice />
          <ActivityPanel />
          <TrustPanel />
        </aside>
      </div>
    </div>
  );
}
