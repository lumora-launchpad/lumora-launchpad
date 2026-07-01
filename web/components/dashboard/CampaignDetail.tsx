import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { ShareButton } from "@/components/ShareButton";
import { BackButton } from "@/components/BackButton";
import { shortAddress } from "@/lib/tokens";
import { riskLabel, RISK_TONE, type DisplayCampaign } from "@/lib/campaignDisplay";
import { RiskNotice } from "./RiskNotice";
import { SaveButton } from "./SaveButton";
import { CampaignCard } from "./CampaignCard";
import { Icon } from "./icons";

export type CampaignDetailData = {
  name: string;
  symbol: string;
  address: string | null;
  creator: string;
  accent: string;
  verified?: boolean;
  imageUrl?: string;
  bannerUrl?: string;
  category?: string;
  description?: string;
  why?: string;
  socials?: { website?: string; x?: string; telegram?: string; discord?: string };
  currentEth: number;
  targetEth: number;
  progress: number;
  supporters?: number;
  views?: number;
  shares?: number;
  deadline: number;
  status: "live" | "ended" | "launched";
  fundingSpeedPerDay?: number;
  sample: boolean;
  watchKey?: string;
};

export type SupporterRow = { backer: string; amount: number };
export type ActivityRow = { backer: string; amount: number; total: number };

const num = (n?: number, d = 0) =>
  n === undefined ? "—" : n.toLocaleString("en-US", { maximumFractionDigits: d });

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/60 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-slate-900">{value}</p>
    </div>
  );
}

const SOCIALS: { key: keyof NonNullable<CampaignDetailData["socials"]>; label: string }[] = [
  { key: "website", label: "Website" },
  { key: "x", label: "X" },
  { key: "telegram", label: "Telegram" },
  { key: "discord", label: "Discord" },
];

export function CampaignDetail({
  c,
  action,
  comments,
  topSupporters = [],
  recentActivity = [],
  related = [],
}: {
  c: CampaignDetailData;
  action: React.ReactNode;
  comments?: React.ReactNode;
  topSupporters?: SupporterRow[];
  recentActivity?: ActivityRow[];
  related?: DisplayCampaign[];
}) {
  const pct = Math.min(Math.round(c.progress), 100);
  const risk = riskLabel(c.progress);
  const statusLabel =
    c.status === "launched" ? "Launched" : c.status === "ended" ? "Did not reach" : "Live";
  const statusTone =
    c.status === "launched"
      ? "bg-base-mint/15 text-base-mint"
      : c.status === "ended"
        ? "bg-base-pink/15 text-base-pink"
        : "bg-base-violet/10 text-base-violet";
  const socials = c.socials ?? {};
  const hasSocials = SOCIALS.some((s) => socials[s.key]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <BackButton label="Back to campaigns" fallback="/explore" />

      {/* Banner + header */}
      <div className="glass-card mt-4 overflow-hidden">
        <div className={`relative h-40 bg-gradient-to-br ${c.accent} sm:h-48`}>
          {(c.bannerUrl || c.imageUrl) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={c.bannerUrl || c.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-80"
            />
          )}
          <div className="absolute inset-0 opacity-30 [background:radial-gradient(70%_80%_at_25%_15%,white,transparent)]" />
          <div className="absolute right-4 top-4 flex gap-2">
            {c.sample && (
              <span className="rounded-full bg-slate-900/40 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                Sample preview
              </span>
            )}
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur">
              {pct}% funded
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="-mt-16 flex flex-wrap items-end gap-4">
            {c.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.imageUrl}
                alt={c.name}
                className="h-20 w-20 rounded-2xl object-cover shadow-glow ring-4 ring-white"
              />
            ) : (
              <span
                className={`grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br ${c.accent} text-2xl font-black text-white shadow-glow ring-4 ring-white`}
              >
                {c.symbol.slice(0, 2)}
              </span>
            )}
            <div className="min-w-0 flex-1 pb-1">
              <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900">
                <span className="truncate">{c.name}</span>
                {c.verified && (
                  <span
                    title="Verified Builder"
                    className="inline-grid h-5 w-5 shrink-0 place-items-center rounded-full bg-base-mint text-white"
                  >
                    <Icon name="check" className="h-3.5 w-3.5" />
                  </span>
                )}
              </h1>
              <p className="text-sm font-semibold text-slate-400">
                ${c.symbol}
                {c.address && <> / {shortAddress(c.address)}</>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {c.watchKey && (
                <SaveButton itemKey={c.watchKey} className="!h-9 !w-9 border border-slate-200 !bg-white/70 !text-slate-500 hover:!text-amber-500" />
              )}
              <ShareButton name={c.name} symbol={c.symbol} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {c.category && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {c.category}
              </span>
            )}
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone}`}>
              {statusLabel}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${RISK_TONE[risk]}`}>
              Risk: {risk}
            </span>
          </div>

          {/* Progress */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm font-medium text-slate-500">
              <span>
                {num(c.currentEth, 3)} / {num(c.targetEth, 2)} ETH backed
              </span>
              <span className="font-bold text-slate-700">{pct}%</span>
            </div>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-gradient transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Overview */}
          {(c.description || c.why) && (
            <section className="glass-card p-6">
              <h2 className="text-lg font-black tracking-tight text-slate-900">Overview</h2>
              {c.description && (
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{c.description}</p>
              )}
              {c.why && (
                <>
                  <h3 className="mt-5 text-sm font-bold text-slate-800">Why this token?</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.why}</p>
                </>
              )}
            </section>
          )}

          {/* Live statistics */}
          <section className="glass-card p-6">
            <h2 className="text-lg font-black tracking-tight text-slate-900">
              Live statistics
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Current Funding" value={`${num(c.currentEth, 3)} ETH`} />
              <Stat label="Target Funding" value={`${num(c.targetEth, 2)} ETH`} />
              <Stat label="Progress" value={`${pct}%`} />
              <Stat label="Supporters" value={num(c.supporters)} />
              <Stat
                label="Remaining Time"
                value={
                  c.status === "live" ? <Countdown deadline={c.deadline} /> : statusLabel
                }
              />
              <Stat
                label="Funding Speed"
                value={
                  c.fundingSpeedPerDay === undefined
                    ? "—"
                    : `${num(c.fundingSpeedPerDay, 3)} ETH/d`
                }
              />
              <Stat label="Views" value={num(c.views)} />
              <Stat label="Shares" value={num(c.shares)} />
            </div>
          </section>

          {/* Creator + socials */}
          <section className="glass-card p-6">
            <h2 className="text-lg font-black tracking-tight text-slate-900">Creator</h2>
            <div className="mt-4 flex items-center gap-3">
              <span
                className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${c.accent} text-xs font-black text-white shadow-glow`}
              >
                {c.creator.slice(2, 4).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800">{shortAddress(c.creator)}</p>
                <Link
                  href={`/creator/${c.creator}`}
                  className="text-xs font-semibold text-base-blue hover:underline"
                >
                  View creator profile
                </Link>
              </div>
            </div>

            {hasSocials && (
              <>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Links
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SOCIALS.map((s) =>
                    socials[s.key] ? (
                      <a
                        key={s.key}
                        href={socials[s.key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-base-blue hover:text-base-blue"
                      >
                        {s.label}
                      </a>
                    ) : null,
                  )}
                </div>
              </>
            )}
          </section>

          {/* Top supporters */}
          {topSupporters.length > 0 && (
            <section className="glass-card p-6">
              <h2 className="text-lg font-black tracking-tight text-slate-900">Top supporters</h2>
              <ul className="mt-4 space-y-2">
                {topSupporters.slice(0, 5).map((s, i) => (
                  <li key={s.backer} className="flex items-center justify-between">
                    <span className="flex items-center gap-2.5">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-xs font-black text-slate-500">
                        {i + 1}
                      </span>
                      <span className="font-mono text-sm font-semibold text-slate-700">
                        {shortAddress(s.backer)}
                      </span>
                    </span>
                    <span className="text-sm font-bold text-slate-800">{num(s.amount, 3)} ETH</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Funding activity */}
          {recentActivity.length > 0 && (
            <section className="glass-card p-6">
              <h2 className="text-lg font-black tracking-tight text-slate-900">Funding activity</h2>
              <ul className="mt-4 space-y-1">
                {recentActivity.slice(0, 8).map((a, i) => (
                  <li key={`${a.backer}-${i}`} className="flex items-center justify-between rounded-xl px-2 py-2 text-sm">
                    <span className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-base-mint" />
                      <span className="font-mono text-slate-600">{shortAddress(a.backer)}</span>
                      <span className="text-slate-400">committed</span>
                    </span>
                    <span className="font-bold text-slate-700">{num(a.amount, 3)} ETH</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Community */}
          {comments && (
            <section className="glass-card p-6">
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                Community
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Questions and comments. The creator can reply here.
              </p>
              <div className="mt-4">{comments}</div>
            </section>
          )}
        </div>

        {/* Right column: action + risk */}
        <div className="space-y-6">
          {action}
          <RiskNotice compact />
        </div>
      </div>

      {/* Related campaigns */}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-black tracking-tight text-slate-900">
            Related <span className="gradient-text">campaigns</span>
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {related.slice(0, 3).map((rc) => (
              <CampaignCard key={rc.key} c={rc} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
