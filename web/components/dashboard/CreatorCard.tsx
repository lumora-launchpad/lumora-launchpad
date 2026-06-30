import Link from "next/link";
import { type CreatorProfile } from "@/lib/creatorStats";
import { shortAddress } from "@/lib/tokens";
import { Icon } from "./icons";

function VerifiedTick() {
  return (
    <span
      title="Verified Builder"
      className="inline-grid h-4 w-4 place-items-center rounded-full bg-base-mint text-white"
    >
      <Icon name="check" className="h-3 w-3" />
    </span>
  );
}

export function Badges({ badges, max = 3 }: { badges: CreatorProfile["badges"]; max?: number }) {
  if (badges.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.slice(0, max).map((b) => (
        <span key={b.id} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${b.tone}`}>
          {b.label}
        </span>
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-sm font-black text-slate-900">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}

export function CreatorCard({ c, rank }: { c: CreatorProfile; rank?: number }) {
  return (
    <Link
      href={`/creator/${c.address}`}
      className="glass-card group flex flex-col gap-4 p-5 transition duration-300 hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="flex items-center gap-3">
        {rank !== undefined && (
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-black text-slate-500">
            {rank}
          </span>
        )}
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${c.accent} text-xs font-black text-white shadow-glow`}
        >
          {c.address.slice(2, 4).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-bold text-slate-800">
              {shortAddress(c.address)}
            </p>
            {c.verified && <VerifiedTick />}
          </div>
          <p className="text-xs text-slate-400">
            {c.successRate}% success rate
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 border-y border-slate-100 py-3">
        <Metric label="Campaigns" value={String(c.total)} />
        <Metric label="Success" value={String(c.successful)} />
        <Metric
          label="Raised"
          value={`${c.totalRaised.toLocaleString("en-US", { maximumFractionDigits: 1 })}`}
        />
        <Metric label="Backers" value={c.totalSupporters.toLocaleString("en-US")} />
      </div>

      <Badges badges={c.badges} />
    </Link>
  );
}
