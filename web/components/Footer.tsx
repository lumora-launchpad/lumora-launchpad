import Link from "next/link";
import { GITHUB, X_URL } from "@/lib/deployments";

const COLUMNS: { title: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Explore", href: "/explore" },
      { label: "Launch", href: "/launch" },
      { label: "Portfolio", href: "/portfolio" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Docs", href: "/docs" },
      { label: "Contracts", href: "/contracts" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "GitHub",
    links: [
      { label: "Repository", href: GITHUB.repo, external: true },
      { label: "Smart contracts", href: GITHUB.contracts, external: true },
      { label: "Frontend", href: GITHUB.frontend, external: true },
      { label: "Issue tracker", href: GITHUB.issues, external: true },
      { label: "Release notes", href: GITHUB.releases, external: true },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help center", href: "/support" },
      { label: "Contact", href: "/support#contact" },
      { label: "Status", href: "/support#status" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

// Add real handles here when the accounts exist. The GitHub link points to the
// repository, which must be public for visitors to open it.
const SOCIAL: { label: string; href: string }[] = [
  { label: "X", href: X_URL },
  { label: "GitHub", href: GITHUB.repo },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/60 bg-white/50 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-3 lg:grid-cols-7">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-gradient text-sm font-black text-white shadow-glow">
                L
              </span>
              <span className="text-lg font-extrabold tracking-tight">Lumora</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              Launch tokens on Base with a fair, bright bonding curve. Demand
              gated campaigns, anti snipe, and liquidity that locks on
              graduation.
            </p>
            <div className="mt-4 flex gap-2">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-base-blue hover:text-base-blue"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {col.title}
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-600 transition hover:text-base-blue"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        className="text-slate-600 transition hover:text-base-blue"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-5 border-t border-slate-100 pt-6 text-xs sm:grid-cols-3 lg:grid-cols-5">
          <div>
            <p className="font-semibold uppercase tracking-wide text-slate-400">Network</p>
            <p className="mt-1 font-bold text-slate-700">Base</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide text-slate-400">Protocol</p>
            <p className="mt-1 font-bold text-slate-700">Uniswap V2</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide text-slate-400">Version</p>
            <p className="mt-1 font-bold text-slate-700">v1.0</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide text-slate-400">Status</p>
            <p className="mt-1 flex items-center gap-1.5 font-bold text-base-mint">
              <span className="h-2 w-2 rounded-full bg-base-mint" />
              Operational
            </p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide text-slate-400">Open Source</p>
            <a
              href={GITHUB.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block font-bold text-base-blue hover:underline"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-slate-400 sm:flex-row">
          <p>2026 Lumora. Built on Base.</p>
          <p>
            Not financial advice. Trade responsibly. Tokens carry risk of total
            loss.
          </p>
        </div>
      </div>
    </footer>
  );
}
