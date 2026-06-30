import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation | Lumora",
  description:
    "How Lumora works from start to finish: instant launch, demand campaigns, the bonding curve, graduation, liquidity lock, fees, security, and a launch guide.",
};

const TOC: { id: string; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "instant-launch", label: "Instant Launch" },
  { id: "demand-campaigns", label: "Demand Campaigns" },
  { id: "bonding-curve", label: "Bonding Curve" },
  { id: "graduation", label: "Graduation" },
  { id: "liquidity-lock", label: "Liquidity Lock" },
  { id: "lp-burn", label: "LP Burn" },
  { id: "anti-snipe", label: "Anti Snipe Protection" },
  { id: "trading-fees", label: "Trading Fees" },
  { id: "creator-rewards", label: "Creator Rewards" },
  { id: "supported-wallets", label: "Supported Wallets" },
  { id: "launch-guide", label: "Launch a token, step by step" },
  { id: "risk", label: "Risk Disclaimer" },
  { id: "security", label: "Security" },
  { id: "changelog", label: "Changelog" },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
        {children}
      </div>
    </section>
  );
}

const CHANGELOG: { version: string; date: string; items: string[] }[] = [
  {
    version: "Testnet",
    date: "2026",
    items: [
      "Creator signature required to edit token metadata, so only a token creator can change its description and image.",
      "Daily backups of off chain metadata, comments, and uploads.",
      "createTokenFor restricted to registered campaigns, closing the campaign fee split to non campaign callers.",
      "Fee payouts switched to pay or accrue, so a non receiving creator or treasury can no longer block trading.",
      "Graduation now sweeps any refunded liquidity instead of stranding it in the token contract.",
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
      <h1 className="text-4xl font-black tracking-tight">
        Lumora <span className="gradient-text">documentation</span>
      </h1>
      <p className="mt-3 text-slate-500">
        How Lumora works from start to finish, from creating a token to its
        graduation onto Uniswap.
      </p>

      <nav className="mt-8 rounded-2xl border border-slate-200 bg-white/60 p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          On this page
        </p>
        <ul className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
          {TOC.map((t) => (
            <li key={t.id}>
              <a href={`#${t.id}`} className="text-slate-600 transition hover:text-base-blue">
                {t.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-12 space-y-12">
        <Section id="overview" title="Overview">
          <p>
            Lumora is a token launchpad on Base. Anyone can create an ERC20 token
            that trades immediately on a fair bonding curve, with no order book
            and no seed liquidity required. As people buy, the price climbs the
            curve. When the token reaches its market cap target it graduates: the
            raised ETH and the remaining tokens move into a Uniswap v2 pool and
            the liquidity is locked forever.
          </p>
          <p>
            There are two ways to launch. Instant Launch starts trading right
            away. A Demand Campaign waits for real backers to commit ETH toward a
            target before the token goes live, which kills empty launches and
            rewards the creator with a larger share of the trading fees.
          </p>
        </Section>

        <Section id="instant-launch" title="Instant Launch">
          <p>
            Instant Launch deploys a token that is tradable from the first second.
            You provide a name, a ticker, and optional details such as a
            description, image, and links. You can include an initial buy in the
            same transaction to seed your own allocation, which is exempt from the
            anti snipe cap because it is your own.
          </p>
          <p>
            Instant tokens use the standard fee split, where the developer
            treasury takes the larger share of the trading fee. Use Instant Launch
            when you already have an audience and want the market open now.
          </p>
        </Section>

        <Section id="demand-campaigns" title="Demand Campaigns">
          <p>
            A Demand Campaign is a demand gated launch. You set a target amount of
            ETH and a deadline. Backers commit ETH toward the target. Nothing
            launches until enough demand exists.
          </p>
          <p>
            If the target is reached, the token launches automatically. The
            committed ETH, minus a small commit fee, seeds the curve as a single
            initial buy, and every backer can claim tokens pro rata to what they
            committed. If the deadline passes without reaching the target, every
            backer can refund their commitment in full.
          </p>
          <p>
            Campaign launched tokens give the creator a larger share of the
            trading fee, because the creator brought real demand. Only campaigns
            created through the official CampaignFactory can launch a token this
            way.
          </p>
        </Section>

        <Section id="bonding-curve" title="Bonding Curve">
          <p>
            Every token trades against a constant product bonding curve with a
            virtual reserve so the starting price is sensible. Buying moves up the
            curve and raises the price, selling moves down the curve and lowers
            it. Early buyers pay less than later buyers. There is no order book and
            no counterparty: every trade settles against the curve.
          </p>
          <p>
            The total supply is fixed. A portion of the supply is tradable on the
            curve, and the rest is reserved to seed the Uniswap pool at
            graduation. You can preview the tokens you will receive for a given
            amount before you confirm a trade.
          </p>
        </Section>

        <Section id="graduation" title="Graduation">
          <p>
            Graduation is the moment a token leaves the curve and becomes a normal
            Uniswap market. It triggers automatically when the token reaches its
            fully diluted market cap target. At that point curve trading closes,
            a small graduation fee on the raised ETH goes to the developer
            treasury, and the remaining ETH and tokens are added to a Uniswap v2
            pool.
          </p>
          <p>
            After graduation the token trades on Uniswap like any other token.
            Buying and selling on the curve is disabled, since the curve has done
            its job.
          </p>
        </Section>

        <Section id="liquidity-lock" title="Liquidity Lock">
          <p>
            When a token graduates, the raised ETH and the reserved tokens are
            deposited into the Uniswap pool as liquidity. That liquidity stays in
            the pool permanently. Neither the creator nor Lumora can pull it out,
            which removes the most common rug vector where a team drains the pool
            after launch.
          </p>
        </Section>

        <Section id="lp-burn" title="LP Burn">
          <p>
            Liquidity in Uniswap is represented by an LP token. When Lumora seeds
            the pool at graduation, the LP token is sent to a burn address that no
            one controls. Because the LP token is burned, the locked liquidity can
            never be withdrawn by anyone. This is what makes the liquidity lock
            permanent rather than a promise.
          </p>
        </Section>

        <Section id="anti-snipe" title="Anti Snipe Protection">
          <p>
            For a short window of blocks right after launch, each wallet has a cap
            on how much ETH it can spend on the curve. This stops a single bot from
            grabbing a large share of the supply in the first moments and dumping
            on everyone else. The creator initial buy at launch is exempt, because
            it is the creator allocating to themselves.
          </p>
          <p>
            Anti snipe limits one wallet, not a determined attacker with many
            wallets, so treat it as a fairness measure for the opening rather than
            a guarantee.
          </p>
        </Section>

        <Section id="trading-fees" title="Trading Fees">
          <p>
            Every buy and sell on the curve pays a one percent trading fee. The fee
            is split between the developer treasury and the token creator. Instant
            tokens send the larger share to the developer treasury. Campaign
            launched tokens send the larger share to the creator, to reward
            bringing real demand.
          </p>
          <p>
            At graduation a one percent fee on the raised ETH goes to the developer
            treasury before liquidity is seeded. Demand Campaigns also charge a
            small commit fee on the raised ETH, only on a successful launch.
          </p>
        </Section>

        <Section id="creator-rewards" title="Creator Rewards">
          <p>
            Creators earn a share of every trade on their token for as long as it
            trades on the curve. The share is the creator portion of the one
            percent trading fee. Campaign creators earn the larger share. Rewards
            accrue to the creator address and are paid out automatically on each
            trade. If a payout cannot be delivered, it is held and can be withdrawn
            later, so trading is never blocked.
          </p>
        </Section>

        <Section id="supported-wallets" title="Supported Wallets">
          <p>
            Lumora is non custodial. You connect a wallet and sign transactions
            yourself. Lumora never holds your funds and never moves them without
            your signature.
          </p>
          <p>
            Connection is handled through WalletConnect and the standard injected
            providers, so most major wallets work, including MetaMask, Rabby,
            Coinbase Wallet, and any WalletConnect compatible mobile wallet. Make
            sure your wallet is on the correct Base network before you trade.
          </p>
        </Section>

        <Section id="launch-guide" title="Launch a token, step by step">
          <ol className="ml-5 list-decimal space-y-2 marker:font-bold marker:text-slate-400">
            <li>Connect your wallet and switch it to the correct Base network.</li>
            <li>
              Choose New Launch, then pick Instant Launch for immediate trading or
              Demand Campaign to gate the launch on real demand.
            </li>
            <li>
              Enter the token name and ticker, and optionally a description, image,
              and links. The image and description are saved off chain and you sign
              a message to prove you are the creator.
            </li>
            <li>
              For Instant Launch, optionally add an initial buy to seed your own
              allocation. For a Demand Campaign, set the ETH target and the
              deadline.
            </li>
            <li>Confirm the transaction in your wallet and wait for it to land.</li>
            <li>
              For an instant token, it is now live on the curve and visible in
              Explore. For a campaign, share it so backers can commit. It launches
              automatically when the target is met.
            </li>
            <li>
              As the token trades and approaches its market cap target, it
              graduates to Uniswap, liquidity locks, and the LP is burned.
            </li>
          </ol>
        </Section>

        <Section id="risk" title="Risk Disclaimer">
          <p>
            Nothing on Lumora is investment, financial, legal, or tax advice.
            Tokens launched here are highly speculative and can lose all of their
            value. Prices on a bonding curve can move sharply, and there may be
            little or no demand for any given token.
          </p>
          <p>
            Smart contracts can contain bugs. On chain transactions are
            irreversible and cannot be refunded or recovered once confirmed. You
            are solely responsible for your decisions, for verifying contract
            addresses, and for the security of your own wallet. Never commit more
            than you can afford to lose, and do your own research before trading.
          </p>
        </Section>

        <Section id="security" title="Security">
          <p>
            Lumora is non custodial. Your funds stay in your wallet and only move
            when you sign a transaction. Per token parameters such as the router,
            the creator, the treasury, and the fee split are fixed at deployment
            and cannot be changed afterward, so configuration changes cannot
            affect a token that is already live.
          </p>
          <p>
            The contracts went through an internal first pass review that hardened
            the campaign launch path, the fee payouts, and the graduation liquidity
            handling. A full third party audit is still recommended before mainnet,
            and the contracts are currently running on a testnet. Always confirm
            official contract addresses on the contracts page, and report issues
            through the GitHub issue tracker.
          </p>
          <p>
            Lumora will never ask for your seed phrase or private key. Anyone who
            does is trying to steal your funds.
          </p>
        </Section>

        <Section id="changelog" title="Changelog">
          <p>Notable changes, newest first.</p>
          <div className="space-y-5">
            {CHANGELOG.map((entry) => (
              <div key={entry.version} className="rounded-2xl border border-slate-200 bg-white/60 p-5">
                <div className="flex items-center gap-2">
                  <span className="pill !py-1 text-xs">{entry.version}</span>
                  <span className="text-xs text-slate-400">{entry.date}</span>
                </div>
                <ul className="mt-3 ml-5 list-disc space-y-1.5 text-sm text-slate-600">
                  {entry.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="mt-14 rounded-2xl border border-slate-200 bg-white/60 p-6 text-sm text-slate-600">
        <p className="font-bold text-slate-800">Keep going</p>
        <p className="mt-2">
          Read the{" "}
          <Link href="/faq" className="font-semibold text-base-blue hover:underline">
            FAQ
          </Link>
          , review the official{" "}
          <Link href="/contracts" className="font-semibold text-base-blue hover:underline">
            smart contracts
          </Link>
          , or head to{" "}
          <Link href="/explore" className="font-semibold text-base-blue hover:underline">
            Explore
          </Link>{" "}
          to see what is launching now.
        </p>
      </div>
    </div>
  );
}
