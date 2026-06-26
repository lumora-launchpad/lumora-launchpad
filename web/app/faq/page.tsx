import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Lumora",
  description: "Common questions about Lumora launchpad on Base.",
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is Lumora?",
    a: "Lumora is a token launchpad on Base. Anyone can create a token that trades instantly on a fair bonding curve. Once it reaches its target, liquidity moves automatically to Uniswap and the LP is locked.",
  },
  {
    q: "How does the bonding curve work?",
    a: "Price is set by a constant product formula with virtual reserves. Buying pushes the price up the curve, selling pushes it down. Early buyers pay less, later buyers pay more. There is no order book, every trade is against the curve.",
  },
  {
    q: "What are the fees?",
    a: "Every buy and sell pays a 1 percent trading fee, split 65 percent to the developer and 35 percent to the token creator. When a token graduates, a 1 percent fee on the raised ETH goes to the developer treasury before liquidity is seeded.",
  },
  {
    q: "What is graduation?",
    a: "When a token reaches its market cap target, curve trading closes, all raised ETH plus the remaining tokens become a Uniswap pool, and the LP token is burned so liquidity is locked forever.",
  },
  {
    q: "What is a launch campaign?",
    a: "A demand gated launch. Backers commit ETH toward a target. If the target is reached the token launches automatically and backers claim their share pro rata to what they committed. If the deadline passes short of the target, every backer refunds in full.",
  },
  {
    q: "What is the anti-snipe window?",
    a: "For the first few blocks after launch, each wallet's buy is capped, so a bot cannot grab a large share of the curve at the very start. A creator initial buy at launch is exempt because it is the creator's own allocation.",
  },
  {
    q: "Is it safe?",
    a: "Lumora is currently running on the Base Sepolia testnet and the contracts are not audited. Tokens carry the risk of total loss. Do your own research and never trade more than you can afford to lose.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-4xl font-black tracking-tight">
        Frequently asked <span className="gradient-text">questions</span>
      </h1>
      <p className="mt-3 text-slate-500">
        Everything you need to know about launching and trading on Lumora.
      </p>

      <div className="mt-10 space-y-4">
        {FAQS.map((f) => (
          <div key={f.q} className="card">
            <h2 className="text-lg font-bold text-slate-800">{f.q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
