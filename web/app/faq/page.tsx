import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Lumora",
  description: "Common questions about Lumora launchpad on Base.",
};

type QA = { q: string; a: string };
type Group = { title: string; items: QA[] };

const GROUPS: Group[] = [
  {
    title: "General",
    items: [
      {
        q: "What is Lumora?",
        a: "Lumora is a token launchpad on Base. Anyone can create a token that trades instantly on a fair bonding curve. When a token reaches its target, liquidity moves automatically to Uniswap and the LP is burned so it is locked forever.",
      },
      {
        q: "Do I need an account?",
        a: "No. Lumora is non custodial. You connect a wallet and sign transactions yourself. There is no signup, no email, and no identity check.",
      },
      {
        q: "Which network does Lumora run on?",
        a: "Base. The app is currently running on the Base Sepolia testnet. Make sure your wallet is on the correct Base network before you trade.",
      },
      {
        q: "How do I launch a token?",
        a: "Connect your wallet, choose New Launch, then pick Instant Launch or Demand Campaign. Enter the name and ticker, add optional details, confirm the transaction, and your token is created.",
      },
    ],
  },
  {
    title: "Instant Launch",
    items: [
      {
        q: "What is Instant Launch?",
        a: "Instant Launch deploys a token that is tradable from the first second on the bonding curve. Use it when you want the market open immediately.",
      },
      {
        q: "Can I buy my own token at launch?",
        a: "Yes. You can include an initial buy in the same transaction as creation to seed your own allocation. This initial buy is exempt from the anti snipe cap because it is your own.",
      },
      {
        q: "What fee split do instant tokens use?",
        a: "Instant tokens send the larger share of the one percent trading fee to the developer treasury and the rest to the creator.",
      },
    ],
  },
  {
    title: "Demand Campaigns",
    items: [
      {
        q: "What is a Demand Campaign?",
        a: "A demand gated launch. You set an ETH target and a deadline. Backers commit ETH, and the token only launches if the target is reached, which avoids empty launches with no demand.",
      },
      {
        q: "What happens when the target is reached?",
        a: "The token launches automatically. The committed ETH, minus a small commit fee, seeds the curve as one initial buy, and backers can claim tokens pro rata to what they committed.",
      },
      {
        q: "Why do campaign creators earn more?",
        a: "Campaign launched tokens give the creator the larger share of the trading fee, because the creator brought real demand to the launch.",
      },
    ],
  },
  {
    title: "Graduation, liquidity, and LP burn",
    items: [
      {
        q: "What is graduation?",
        a: "When a token reaches its market cap target, curve trading closes, the raised ETH and the remaining tokens become a Uniswap pool, and the LP token is burned so liquidity is locked forever.",
      },
      {
        q: "What does liquidity locking mean?",
        a: "At graduation the ETH and tokens are deposited into the Uniswap pool and stay there permanently. Neither the creator nor Lumora can withdraw them.",
      },
      {
        q: "What is LP burn?",
        a: "Liquidity in Uniswap is represented by an LP token. Lumora sends that LP token to a burn address no one controls, so the locked liquidity can never be pulled out.",
      },
      {
        q: "Can I still trade on the curve after graduation?",
        a: "No. Once a token graduates, curve trading is disabled and the token trades on Uniswap like any other token.",
      },
    ],
  },
  {
    title: "Refunds and creator rewards",
    items: [
      {
        q: "When can I get a refund?",
        a: "Refunds apply only to Demand Campaigns that fail. If a campaign deadline passes without reaching its target, every backer can refund their commitment in full. Trades on the bonding curve are final and cannot be refunded.",
      },
      {
        q: "How are creator rewards paid?",
        a: "Creators earn a share of the one percent fee on every trade of their token while it is on the curve. Rewards are sent to the creator address automatically on each trade. If a payout cannot be delivered, it is held and can be withdrawn later.",
      },
      {
        q: "Do creator rewards continue after graduation?",
        a: "Curve trading fees stop at graduation, since the token then trades on Uniswap. Standard Uniswap pool dynamics apply after that.",
      },
    ],
  },
  {
    title: "Wallets, fees, and transactions",
    items: [
      {
        q: "Which wallets are supported?",
        a: "Most major wallets work through WalletConnect and injected providers, including MetaMask, Rabby, Coinbase Wallet, and WalletConnect compatible mobile wallets.",
      },
      {
        q: "What are the gas fees?",
        a: "You pay Base network gas for each transaction, which is usually very small. Gas is separate from the one percent trading fee and is paid to the network, not to Lumora.",
      },
      {
        q: "Why did my transaction fail?",
        a: "Common reasons are slippage when the price moved before your trade confirmed, not enough ETH for the amount plus gas, hitting the anti snipe cap during the opening window, or trying to trade a token that has already graduated. Check the error, adjust, and try again.",
      },
      {
        q: "I confirmed a transaction but nothing changed. What now?",
        a: "Wait for the transaction to be mined, then refresh. If it was rejected or dropped, no funds move except the gas spent on a reverted transaction. On chain transactions cannot be reversed once confirmed, so always review before signing.",
      },
    ],
  },
  {
    title: "Safety",
    items: [
      {
        q: "Is Lumora safe?",
        a: "Lumora is non custodial and per token parameters are fixed at deployment, so configuration cannot change a live token. That said, the contracts are not yet audited and are running on a testnet. Tokens carry the risk of total loss.",
      },
      {
        q: "How do I avoid scams?",
        a: "Always confirm official contract addresses on the contracts page. Lumora will never ask for your seed phrase or private key, and never publishes addresses through direct messages.",
      },
    ],
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

      <div className="mt-10 space-y-10">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">
              {group.title}
            </h2>
            <div className="mt-4 space-y-4">
              {group.items.map((f) => (
                <div key={f.q} className="card">
                  <h3 className="text-lg font-bold text-slate-800">{f.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
