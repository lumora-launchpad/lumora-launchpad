# Mainnet deploy checklist

Step by step checklist for the production deploy of Lumora to Base mainnet
(chain 8453) and pointing the web app at it. Run this only once, after an audit.

This uses `Deploy.s.sol`, which deploys both factories with the launchpad
production defaults (graduation at 20 ETH fully diluted market cap, anti snipe
window, fees), wires the campaign factory, and sets the campaign minimum target
to 0.6 ETH.

## 0. Hard gates, do not skip

- [ ] A professional audit, or at minimum a serious independent review, is done
      and findings are resolved. The contracts hold real funds on mainnet.
- [ ] The security fixes are merged (createTokenFor restriction, fee pay or
      accrue, graduation sweep) and `forge test` passes (20 tests).
- [ ] A brand new deployer key is created. Never reuse the testnet keys that
      were pasted in chat, they are compromised.
- [ ] `DEV_TREASURY` is a secure wallet you control (a hardware wallet or
      multisig is recommended), not the deployer.
- [ ] A real WalletConnect project id is ready for the web app.

## 1. Fund the deployer

The deployer needs real ETH on Base mainnet for gas. Bridge ETH to Base, or
withdraw ETH from an exchange directly to Base. Around 0.05 ETH is plenty.

- [ ] Deployer funded on Base mainnet.

## 2. Configure contracts/.env

```
cd contracts
```

Set in `.env` (gitignored, never commit):

- [ ] `BASE_RPC_URL` a Base mainnet RPC, for example https://mainnet.base.org
- [ ] `PRIVATE_KEY` the new deployer key, prefixed with 0x
- [ ] `DEV_TREASURY` the secure treasury address
- [ ] `UNISWAP_V2_ROUTER` the Base mainnet Uniswap v2 router
      `0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24`
- [ ] `BASESCAN_API_KEY` for source verification

## 3. Deploy

```
make deploy-mainnet
```

This runs `forge script Deploy.s.sol:Deploy --rpc-url base --broadcast --verify`.
Record from the output:

- [ ] `LaunchpadFactory` address
- [ ] `CampaignFactory` address

Get the start block (earliest block of the deploy run, a safe lower bound for
event scans):

```
python3 -c "import json; d=json.load(open('broadcast/Deploy.s.sol/8453/run-latest.json')); print(min(int(r['blockNumber'],16) for r in d['receipts']))"
```

- [ ] `START_BLOCK` value

## 4. Verify

On chain checks with `cast`:

```
cast call <LAUNCHPAD_FACTORY> "campaignFactory()(address)" --rpc-url base
cast call <LAUNCHPAD_FACTORY> "owner()(address)" --rpc-url base
cast call <LAUNCHPAD_FACTORY> "graduationMarketCap()(uint256)" --rpc-url base
cast call <CAMPAIGN_FACTORY> "minTarget()(uint256)" --rpc-url base
```

- [ ] `campaignFactory()` returns the new CampaignFactory address.
- [ ] `owner()` is the deployer.
- [ ] `graduationMarketCap()` is 20 ETH (20000000000000000000).
- [ ] `minTarget()` is 0.6 ETH (600000000000000000).
- [ ] Both contracts are verified on Basescan (the deploy used `--verify`; if it
      failed, verify manually with `forge verify-contract`).

## 5. Update web env

Edit `web/.env.local` on the VPS (untracked, stays across deploys):

- [ ] `NEXT_PUBLIC_CHAIN_ID=8453`
- [ ] `NEXT_PUBLIC_FACTORY_ADDRESS` = new LaunchpadFactory
- [ ] `NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS` = new CampaignFactory
- [ ] `NEXT_PUBLIC_START_BLOCK` = start block from step 3
- [ ] `NEXT_PUBLIC_WALLETCONNECT_ID` = the real project id
- [ ] `NEXT_PUBLIC_EXPLORER_URL=https://basescan.org`
- [ ] `NEXT_PUBLIC_CONTRACTS_VERIFIED=true`
- [ ] `NEXT_PUBLIC_SITE_URL=https://lumora.men`

## 6. Ship the web app

```
/root/lumora-launchpad/scripts/deploy.sh
```

- [ ] Deploy script reports HTTP 200.
- [ ] The contracts page shows the mainnet addresses with the verified badge.

## 7. After launch

- [ ] Smoke test with a small real amount: create a token, buy and sell, create
      a campaign and commit, confirm graduation and that the LP is burned.
- [ ] Solve cold start: seed a handful of real tokens and a couple of campaigns
      so the site is not empty.
- [ ] Update the deployment notes and the contracts reference with the mainnet
      addresses and start block.
- [ ] Monitor the VPS and the `lumora-web` and `caddy` services, and keep
      backups of `web/.data/` running.

## Notes

- Per token parameters are fixed at deployment, so a token that is live cannot be
  reconfigured. Owner controls only affect future tokens and campaigns.
- There is no upgrade or pause. A serious bug means redeploying fresh factories
  and repointing the web app, which is why the audit gate is not optional.
- New factory addresses mean testnet tokens and campaigns will not appear. That
  is expected.
