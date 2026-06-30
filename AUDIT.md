# Audit scope

This document gives an auditor (or independent reviewer) everything needed to
review the Lumora contracts before a Base mainnet deployment. The contracts hold
real user funds on mainnet, so this review is a hard gate: do not deploy
`Deploy.s.sol` to mainnet until it is complete.

## Summary

Lumora is a token launchpad. Users create ERC20 tokens that trade against a
built-in constant product bonding curve. When a token reaches a fully diluted
market cap target it graduates: the contract migrates the curve's ETH and its
remaining tokens into a Uniswap v2 pool and burns the LP receipt to lock the
liquidity. Every trade pays a 1 percent fee split between a developer treasury
and the token creator. A second flow, launch campaigns, lets backers commit ETH
toward a target and, once met, deploys and seeds a token they claim pro rata.

- Language: Solidity 0.8.24, built with Foundry, `via_ir = true`.
- Dependencies: OpenZeppelin v5.6.1 (`ERC20`, `ReentrancyGuard`).
- Total in scope: ~665 lines across four contracts.
- Tests: 12 passing (`forge test`). Not a substitute for review.

## Contracts in scope

| File | Lines | Role |
| --- | --- | --- |
| `contracts/src/LaunchpadToken.sol` | 255 | ERC20 plus bonding curve, fees, graduation, anti snipe |
| `contracts/src/LaunchpadFactory.sol` | 160 | Deploys tokens, holds global config, registry, owner admin |
| `contracts/src/LaunchCampaign.sol` | 147 | Demand gated launch: commit, launch, claim, refund |
| `contracts/src/CampaignFactory.sol` | 103 | Deploys campaigns, holds config, registry |
| `contracts/src/interfaces/IUniswapV2.sol` | - | Router and factory interfaces (no logic) |

Out of scope: the Next.js web app, off chain JSON metadata and comment stores,
the deploy scripts beyond confirming they wire the right parameters.

## Trust and roles

- **Factory owner** can call `setConfig` to change every global parameter
  (treasury, router, curve seed, graduation target, anti snipe, fees, fee
  splits, creation fee) for future tokens. It cannot touch already deployed
  tokens, whose parameters are immutable. Confirm there is no path for the owner
  to drain a live curve or a campaign.
- **Developer treasury** receives the dev share of trade fees, the graduation
  fee, the creation fee, and the campaign commit fee. It is a plain address.
- **Token creator** receives the creator share of trade fees. Set at creation,
  immutable.
- **Users / backers** trade on the curve or commit to campaigns. They should
  never be able to take more than their fair share.

## Invariants to confirm

1. Constant product holds across buy and sell: `ethReserve * tokenReserve` stays
   consistent with `k`, and rounding never lets a user extract more ETH than the
   curve holds. Note `realEthReserve = ethReserve - virtualEthReserve`; the
   virtual seed must never be paid out.
2. A sell can never withdraw more than `realEthReserve()` (guarded at
   `LaunchpadToken.sol:155`).
3. After graduation, all trading is disabled and no ETH or tokens are stranded:
   `_graduate` moves `realEthReserve()` minus the graduation fee plus all
   remaining contract-held tokens into the pool.
4. Fee math: dev plus creator cut always equals the fee, no wei is lost or
   double paid (`_splitFee`).
5. Anti-snipe: during the opening window, cumulative spend per wallet cannot
   exceed `maxBuyPerWallet`; `initialBuy` is the only exempt path and can run at
   most once, only in `launchBlock`.
6. Campaign accounting: sum of all `claim` amounts cannot exceed
   `tokensForBackers`; refunds are only possible when not launched and after the
   deadline; no backer can both claim and refund.

## Focus areas

1. **Reentrancy.** All external ETH moves use low level `call`. `nonReentrant`
   guards `buy`, `sell`, `initialBuy`, `commit`, `claim`, `refund`. Verify state
   is updated before external calls (checks-effects-interactions), especially in
   `_graduate` (state set, then router call) and `_splitFee` (called after
   reserves update). Confirm the creator and treasury being hostile contracts
   cannot grief or reenter via the fee `call`.
2. **Graduation and the router path.** `addLiquidityETH` is called with min
   amounts of 0, so the pool can be created on attacker-chosen terms if it does
   not already exist or can be front run. Assess sandwich and pool-seeding risk
   at the graduation block, and whether a pre-existing manipulated pair can harm
   the migration. LP is burned to `0xdead` to lock liquidity.
3. **Bonding curve rounding.** Integer division in `_buy`, `sell`, `quoteBuy`,
   `quoteSell`. Look for off-by-one that favors the user against the curve, and
   for any input that reverts or returns zero in a harmful way.
4. **Anti-snipe accounting.** `windowSpent` only increments on the guarded path.
   Confirm there is no way to bypass the per-wallet cap (multiple recipients,
   `initialBuy` timing, block boundary at `launchBlock + antiSnipeBlocks`).
5. **Campaign claim and refund math.** Pro rata is
   `tokensForBackers * committed / totalCommitted`. Check rounding dust, the case
   where the last commit overshoots the target (the overshoot is seeded and
   shared, confirm that is intended), and a launch that itself graduates the
   token immediately (a large seed can push the curve past the graduation target
   inside `initialBuy`, so `balanceOf(campaign)` snapshots after that). Confirm
   backers can still claim in that scenario.
6. **`initialBuy` and factory forwarding.** `_create` forwards `msg.value` minus
   creation fee into `initialBuy`, crediting the caller. For campaigns the caller
   is the campaign contract, so bought tokens land there for backers. Verify a
   creator cannot abuse the anti snipe exemption to grab an outsized allocation
   beyond what they pay for.
7. **Owner powers and parameter bounds.** `setConfig` validates fee ceilings and
   non-zero addresses but allows wide ranges. Confirm no setting bricks creation
   or enables value extraction from existing tokens.
8. **Griefing and DoS.** A treasury or creator that reverts on receive would
   block trades (fee `call` requires success). Decide if that is acceptable or
   should be pull-based.

## How to build and test

```
cd contracts
make install   # OpenZeppelin + forge-std
make build     # forge build, requires via_ir
make test      # 12 tests
```

`foundry.toml` enables `via_ir = true` and the optimizer; the token constructor
has enough parameters to hit "stack too deep" without it.

## Known design choices (not bugs)

- Fees pay out per trade via `call`; this is intentional for instant settlement,
  at the cost of the revert-on-receive griefing surface noted above.
- Graduation uses zero slippage bounds on `addLiquidityETH` because the contract
  is the sole liquidity source at that moment; the sandwich surface is the item
  to assess, not the zero itself.
- Test keys that appeared in development chat are burner only and never used for
  mainnet. Mainnet uses a fresh deployer key and a secure treasury.

## After the audit

1. Address findings, re-run tests, re-build.
2. Deploy with `make deploy-mainnet` using the real Base Uniswap v2 router
   `0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24`, a fresh `PRIVATE_KEY`, and a
   secure `DEV_TREASURY`.
3. Set the web env to chain id 8453 with the new factory addresses. See
   `LAUNCH.md` Part 1 for the full pre-mainnet checklist.
