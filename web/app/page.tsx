import Link from "next/link";
import { LiveTokenGrid } from "@/components/LiveTokenGrid";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-5">
      {/* Hero */}
      <section className="relative py-16 sm:py-24">
        <div className="absolute left-1/2 top-10 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-gradient opacity-20 blur-3xl animate-float" />
        <div className="mx-auto max-w-3xl text-center">
          <span className="pill mx-auto">
            <span className="h-2 w-2 rounded-full bg-base-mint" />
            Live on Base
          </span>
          <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight sm:text-6xl">
            Launch your token
            <br />
            <span className="gradient-text">in seconds</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-500">
            A fair bonding curve, automatic liquidity to Uniswap, and near zero
            creation cost. Bright, fast, transparent.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/create" className="btn-primary w-full sm:w-auto">
              Create a token now
            </Link>
            <a href="#explore" className="btn-ghost w-full sm:w-auto">
              See what is rising
            </a>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4">
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
      </section>

      {/* Explore */}
      <section id="explore" className="py-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight">
              Trending <span className="gradient-text">now</span>
            </h2>
            <p className="mt-1 text-slate-500">
              The latest tokens launched by the community.
            </p>
          </div>
          <Link
            href="/create"
            className="hidden text-sm font-bold text-base-blue hover:underline sm:block"
          >
            Launch yours
          </Link>
        </div>

        <LiveTokenGrid />
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

      {/* Fee model */}
      <section className="pb-20">
        <div className="card overflow-hidden bg-brand-gradient !p-0 text-white">
          <div className="grid gap-8 p-10 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-black">An honest fee model</h2>
              <p className="mt-3 text-white/80">
                No hidden costs. Every trade pays 1 percent, split transparently
                inside the smart contract.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/15 p-6 backdrop-blur">
                <p className="text-4xl font-black">65%</p>
                <p className="mt-1 text-sm text-white/80">Developer</p>
              </div>
              <div className="rounded-2xl bg-white/15 p-6 backdrop-blur">
                <p className="text-4xl font-black">35%</p>
                <p className="mt-1 text-sm text-white/80">Creator</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
