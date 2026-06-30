import { Icon } from "./icons";

// A curated weekly spotlight. The active theme is set here by an editor; the
// rest are shown as what is coming up. No invented metrics, just editorial.
const ACTIVE = "Builder Week";
const UPCOMING = ["AI Week", "Gaming Week", "Meme Week", "Base Week", "DeFi Week"];

export function WeeklyEvent() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-brand-gradient p-6 text-white shadow-glow">
      <div className="orb right-[-3rem] top-[-3rem] h-40 w-40 bg-white/30 opacity-40" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">
            <Icon name="spark" className="h-4 w-4" />
            This week
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">{ACTIVE}</h2>
          <p className="mt-1 max-w-md text-sm text-white/80">
            A spotlight on builders shipping real products and launching only
            once their community proves the demand.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {UPCOMING.map((w) => (
            <span
              key={w}
              className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur"
            >
              {w}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
