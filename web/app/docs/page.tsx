import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation | Lumora",
  description:
    "How Lumora works: getting started, demand campaigns, instant launch, tokenomics, the bonding curve, graduation, the refund system, trading fees, anti rug protection, security, and the smart contracts.",
};

const TOC: { id: string; label: string }[] = [
  { id: "getting-started", label: "Getting Started" },
  { id: "demand-campaign", label: "Demand Campaign" },
  { id: "instant-launch", label: "Instant Launch" },
  { id: "tokenomics", label: "Tokenomics" },
  { id: "bonding-curve", label: "Bonding Curve" },
  { id: "graduation", label: "Graduation" },
  { id: "refund-system", label: "Refund System" },
  { id: "trading-fees", label: "Trading Fees" },
  { id: "anti-rug", label: "Anti Rug Protection" },
  { id: "anti-snipe", label: "Anti Snipe Protection" },
  { id: "security", label: "Security" },
  { id: "smart-contracts", label: "Smart Contracts" },
  { id: "faq", label: "Frequently Asked Questions" },
  { id: "risk", label: "Risk Disclaimer" },
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

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2">
      <span className="text-slate-500">{k}</span>
      <span className="font-bold text-slate-800">{v}</span>
    </div>
  );
}

const ANTI_RUG = [
  "No presale",
  "No insider allocation",
  "No hidden mint",
  "No owner mint",
  "No unlimited mint",
  "Immutable total supply",
  "Immutable trading fee",
  "No blacklist function",
  "No freeze function",
  "No trading pause",
  "No liquidity removal",
  "LP burned after graduation",
  "Refund available if a campaign fails",
  "Campaign parameters cannot be modified after creation",
  "Contracts verifiable on the block explorer",
  "Open source smart contracts",
  "Non custodial",
  "Transparent on chain",
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "What happens if a campaign does not reach its target?",
    a: "No token is created, and every supporter can withdraw one hundred percent of their committed ETH after the deadline.",
  },
  {
    q: "Do creators get an allocation of the token supply?",
    a: "No. The entire supply goes to the bonding curve. Creators earn from a share of the trading fee, not from a supply allocation, so there is no creator allocation and no vesting.",
  },
  {
    q: "Who receives the tokens when a campaign succeeds?",
    a: "The committed ETH seeds the curve as a single buy, and supporters claim the resulting tokens pro rata to what they committed.",
  },
  {
    q: "Can the team pull the liquidity after graduation?",
    a: "No. At graduation liquidity is added to Uniswap and the LP token is burned, so the liquidity is locked permanently.",
  },
  {
    q: "Is Lumora custodial?",
    a: "No. You keep your funds in your own wallet and sign every action yourself. Lumora never holds or moves your funds.",
  },
];

export default function DocsPage() {
  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-black tracking-tight">
          Lumora <span className="gradient-text">documentation</span>
        </h1>
        <p className="mt-3 text-slate-500">
          How Lumora works from start to finish, from creating a project to its
          graduation onto Uniswap. This describes the contracts exactly as they
          run today.
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
          <Section id="getting-started" title="Getting Started">
            <p>
              Lumora is a token launchpad on Base. Anyone can create an ERC20 token
              that trades on a fair bonding curve, with no order book and no seed
              liquidity required. As people buy, the price climbs the curve. When a
              token reaches its market cap target it graduates: the raised ETH and
              the remaining tokens move into a Uniswap v2 pool and the liquidity is
              locked forever.
            </p>
            <p>
              There are two ways to launch. A Demand Campaign waits for real backers
              to commit ETH toward a target before the token goes live, and refunds
              everyone in full if the target is missed. An Instant Launch starts
              trading right away. To begin, connect a wallet, make sure it is on the
              Base network, and open the Launch page.
            </p>
          </Section>

          <Section id="demand-campaign" title="Demand Campaign">
            <p>
              A Demand Campaign is a demand gated launch. You set a target amount of
              ETH and a deadline, and backers commit ETH toward the target. Nothing
              launches until enough demand exists, which kills empty launches.
            </p>
            <p>The flow:</p>
            <ol className="ml-5 list-decimal space-y-1.5 marker:font-bold marker:text-slate-400">
              <li>The creator creates a campaign with a target and a deadline.</li>
              <li>Supporters commit ETH, which is locked in the campaign contract.</li>
              <li>
                If the target is reached, the token is created automatically, the
                committed ETH seeds the bonding curve as one buy, and supporters
                claim tokens pro rata to their contribution. Trading starts
                immediately on the curve.
              </li>
              <li>
                If the target is not reached before the deadline, no token is
                created and every supporter can withdraw one hundred percent of
                their committed ETH.
              </li>
            </ol>
            <p>
              Campaign launched tokens send the larger share of the trading fee to
              the creator, because the creator brought real demand. Only campaigns
              created through the official CampaignFactory can launch a token this
              way.
            </p>
          </Section>

          <Section id="instant-launch" title="Instant Launch">
            <p>
              Instant Launch deploys a token that is tradable from the first second.
              You provide a name, a ticker, and optional details such as a
              description, image, category, and links. There is no funding target
              and no waiting period. You can include an initial buy in the same
              transaction to seed your own position, which is exempt from the anti
              snipe cap because it is your own.
            </p>
            <p>
              The full supply goes to the bonding curve. There is no presale and no
              insider allocation. Instant tokens use the standard fee split, where
              the developer treasury takes the larger share of the trading fee. Use
              Instant Launch when you already have an audience and want the market
              open now.
            </p>
          </Section>

          <Section id="tokenomics" title="Tokenomics">
            <p>
              Both launch types use the same token model. The numbers below are the
              same for every token; there is no per project supply carve out.
            </p>
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-5">
              <Fact k="Network" v="Base" />
              <Fact k="Token standard" v="ERC-20" />
              <Fact k="Total supply" v="1,000,000,000" />
              <Fact k="On the bonding curve" v="800,000,000 (80%)" />
              <Fact k="Reserved for Uniswap liquidity" v="Remainder plus raised ETH" />
              <Fact k="Creator supply allocation" v="0%" />
              <Fact k="Presale / insiders / hidden mint" v="0%" />
            </div>
            <p>
              The entire supply is minted to the token contract at creation. Around
              eighty percent is sold on the bonding curve; the remainder, together
              with the raised ETH, seeds the Uniswap pool at graduation. Nothing is
              allocated to the creator, a presale, or insiders.
            </p>
            <p>
              <span className="font-semibold text-slate-700">On vesting.</span>{" "}
              Because there is no creator supply allocation, there is no vesting.
              Creators earn instead from a share of the trading fee, which accrues
              as the token trades and can be withdrawn at any time. A model with a
              creator supply allocation and time locked vesting would require new
              token contracts and a fresh audit; it is a possible future direction,
              not how the current contracts work.
            </p>
          </Section>

          <Section id="bonding-curve" title="Bonding Curve">
            <p>
              Every token trades against a constant product bonding curve with a
              virtual reserve so the starting price is sensible. Buying moves up the
              curve and raises the price; selling moves down the curve and lowers
              it. Early buyers pay less than later buyers. There is no order book and
              no counterparty: every trade settles against the curve.
            </p>
            <p>
              The total supply is fixed. Eight hundred million tokens are tradable
              on the curve, and the rest is reserved to seed the Uniswap pool at
              graduation. You can preview the tokens you will receive for a given
              amount before you confirm a trade.
            </p>
          </Section>

          <Section id="graduation" title="Graduation">
            <p>
              Graduation is the moment a token leaves the curve and becomes a normal
              Uniswap market. It triggers automatically when the token reaches its
              fully diluted market cap target. At that point curve trading closes, a
              small graduation fee on the raised ETH goes to the developer treasury,
              and the remaining ETH and tokens are added to a Uniswap v2 pool.
            </p>
            <p>
              The liquidity stays in the pool permanently. The LP token is sent to a
              burn address that no one controls, so the locked liquidity can never
              be withdrawn by anyone, including the creator or Lumora. This removes
              the most common rug vector, where a team drains the pool after launch.
              After graduation the token trades on Uniswap like any other token, and
              curve trading is disabled.
            </p>
          </Section>

          <Section id="refund-system" title="Refund System">
            <p>
              The refund guarantee is the core of the demand model. While a campaign
              is live, committed ETH is held by the campaign smart contract, not by
              the creator and not by Lumora.
            </p>
            <p>
              If the campaign reaches its target, the token launches and the ETH is
              used to seed the curve. If the deadline passes without reaching the
              target, the token is never created and every supporter can withdraw
              one hundred percent of their committed ETH from the contract. No
              approval from the creator or Lumora is needed; the refund is enforced
              by the contract. Supporters are never forced to commit, and demand
              alone decides whether a token launches.
            </p>
          </Section>

          <Section id="trading-fees" title="Trading Fees">
            <p>
              Every buy and sell on the curve pays a one percent trading fee, split
              between the developer treasury and the token creator. Instant tokens
              send the larger share to the developer treasury. Campaign launched
              tokens send the larger share to the creator, to reward bringing real
              demand. The creator share accrues to the creator and can be withdrawn
              at any time; if a payout cannot be delivered it is held rather than
              blocking trading.
            </p>
            <p>
              At graduation a one percent fee on the raised ETH goes to the
              developer treasury before liquidity is seeded. Demand Campaigns also
              charge a small commit fee on the raised ETH, and only on a successful
              launch, never on a refund.
            </p>
          </Section>

          <Section id="anti-rug" title="Anti Rug Protection">
            <p>
              The guarantees below are enforced by the contracts, not by policy. Per
              token parameters are fixed at deployment and cannot be changed
              afterward.
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {ANTI_RUG.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-base-mint" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="anti-snipe" title="Anti Snipe Protection">
            <p>
              For a short window of blocks right after launch, each wallet has a cap
              on how much ETH it can spend on the curve. This stops a single bot from
              grabbing a large share of the supply in the first moments and dumping
              on everyone else. The creator initial buy at launch is exempt, because
              it is the creator seeding their own position.
            </p>
            <p>
              Anti snipe limits one wallet, not a determined attacker with many
              wallets, so treat it as a fairness measure for the opening rather than
              a guarantee.
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
              the campaign launch path, the fee payouts, and the graduation
              liquidity handling. A full third party audit is still recommended
              before mainnet. Always confirm official contract addresses on the
              contracts page, and report issues through the GitHub issue tracker.
              Lumora will never ask for your seed phrase or private key. Anyone who
              does is trying to steal your funds.
            </p>
          </Section>

          <Section id="smart-contracts" title="Smart Contracts">
            <p>
              Lumora runs on four contracts: the LaunchpadToken (the bonding curve
              token), the LaunchpadFactory (deploys tokens and holds the global
              config and treasury), the CampaignFactory (deploys demand campaigns),
              and the LaunchCampaign (holds committed ETH and handles claims and
              refunds). They are open source and verifiable.
            </p>
            <p>
              See the{" "}
              <Link href="/contracts" className="font-semibold text-base-blue hover:underline">
                contracts page
              </Link>{" "}
              for the live addresses and links to the verified source, and the{" "}
              <a
                href="https://github.com/lumora-launchpad/lumora-launchpad"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-base-blue hover:underline"
              >
                GitHub repository
              </a>{" "}
              for the full source.
            </p>
          </Section>

          <Section id="faq" title="Frequently Asked Questions">
            <div className="space-y-4">
              {FAQ.map((item) => (
                <div key={item.q} className="rounded-2xl border border-slate-200 bg-white/60 p-5">
                  <p className="font-bold text-slate-800">{item.q}</p>
                  <p className="mt-1.5">{item.a}</p>
                </div>
              ))}
            </div>
            <p>
              More questions are answered on the{" "}
              <Link href="/faq" className="font-semibold text-base-blue hover:underline">
                FAQ page
              </Link>
              .
            </p>
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
              irreversible and cannot be refunded or recovered once confirmed, except
              through the campaign refund path described above. You are solely
              responsible for your decisions, for verifying contract addresses, and
              for the security of your own wallet. Never commit more than you can
              afford to lose, and do your own research before trading.
            </p>
          </Section>
        </div>

        <div className="mt-14 rounded-2xl border border-slate-200 bg-white/60 p-6 text-sm text-slate-600">
          <p className="font-bold text-slate-800">Keep going</p>
          <p className="mt-2">
            Review the official{" "}
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
    </div>
  );
}
