// Presentational product preview shown on the landing page, a stylized snapshot
// of the Lumora interface with sample content. It is illustrative, not live data.

type NavItem = { label: string; icon: React.ReactNode; active?: boolean };

function Icon({ d }: { d: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {d}
    </svg>
  );
}

const NAV: NavItem[] = [
  { label: "Overview", active: true, icon: <Icon d={<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>} /> },
  { label: "Launch", icon: <Icon d={<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />} /> },
  { label: "Explore", icon: <Icon d={<><circle cx="12" cy="12" r="9" /><path d="M15 9l-2 5-4 1 2-5 4-1z" /></>} /> },
  { label: "Portfolio", icon: <Icon d={<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></>} /> },
  { label: "Watchlist", icon: <Icon d={<path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9 6.8 19l1-5.8L3.6 9.1l5.8-.8L12 3z" />} /> },
  { label: "Analytics", icon: <Icon d={<><path d="M4 20V10M10 20V4M16 20v-6M22 20H2" /></>} /> },
];

type Token = {
  name: string;
  ticker: string;
  badge: "Instant" | "Campaign";
  metric: string;
  sub: string;
  progress: number;
  art: string;
};

const TOKENS: Token[] = [
  { name: "Nebula", ticker: "NEBULA", badge: "Instant", metric: "24.6 ETH", sub: "1,250 holders", progress: 78, art: "from-violet-500 via-fuchsia-500 to-indigo-500" },
  { name: "DreamLand", ticker: "DREAM", badge: "Campaign", metric: "15.3 ETH", sub: "532 backers", progress: 51, art: "from-fuchsia-500 via-purple-500 to-pink-500" },
  { name: "Aurora", ticker: "AURORA", badge: "Instant", metric: "52.1 ETH", sub: "2,341 holders", progress: 92, art: "from-indigo-500 via-violet-500 to-purple-600" },
  { name: "BuddyAI", ticker: "BUDDY", badge: "Campaign", metric: "8.7 ETH", sub: "287 backers", progress: 29, art: "from-purple-500 via-violet-500 to-fuchsia-500" },
];

const ACTIVITY: { name: string; what: string; meta: string }[] = [
  { name: "NEBULA", what: "New token launched", meta: "2m ago" },
  { name: "DREAM", what: "New backer", meta: "3m ago" },
  { name: "AURORA", what: "Graduation progress", meta: "92%" },
  { name: "BUDDY", what: "New backer", meta: "7m ago" },
];

function Thumb({ art }: { art: string }) {
  return (
    <div className={`relative h-20 w-full overflow-hidden rounded-xl bg-gradient-to-br ${art}`}>
      <div className="absolute inset-0 [background:radial-gradient(60%_60%_at_30%_25%,rgba(255,255,255,0.55),transparent)]" />
      <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-white/80" />
      <span className="absolute left-6 bottom-4 h-1 w-1 rounded-full bg-white/70" />
    </div>
  );
}

export function DashboardPreview() {
  return (
    <section className="py-6">
      <p className="mb-4 text-center text-xs font-bold uppercase tracking-wide text-slate-400">
        Interface preview
      </p>

      <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/70 p-4 shadow-card backdrop-blur sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[210px_1fr_250px]">
          {/* Sidebar */}
          <aside className="hidden flex-col rounded-2xl border border-slate-200 bg-white/80 p-4 lg:flex">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-gradient text-xs font-black text-white">L</span>
              <span className="text-sm font-extrabold tracking-tight">Lumora</span>
            </div>
            <nav className="mt-5 space-y-1">
              {NAV.map((n) => (
                <div
                  key={n.label}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold ${
                    n.active
                      ? "bg-base-violet/10 text-base-violet"
                      : "text-slate-500"
                  }`}
                >
                  {n.icon}
                  {n.label}
                </div>
              ))}
            </nav>
            <div className="mt-auto pt-5">
              <div className="rounded-2xl border border-base-violet/15 bg-base-violet/5 p-3">
                <p className="text-xs font-bold text-slate-700">Built on Base</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Fast, secure, and creator friendly.
                </p>
              </div>
            </div>
          </aside>

          {/* Trending */}
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-base-pink/15 text-base-pink">
                  <Icon d={<path d="M12 3c1 4-2 5-2 8a4 4 0 008 0c0-2-1-3-1-5 2 1 3 3 3 6a8 8 0 11-16 0c0-5 5-6 8-9z" />} />
                </span>
                <h3 className="text-sm font-bold text-slate-800">Trending Launches</h3>
              </div>
              <span className="text-xs font-semibold text-base-violet">View all</span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {TOKENS.map((t) => (
                <div key={t.ticker} className="rounded-2xl border border-slate-100 bg-white p-3">
                  <div className="relative">
                    <Thumb art={t.art} />
                    <span
                      className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${
                        t.badge === "Instant" ? "bg-base-violet" : "bg-base-pink"
                      }`}
                    >
                      {t.badge}
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-baseline justify-between">
                    <span className="text-sm font-bold text-slate-800">{t.name}</span>
                    <span className="text-[11px] font-semibold text-slate-400">{t.ticker}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-bold text-slate-700">{t.metric}</span>
                    <span>{t.sub}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${t.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity and network */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <h3 className="text-sm font-bold text-slate-800">Live Activity</h3>
              <ul className="mt-3 space-y-3">
                {ACTIVITY.map((a) => (
                  <li key={a.name + a.what} className="flex items-center gap-3">
                    <span className="h-7 w-7 shrink-0 rounded-full bg-brand-gradient" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-slate-800">{a.name}</span>
                      <span className="block truncate text-[11px] text-slate-500">{a.what}</span>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">{a.meta}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs font-semibold text-base-violet">View all activity</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Network</h3>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-base-mint">
                  <span className="h-2 w-2 rounded-full bg-base-mint" />
                  Base
                </span>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Base ETH price</span>
                  <span className="font-bold text-slate-800">3,245.21</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">24h volume</span>
                  <span className="font-bold text-slate-800">1.24M ETH</span>
                </div>
              </div>
              <p className="mt-3 text-xs font-semibold text-base-violet">View on Basescan</p>
            </div>
          </div>
        </div>

        {/* Two ways strip */}
        <div className="mt-4 grid items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 sm:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-base-violet/10 text-base-violet">
              <Icon d={<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />} />
            </span>
            <span>
              <span className="block text-sm font-bold text-slate-800">Instant Launch</span>
              <span className="block text-[11px] text-slate-500">Launch now with a fair bonding curve.</span>
            </span>
          </div>
          <span className="hidden text-xs font-bold text-slate-400 sm:block">or</span>
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-base-pink/10 text-base-pink">
              <Icon d={<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" /></>} />
            </span>
            <span>
              <span className="block text-sm font-bold text-slate-800">Demand Campaign</span>
              <span className="block text-[11px] text-slate-500">Launch when real demand is proven.</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
