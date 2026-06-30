"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/components/dashboard/icons";

function Mode({
  icon,
  title,
  tag,
  desc,
  points,
  href,
  cta,
  accent,
}: {
  icon: IconName;
  title: string;
  tag: string;
  desc: string;
  points: string[];
  href: string;
  cta: string;
  accent: string;
}) {
  return (
    <div className="glass-card flex flex-col p-6">
      <div className="flex items-start justify-between">
        <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-glow`}>
          <Icon name={icon} className="h-6 w-6" />
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {tag}
        </span>
      </div>
      <h2 className="mt-5 text-xl font-black tracking-tight text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">{desc}</p>
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2">
            <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-base-mint" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <Link href={href} className="btn-primary mt-6 w-full">
        {cta}
      </Link>
    </div>
  );
}

export default function LaunchPage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Launch</h1>
        <p className="mt-1 max-w-2xl text-slate-500">
          Create a new project on Base. Choose a demand campaign that launches
          only when supporters commit, or an instant launch that trades from
          second one. Both mint the full supply to a fair bonding curve.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Mode
          icon="target"
          title="Demand Campaign"
          tag="Launch on proven demand"
          accent="from-base-violet to-base-pink"
          desc="Raise commitments first. The token launches only when backers reach the target. If it falls short, every supporter withdraws one hundred percent of their ETH."
          points={[
            "Supporters commit ETH, locked in the contract",
            "At the target the token launches automatically",
            "Backers claim tokens pro rata to their commitment",
            "If the target is missed, full refunds for everyone",
          ]}
          href="/campaigns"
          cta="Create a campaign"
        />
        <Mode
          icon="bolt"
          title="Instant Launch"
          tag="Trade from second one"
          accent="from-base-blue to-base-sky"
          desc="Deploy a token immediately with the full supply on the bonding curve. No funding target, no waiting period, anyone can trade right away."
          points={[
            "Full supply on the bonding curve, no presale",
            "No creator allocation, no insider allocation",
            "Trading starts immediately after deployment",
            "Liquidity locks on Uniswap at graduation",
          ]}
          href="/create"
          cta="Launch instantly"
        />
      </div>
    </div>
  );
}
