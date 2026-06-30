# Redeploy to Base Sepolia

Checklist for redeploying the contracts to Base Sepolia (chain 84532) and
pointing the web app at the new factories. Run this whenever the contracts
change, since each deploy produces new factory addresses.

This uses `DeployTestnet`, which ships a mock router and low graduation and
campaign targets so the full create, trade, graduate, and campaign flow is
reachable with faucet ETH. It also wires `setCampaignFactory`, required since the
M1 fix so campaigns can deploy their tokens.

## 0. Preconditions

- [ ] Working tree on `main` and up to date (the fixes are merged: #54, #55, #57).
- [ ] `forge test` passes (20 tests).
- [ ] `contracts/.env` has `BASE_SEPOLIA_RPC_URL`, `PRIVATE_KEY` (deployer), and
      `DEV_TREASURY`. Never commit this file.
- [ ] Deployer wallet has Base Sepolia ETH for gas. Current deployer
      `0xD8c78E8Db76ED660fB177906ad3937b36237c5a9`. Check:
      ```
      cast balance 0xD8c78E8Db76ED660fB177906ad3937b36237c5a9 --rpc-url base_sepolia --ether
      ```
      If low, bridge Sepolia L1 ETH to Base Sepolia by sending ETH to the
      L1StandardBridge `0xfd0Bf71F60660E2f608ed56e1659C450eB113120`.

## 1. Deploy

```
cd contracts
make deploy-testnet
```

Record from the output logs:

- [ ] `LaunchpadFactory` address
- [ ] `CampaignFactory` address

Get the start block (earliest block of the deploy run, a safe lower bound for
event scans):

```
python3 -c "import json; d=json.load(open('broadcast/DeployTestnet.s.sol/84532/run-latest.json')); print(min(int(r['blockNumber'],16) for r in d['receipts']))"
```

- [ ] `START_BLOCK` value

## 2. Verify on chain wiring

```
# campaignFactory must equal the deployed CampaignFactory (M1 wiring)
cast call <LAUNCHPAD_FACTORY> "campaignFactory()(address)" --rpc-url base_sepolia
# owner is the deployer
cast call <LAUNCHPAD_FACTORY> "owner()(address)" --rpc-url base_sepolia
```

- [ ] `campaignFactory()` returns the new CampaignFactory address.

## 3. Update web env

Edit `web/.env.local` on the VPS (untracked, stays across deploys). Keep
`NEXT_PUBLIC_CHAIN_ID=84532` and `NEXT_PUBLIC_WALLETCONNECT_ID` as they are; only
these three change:

- [ ] `NEXT_PUBLIC_FACTORY_ADDRESS` = new LaunchpadFactory
- [ ] `NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS` = new CampaignFactory
- [ ] `NEXT_PUBLIC_START_BLOCK` = start block from step 1

## 4. Ship the web app

```
/root/lumora-launchpad/scripts/deploy.sh
```

- [ ] Deploy script reports HTTP 200 health check.

## 5. Smoke test on lumora.men

- [ ] Connect a wallet on Base Sepolia.
- [ ] Create an instant token, confirm it appears in Explore.
- [ ] Buy and sell on the curve.
- [ ] Create a campaign, commit to it, confirm it launches at target and tokens
      are claimable.
- [ ] Confirm a plain wallet cannot call `createTokenFor` directly (M1): it
      should revert with `not a campaign`.

## Notes

- New factory addresses mean tokens and campaigns from the previous deployment
  are not indexed by the new factory and will not appear in the app. Off-chain
  metadata in `web/.data` keyed by old token addresses becomes orphaned. This is
  expected on a testnet redeploy.
- Update `lib/lumora-deployment` notes (current factory addresses, START_BLOCK)
  after a successful redeploy.
- Mainnet is different: use `make deploy-sepolia` style with `Deploy.s.sol` and
  the real Uniswap v2 router, and only after a professional audit.
