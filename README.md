# Lumora Launchpad

A token launchpad on Base with a fair bonding curve and a bright interface.
Every token can be traded instantly on its price curve, then liquidity moves
automatically to Uniswap once the target is reached. The 1 percent trading fee
is split 65 percent to the developer and 35 percent to the creator.

## Structure

```
lumora-launchpad/
  contracts/        Foundry smart contracts (Solidity)
    src/
      LaunchpadToken.sol      ERC20 token plus bonding curve and fee split
      LaunchpadFactory.sol    Token factory and registry for the frontend
      interfaces/IUniswapV2.sol
    test/Launchpad.t.sol
    script/Deploy.s.sol
  web/              Next.js frontend (App Router, Tailwind, wagmi, RainbowKit)
    app/            Landing, create token, trading page
    components/     Navbar, Footer, TokenCard
    lib/            wagmi config, ABIs, contract addresses
```

## How the fee works

Every buy and sell on the curve pays a 1 percent fee. That fee is split directly
inside the smart contract:

- 65 percent goes to the developer treasury address (you)
- 35 percent goes to the token creator address

The developer share is set via `devTreasury` in `LaunchpadFactory`. Change this
address to your own wallet before deploying.

## Running the smart contracts

You need Foundry. Install it with `curl -L https://foundry.paradigm.xyz | bash`
then run `foundryup`.

```
cd contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge install foundry-rs/forge-std --no-commit
forge build
forge test
```

Deploy to Base Sepolia for testing. The full end to end guide is in
`contracts/DEPLOY.md`. Quick path for a testnet playground:

```
cp .env.example .env        # fill in PRIVATE_KEY and DEV_TREASURY
make install
make test
make deploy-testnet         # mock router plus a 0.05 ETH graduation target
```

Note the printed `LaunchpadFactory` address. You will add it to the web app
later.

## Running the web app

```
cd web
cp .env.example .env.local   # fill in NEXT_PUBLIC_FACTORY_ADDRESS and WalletConnect id
npm install
npm run dev
```

Open http://localhost:3000

To publish to the internet via Vercel, see `web/DEPLOY_VERCEL.md`.

## Important notes

This contract is a solid starting point, not a mainnet ready release. Before
using it with real funds, do a review and audit, test the curve parameters
(`virtualEthReserve` and `graduationEth`), and consider extra protections such
as anti bot limits early in a launch.

## Suggested next steps

- Connect the landing and token pages to on chain reads (factory registry)
- Store token descriptions and images in off chain storage
- Add a real time price chart from Buy and Sell events
- A per wallet portfolio page
