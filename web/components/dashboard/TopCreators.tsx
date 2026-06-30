"use client";

import Link from "next/link";
import { useCreators } from "@/lib/creatorStats";
import { CreatorCard } from "./CreatorCard";
import { Icon } from "./icons";

export function TopCreators() {
  const creators = useCreators();
  if (creators.length === 0) return null;

  return (
    <section id="top-creators" className="scroll-mt-24">
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
            <Icon name="trophy" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              Top <span className="gradient-text">Creators</span>
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              The builders with the strongest track record.
            </p>
          </div>
        </div>
        <Link
          href="/leaderboard#creators"
          className="shrink-0 text-sm font-bold text-base-blue hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {creators.slice(0, 3).map((c, i) => (
          <CreatorCard key={c.address} c={c} rank={i + 1} />
        ))}
      </div>
    </section>
  );
}
