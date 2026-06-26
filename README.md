# Lumora Launchpad

A token launchpad on Base with a fair bonding curve and a bright interface.
Create a token that trades instantly on a price curve, or run a demand gated
campaign so a token only launches once real backers commit. Liquidity locks on
graduation. Live at https://lumora.men (Base Sepolia testnet).

## Features

- Constant product bonding curve with virtual reserves. Buy and sell against the
  curve, price rises and falls automatically.
- 1 percent trading fee split 65 to the developer treasury, 35 to the token
  creator. Sent on every trade.
- Graduation by market cap: at a fully diluted market cap target the token
  migrates all raised ETH plus remaining supply to a Uniswap pool and burns the
  LP, locking liquidity forever. A configurable graduation fee goes to the dev.
- Anti-snipe window: per wallet buys are capped for the first few blocks so bots
  cannot grab the curve at launch.
- Creator initial buy: a creator can buy their own allocation atomically at
  creation, exempt from the anti-snipe cap.
- Launch campaigns: backers commit ETH toward a target. On reaching it the token
  launches and backers claim pro rata. If it falls short by the deadline, every
  backer refunds in full. A commit fee goes to the dev on a successful launch.

## Structure

```
lumora-launchpad/
  contracts/        Foundry smart contracts (Solidity)
    src/
      LaunchpadToken.sol      ERC20 plus bonding curve, fees, anti-snipe, graduation
      LaunchpadFactory.sol    Token factory and registry
      LaunchCampaign.sol      Demand gated launch: commit, claim, refund
      CampaignFactory.sol     Campaign factory and registry
      interfaces/IUniswapV2.sol
    test/                     Launchpad.t.sol, Campaign.t.sol
    script/                   Deploy.s.sol, DeployTestnet.s.sol
  web/              Next.js frontend (App Router, Tailwind, wagmi, RainbowKit)
    app/            Landing, explore, create, campaigns, portfolio, token and
                    campaign detail, faq / support / terms / privacy, api routes
    components/     Navbar, Footer, token and campaign UI, charts, toasts
    lib/            wagmi config, ABIs, contract addresses, hooks
  scripts/deploy.sh   Pull, build, and restart the self-hosted web app
```

## How the fee works

Every buy and sell pays a 1 percent fee, split inside the contract: 65 percent
to the developer treasury (you), 35 percent to the token creator. The developer
also takes a graduation fee on the raised ETH when a token graduates, and a
commit fee on a campaign that launches. Set `devTreasury` in `LaunchpadFactory`
to your wallet before deploying.

## Running the smart contracts

You need Foundry (`curl -L https://foundry.paradigm.xyz | bash` then `foundryup`).

```
cd contracts
make install
make build
make test
```

Deploy to Base Sepolia for testing. The full guide is in `contracts/DEPLOY.md`.
Quick path for a testnet playground:

```
cp .env.example .env        # fill in PRIVATE_KEY and DEV_TREASURY
make install
make test
make deploy-testnet         # mock router, a low market cap target, plus a CampaignFactory
```

`make deploy-testnet` prints the `LaunchpadFactory` and `CampaignFactory`
addresses. Add both to the web app.

## Running the web app

```
cd web
cp .env.example .env.local   # fill in the factory addresses and a WalletConnect id
npm install
npm run dev
```

Open http://localhost:3000. To publish, see `web/DEPLOY_VERCEL.md` (Vercel) or
use `scripts/deploy.sh` for a self-hosted server behind a reverse proxy.

## Important notes

This is a solid starting point, not a mainnet ready release. Before using real
funds, get a review and audit, switch to the real Uniswap v2 router on Base
mainnet, retune the curve parameters (`virtualEthReserve`, `graduationMarketCap`)
and the anti-snipe window, and consider extra protections.

## Suggested next steps

- Farcaster integration (Frame or bot) so tokens can be launched and traded from
  the Base social feed, the main distribution channel on Base
- A mainnet deployment after an audit
- Advanced discovery filters (sort by buys, age, market cap change)
