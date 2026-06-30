# Deploy to Base Sepolia

A guide to running the launchpad end to end on the Base Sepolia testnet.

## 1. Prerequisites

1. Install Foundry.

   ```
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. Set up a dedicated test wallet. Do not use your main wallet.

3. Get Base Sepolia ETH from a faucet, for example the Coinbase Developer
   Platform faucet or Alchemy. Around 0.2 ETH is enough for testing.

4. Get a Basescan API key from basescan.org if you want to verify contracts.

## 2. Configuration

```
cd contracts
cp .env.example .env
```

Fill in `.env`:

- `PRIVATE_KEY` the private key of your test wallet, prefixed with 0x.
- `DEV_TREASURY` the address that receives the 65 percent fee. It can be the
  same as your wallet.
- `BASESCAN_API_KEY` optional, for verification.
- `UNISWAP_V2_ROUTER` only used by the standard Deploy script. For testnet use
  the DeployTestnet script which ships its own mock router.

## 3. Install dependencies and test

```
make install
make test
```

All tests must be green before continuing.

## 4. Deploy

There are two options.

### Option A. Testnet playground with an easy to test graduation

Recommended for your first run. This script deploys a mock router, sets a low
market cap graduation target reachable with faucet ETH, a short anti snipe
window, and a graduation fee, then deploys a `CampaignFactory` for demand gated
launches.

```
make deploy-testnet
```

Note the printed addresses: `LaunchpadFactory`, `CampaignFactory`, and
`MockRouter`.

### Option B. Production style deploy

Uses `UNISWAP_V2_ROUTER` from `.env` and the default 3 ETH graduation target.
Use this if you already have a valid Uniswap v2 router address on Sepolia.

```
make deploy-sepolia
```

## 5. Record the deploy block for the chart

The price chart in the web app reads events starting from a specific block. Get
the factory deploy block number from the forge output, or from the broadcast
file:

```
contracts/broadcast/DeployTestnet.s.sol/84532/run-latest.json
```

Look for the `receipt.blockNumber` field of the factory creation transaction.

## 6. Connect to the web app

In `web/.env.local`:

```
NEXT_PUBLIC_FACTORY_ADDRESS=<LaunchpadFactory address>
NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS=<CampaignFactory address>
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_START_BLOCK=<factory deploy block>
NEXT_PUBLIC_WALLETCONNECT_ID=<id from WalletConnect Cloud>
```

Then:

```
cd ../web
npm install
npm run dev
```

## 7. Test end to end

1. Open http://localhost:3000 and connect your wallet to the Base Sepolia network.
2. Go to the Create token page, enter a name and symbol, then launch.
3. The token appears on the Explore page. Click it to open the trading page.
4. Buy a small amount of ETH, check the balance and watch the chart move.
5. Sell part of it, confirm the ETH returns minus the fee.
6. With Option A, keep buying until the market cap target is reached (about
   0.1 ETH of buys) to trigger graduation. The panel switches to a listed status.
7. On the Campaigns page, start a campaign and commit ETH up to its target to
   see it launch a token and let backers claim.

Quick command line way to create a token:

```
make create-token FACTORY=0xYourFactory NAME=Aurora SYMBOL=AUR
```

## Checking the fee arrives

Confirm the dev treasury balance rises after a few transactions:

```
cast balance <DEV_TREASURY> --rpc-url base_sepolia
```

## Before mainnet

- Do a contract review and audit.
- Switch the router to the correct Uniswap v2 on Base mainnet and restore the
  graduation target to a production value.
- Re test the curve parameters `virtualEthReserve` and `graduationMarketCap`,
  the anti snipe window, and the graduation fee.
