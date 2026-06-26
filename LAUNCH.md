# Launch plan

Where Lumora stands and what to do next. The product is feature complete on the
Base Sepolia testnet (live at https://lumora.men). What is left is not more
features, it is going live safely and getting users.

## What is already built

- Bonding curve, 1 percent trading fee, market cap graduation, liquidity that
  locks on graduation (LP burned).
- Two launch modes that differ economically: instant (creator earns 35 percent
  of fees) and demand gated campaign (creator earns 60 percent).
- Anti-snipe window, creator initial buy, graduation fee.
- Discovery (explore dashboard, sorts, filters, King of the hill, ticker,
  watchlist), token pages with chart / trades / comments / holders / info,
  campaigns with commit / claim / refund, portfolio, creator profiles.
- Off-chain metadata, comments, and image upload, with rate-limited APIs.
- Self-hosted behind Caddy with automatic SSL, public repo, docs.

## Part 1 — before mainnet (do not skip)

1. **Contract audit.** The contracts hold real funds on mainnet. Get a
   professional audit, or at minimum a serious independent review. Focus areas:
   fee transfers via low-level call (reentrancy is guarded, verify), the
   graduation and router path, anti-snipe accounting, campaign refund and claim
   math, and `initialBuy`.
2. **Real router and production params.** `DeployTestnet` uses a mock router and
   low targets. For mainnet deploy with `Deploy.s.sol` against the real Base
   Uniswap v2 router `0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24`, and restore
   production values (graduation market cap, anti-snipe window, fees).
3. **Fresh keys and treasury.** Use a brand new deployer key and set
   `devTreasury` to a secure wallet. Never reuse the test keys that were pasted
   in chat, treat them as compromised.
4. **Web env for mainnet.** Set `NEXT_PUBLIC_CHAIN_ID=8453`, the mainnet factory
   and campaign-factory addresses, `NEXT_PUBLIC_START_BLOCK`, and a real
   WalletConnect id.
5. **Storage and auth hardening.** Metadata, comments, and uploads live on a
   single VPS filesystem. Back up `web/.data/`. If you expect traffic, move to a
   database plus object storage, and add wallet-signature auth so only a token's
   creator can edit its metadata (today any caller can, rate limited).
6. **Ops.** Back up `.data/`, monitor the VPS and the `lumora-web` and `caddy`
   services, and keep `scripts/deploy.sh` as the update path.

## Part 2 — getting users (the real bottleneck)

Most launchpads die from no traffic, not bad tech. This is now a distribution
job.

1. **Positioning.** Lead with the differentiator: a fair, bright launchpad on
   Base where demand gated campaigns kill zombie coins and creators earn up to
   60 percent of fees.
2. **Channels.** X is wired (share button and OG cards) — make an account and
   post every launch. Add a Telegram group. Be present in Base communities.
   Farcaster is the strongest Base channel if you reconsider it later.
3. **Solve cold start.** Before any public push, seed 5 to 10 real tokens and a
   couple of campaigns with people you know, so the site is not empty. King of
   the hill and the live ticker keep it looking alive.
4. **Recruit first creators.** Get 3 to 5 creators to run campaigns. The
   60 percent creator share is the pitch. Their audiences become your first
   traders.
5. **Make sharing a habit.** Every launch and milestone gets posted with its OG
   card. Repeat.
6. **Iterate on real feedback,** not on more features.

## Part 3 — honest cautions

- Distribution beats features from here. Do not keep adding features hoping users
  appear.
- Do not deploy to mainnet without an audit. Real money plus unaudited code is
  rug and exploit risk that lands on you.
- The test wallet keys exposed in chat are burner only.
