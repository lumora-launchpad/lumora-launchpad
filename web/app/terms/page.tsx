import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms | Lumora",
  description: "Terms of use for Lumora.",
};

const SECTIONS: { h: string; p: string }[] = [
  {
    h: "1. Acceptance",
    p: "By accessing Lumora you agree to these terms. If you do not agree, do not use the platform.",
  },
  {
    h: "2. Nature of the service",
    p: "Lumora is a non custodial interface to smart contracts on Base. You interact with the contracts directly from your own wallet. Lumora does not hold your funds and cannot reverse, refund, or recover transactions once they are confirmed on chain.",
  },
  {
    h: "3. No financial advice",
    p: "Nothing on Lumora is investment, financial, legal, or tax advice. Tokens launched here are highly speculative and can lose all of their value. You are solely responsible for your decisions.",
  },
  {
    h: "4. Risk",
    p: "Smart contracts may contain bugs. The platform is provided as is, without warranties of any kind. The contracts are not audited and are currently running on a testnet. Use at your own risk.",
  },
  {
    h: "5. Compliance",
    p: "You are responsible for ensuring your use of Lumora is legal in your jurisdiction. Do not use the platform for any unlawful purpose.",
  },
  {
    h: "6. Changes",
    p: "These terms may be updated. Continued use after a change means you accept the updated terms.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-4xl font-black tracking-tight">Terms of use</h1>
      <p className="mt-3 text-slate-500">Last updated 2026.</p>
      <div className="mt-10 space-y-6">
        {SECTIONS.map((s) => (
          <section key={s.h}>
            <h2 className="text-lg font-bold text-slate-800">{s.h}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
