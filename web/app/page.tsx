import Link from "next/link";
import { HeroVisual } from "@/components/HeroVisual";
import { LandingStats } from "@/components/LandingStats";

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
            One launchpad.
            <br />
            <span className="gradient-text">Two ways to launch.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-slate-500">
            Launch a token instantly, or launch it only when real demand shows
            up. Bright, fair, on Base.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/create" className="btn-primary w-full sm:w-auto">
              Instant Launch
            </Link>
            <Link href="/campaigns" className="btn-ghost w-full sm:w-auto">
              Demand Campaign
            </Link>
          </div>
          <Link
            href="/explore"
            className="mt-4 inline-block text-sm font-semibold text-slate-500 underline-offset-4 hover:text-base-blue hover:underline"
          >
            or explore what is launching
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <HeroVisual />
        </div>
      </section>

      {/* Social proof */}
      <LandingStats />

      {/* The two launch modes */}
      <section className="py-12">
        <h2 className="text-center text-3xl font-black tracking-tight">
          Two ways to <span className="gradient-text">launch</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-500">
          Pick how your token goes live. Both trade on a fair curve and lock
          liquidity on graduation.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Instant */}
          <div className="card border-base-blue/20">
            <div className="flex items-start justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-base-blue to-base-sky text-white shadow-glow">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
                </svg>
              </div>
              <span className="rounded-full bg-base-blue/10 px-3 py-1 text-xs font-bold text-base-blue">
                Instant Launch
              </span>
            </div>
            <h3 className="mt-5 text-xl font-bold">Trade from second one</h3>
            <p className="mt-2 text-sm text-slate-500">
              Enter a name and symbol and your token deploys instantly with a
              fair price curve. Anyone can trade right away. Fast and simple.
            </p>
            <Link
              href="/create"
              className="mt-4 inline-block text-sm font-bold text-base-blue hover:underline"
            >
              Start an instant launch
            </Link>
          </div>
          {/* Campaign */}
          <div className="card border-base-violet/20">
            <div className="flex items-start justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-base-violet to-base-pink text-white shadow-glow">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="4.5" />
                  <circle cx="12" cy="12" r="1" fill="currentColor" />
                </svg>
              </div>
              <span className="rounded-full bg-base-violet/10 px-3 py-1 text-xs font-bold text-base-violet">
                Demand Campaign
              </span>
            </div>
            <h3 className="mt-5 text-xl font-bold">Launch only on real demand</h3>
            <p className="mt-2 text-sm text-slate-500">
              Raise commitments first. The token only launches once backers hit
              the target, then they claim pro rata. Refunds if it falls short.
            </p>
            <Link
              href="/campaigns"
              className="mt-4 inline-block text-sm font-bold text-base-violet hover:underline"
            >
              Start a demand campaign
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

      {/* How it works: the full flow */}
      <section id="how-it-works" className="py-16">
        <h2 className="text-center text-3xl font-black tracking-tight">
          How it <span className="gradient-text">works</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-500">
          From idea to locked liquidity in one simple flow.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {[
            {
              n: "01",
              t: "Choose launch type",
              d: "Pick an instant launch, or a demand campaign that only fires when backers commit.",
            },
            {
              n: "02",
              t: "Launch",
              d: "Your token deploys on a fair price curve, ready to trade on Base.",
            },
            {
              n: "03",
              t: "Trade",
              d: "Anyone can buy and sell on the curve. Every trade pays a 1 percent fee.",
            },
            {
              n: "04",
              t: "Graduate",
              d: "At the target, liquidity moves to Uniswap and the LP is locked forever.",
            },
          ].map((step) => (
            <div key={step.n} className="card">
              <span className="text-sm font-black text-base-blue">{step.n}</span>
              <h3 className="mt-2 text-lg font-bold">{step.t}</h3>
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
              Launch instantly, or let real demand decide. Either way, liquidity
              locks on graduation.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/create"
                className="rounded-2xl bg-white px-7 py-3 font-bold text-base-blue shadow-card transition hover:brightness-95 active:scale-95"
              >
                Instant Launch
              </Link>
              <Link
                href="/campaigns"
                className="rounded-2xl bg-white/15 px-7 py-3 font-bold text-white backdrop-blur transition hover:bg-white/25 active:scale-95"
              >
                Demand Campaign
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
