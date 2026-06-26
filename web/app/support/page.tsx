import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support | Lumora",
  description: "Get help with Lumora.",
};

const GITHUB = "https://github.com/lumora-launchpad/lumora-launchpad";

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-4xl font-black tracking-tight">
        Help <span className="gradient-text">center</span>
      </h1>
      <p className="mt-3 text-slate-500">
        Answers, contact, and platform status in one place.
      </p>

      <div className="mt-10 space-y-6">
        <section className="card">
          <h2 className="text-lg font-bold">Getting started</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            New here? Read the{" "}
            <a href="/faq" className="font-semibold text-base-blue hover:underline">
              FAQ
            </a>{" "}
            for how the bonding curve, fees, graduation, and launch campaigns
            work. To launch a token, connect a wallet on Base and use the Create
            page, or start a demand gated campaign on the Campaigns page.
          </p>
        </section>

        <section id="contact" className="card scroll-mt-24">
          <h2 className="text-lg font-bold">Contact</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Found a bug or have a question? Open an issue on our GitHub. It is
            the fastest way to reach the team and track a fix.
          </p>
          <a
            href={`${GITHUB}/issues/new`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-4 inline-flex"
          >
            Open an issue
          </a>
        </section>

        <section id="status" className="card scroll-mt-24">
          <h2 className="text-lg font-bold">Status</h2>
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-base-mint">
            <span className="h-2.5 w-2.5 rounded-full bg-base-mint" />
            All systems operational
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Lumora is live on the Base Sepolia testnet. The app, the trading
            curve, and launch campaigns are running normally.
          </p>
        </section>
      </div>
    </div>
  );
}
