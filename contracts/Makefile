-include .env
export

.PHONY: install build test deploy-sepolia deploy-mainnet deploy-testnet create-token clean

install:
	forge install OpenZeppelin/openzeppelin-contracts
	forge install foundry-rs/forge-std

build:
	forge build

test:
	forge test -vvv

# Deploy the production style factories. Uses the router in your .env.
deploy-sepolia:
	forge script script/Deploy.s.sol:Deploy \
		--rpc-url base_sepolia --broadcast --verify -vvv

# Production deploy to Base mainnet. Only run after an audit. Set PRIVATE_KEY,
# DEV_TREASURY, and UNISWAP_V2_ROUTER (Base mainnet v2 router) in .env first.
deploy-mainnet:
	forge script script/Deploy.s.sol:Deploy \
		--rpc-url base --broadcast --verify -vvv

# Deploy a testnet playground with a mock router and a 0.05 ether graduation
# target so the full create, trade, and graduate flow can be tested.
deploy-testnet:
	forge script script/DeployTestnet.s.sol:DeployTestnet \
		--rpc-url base_sepolia --broadcast -vvv

# Create a token. Example: make create-token FACTORY=0x.. NAME=Aurora SYMBOL=AUR
create-token:
	cast send $(FACTORY) "createToken(string,string)" "$(NAME)" "$(SYMBOL)" \
		--rpc-url base_sepolia --private-key $(PRIVATE_KEY)

clean:
	forge clean
