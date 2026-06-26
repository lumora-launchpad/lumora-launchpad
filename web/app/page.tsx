import Link from "next/link";
import { HeroVisual } from "@/components/HeroVisual";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-6">
      {/* Hero */}
      <section className="relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2">
        <div className="absolute left-0 top-10 -z-10 h-72 w-72 rounded-full bg-brand-gradient opacity-20 blur-3xl animate-float" />
        <div>
          <span className="pill">
            <span className="h-2 w-2 rounded-full bg-base-mint" />
            Live on Base
          </span>
          <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight sm:text-6xl">
            The bright launchpad
            <br />
            <span className="gradient-text">on Base</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-500">
            Launch a token on a fair bonding curve, or run a demand gated
            campaign so only coins with real backers go live. Liquidity locks on
            graduation. Bright, fast, transparent.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/create" className="btn-primary w-full sm:w-auto">
              Create a token
            </Link>
            <Link href="/explore" className="btn-ghost w-full sm:w-auto">
              Explore tokens
            </Link>
          </div>

          <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {[
              { k: "Trading fee", v: "1%" },
              { k: "Creator share", v: "35%" },
              { k: "Liquidity", v: "Auto" },
            ].map((s) => (
              <div key={s.k} className="card py-5 text-center">
                <p className="text-3xl font-black gradient-text">{s.v}</p>
                <p className="mt-1 text-xs font-medium text-slate-400">{s.k}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <HeroVisual />
        </div>
      </section>

      {/* What you can do */}
      <section className="py-12">
        <h2 className="text-center text-3xl font-black tracking-tight">
          Two ways to <span className="gradient-text">launch</span>
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="card">
            <h3 className="text-xl font-bold">Instant curve launch</h3>
            <p className="mt-2 text-sm text-slate-500">
              Enter a name and symbol and your token deploys instantly with a
              fair price curve. Anyone can trade right away. Optionally buy your
              own allocation at launch, exempt from the anti-snipe cap.
            </p>
            <Link
              href="/create"
              className="mt-4 inline-block text-sm font-bold text-base-blue hover:underline"
            >
              Create a token
            </Link>
          </div>
          <div className="card">
            <h3 className="text-xl font-bold">Demand gated campaign</h3>
            <p className="mt-2 text-sm text-slate-500">
              Raise commitments first. The token only launches once backers hit
              the target, then they claim pro rata. If it falls short, everyone
              refunds. No empty coins.
            </p>
            <Link
              href="/campaigns"
              className="mt-4 inline-block text-sm font-bold text-base-blue hover:underline"
            >
              Start a campaign
            </Link>
          </div>
        </div>
      </section>

      {/* Why Lumora */}
      <section className="py-12">
        <h2 className="text-center text-3xl font-black tracking-tight">
          Why <span className="gradient-text">Lumora</span>
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              t: "Fair launch",
              d: "An anti-snipe window caps per-wallet buys at the start, so bots cannot grab the whole curve before anyone else.",
              icon: (
                <path d="M12 3l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V6l7-3z" />
              ),
            },
            {
              t: "Demand gated",
              d: "Campaigns only launch a token once real backers commit, with full refunds if they fall short. No empty coins.",
              icon: (
                <>
                  <circle cx="9" cy="8" r="3" />
                  <path d="M15 11a3 3 0 100-6" />
                  <path d="M3 20c0-3 3-5 6-5s6 2 6 5" />
                  <path d="M17 15c2 0 4 2 4 5" />
                </>
              ),
            },
            {
              t: "Liquidity locks",
              d: "On graduation, liquidity moves to Uniswap and the LP is burned, so it is locked forever and cannot be pulled.",
              icon: (
                <>
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V7a4 4 0 018 0v4" />
                </>
              ),
            },
          ].map((f) => (
            <div key={f.t} className="card">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {f.icon}
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-bold">{f.t}</h3>
              <p className="mt-2 text-sm text-slate-500">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16">
        <h2 className="text-center text-3xl font-black tracking-tight">
          Three steps <span className="gradient-text">done</span>
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              n: "01",
              t: "Create",
              d: "Enter a token name and symbol. The contract deploys automatically with a fair price curve.",
            },
            {
              n: "02",
              t: "Trade",
              d: "Anyone can buy and sell on the curve. Every trade pays a 1 percent fee.",
            },
            {
              n: "03",
              t: "Graduate",
              d: "When the target is reached, liquidity moves to Uniswap and the LP is locked forever.",
            },
          ].map((step) => (
            <div key={step.n} className="card">
              <span className="text-sm font-black text-base-blue">{step.n}</span>
              <h3 className="mt-2 text-xl font-bold">{step.t}</h3>
              <p className="mt-2 text-sm text-slate-500">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="pb-24">
        <div className="card overflow-hidden bg-brand-gradient text-white">
          <div className="flex flex-col items-center gap-5 px-8 py-14 text-center">
            <h2 className="text-3xl font-black sm:text-4xl">Ready to launch?</h2>
            <p className="max-w-lg text-white/80">
              Create your token in seconds on a fair curve. A 1 percent trading
              fee split 65 developer and 35 creator, and liquidity that locks on
              graduation.
            </p>
            <Link
              href="/create"
              className="rounded-2xl bg-white px-7 py-3 font-bold text-base-blue shadow-card transition hover:brightness-95 active:scale-95"
            >
              Create a token
            </Link>
            <Link
              href="/explore"
              className="text-sm font-semibold text-white/80 underline-offset-4 hover:underline"
            >
              or explore what is launching
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
