import { Icon } from "./icons";

// The core trust message, reused on the home page and campaign pages. It makes
// the refund guarantee the headline: demand decides, and supporters are never
// forced to commit.
export function RiskNotice({ compact = false }: { compact?: boolean }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-base-violet/20 bg-white/70 p-5 shadow-card backdrop-blur">
      <div className="orb right-[-4rem] top-[-4rem] h-40 w-40 bg-brand-gradient opacity-20" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
            <Icon name="shield" className="h-5 w-5" />
          </span>
          <h2 className="text-base font-black tracking-tight text-slate-900">
            Support with confidence
          </h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          If demand reaches the target, the token launches. If demand falls
          short before the deadline, every supporter can withdraw one hundred
          percent of their committed ETH.
        </p>
        {!compact && (
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="rounded-full bg-base-mint/10 px-2.5 py-1 text-base-mint">
              No hidden risk
            </span>
            <span className="rounded-full bg-base-blue/10 px-2.5 py-1 text-base-blue">
              No forced commitment
            </span>
            <span className="rounded-full bg-base-violet/10 px-2.5 py-1 text-base-violet">
              Demand decides
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
