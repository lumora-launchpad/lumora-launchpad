-include .env
export

.PHONY: install build test deploy-sepolia deploy-testnet create-token clean

install:
	forge install OpenZeppelin/openzeppelin-contracts --no-commit
	forge install foundry-rs/forge-std --no-commit

build:
	forge build

test:
	forge test -vvv

# Deploy the production style factory. Uses the router in your .env.
deploy-sepolia:
	forge script script/Deploy.s.sol:Deploy \
		--rpc-url base_sepolia --broadcast --verify -vvv

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
