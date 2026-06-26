import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy | Lumora",
  description: "Privacy policy for Lumora.",
};

const SECTIONS: { h: string; p: string }[] = [
  {
    h: "What we collect",
    p: "Lumora is a non custodial app. We do not require an account, an email, or personal identity to use it. Your wallet address and your on chain activity are public on the Base blockchain by nature.",
  },
  {
    h: "Off chain data",
    p: "Optional token descriptions, images, and comments you submit are stored off chain so they can be shown in the interface. Do not submit anything you consider private. This content is associated with the token address and your wallet address.",
  },
  {
    h: "Wallet connection",
    p: "Connecting a wallet shares your public address with the app so it can read balances and prepare transactions. It never gives the app the ability to move funds without your signature.",
  },
  {
    h: "Analytics and third parties",
    p: "The app talks to public RPC endpoints and a WalletConnect relay to function. These third parties may see network level information such as IP addresses as part of normal operation.",
  },
  {
    h: "Your control",
    p: "You can stop using the app at any time. On chain data and content already published cannot be deleted because the blockchain is permanent.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-4xl font-black tracking-tight">Privacy policy</h1>
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
