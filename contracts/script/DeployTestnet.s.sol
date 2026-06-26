// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {LaunchpadFactory} from "../src/LaunchpadFactory.sol";

/// @notice Minimal router so the graduation path can run on a testnet where a
///         real Uniswap v2 router may not be deployed. It accepts the liquidity
///         call and holds the ETH. Never use this on mainnet.
contract MockUniFactoryTestnet {
    function getPair(address, address) external pure returns (address) {
        return address(0);
    }
}

contract MockRouterTestnet {
    address public factoryAddr;

    constructor() {
        factoryAddr = address(new MockUniFactoryTestnet());
    }

    function factory() external view returns (address) {
        return factoryAddr;
    }

    function WETH() external pure returns (address) {
        return 0x4200000000000000000000000000000000000006;
    }

    function addLiquidityETH(address, uint256 amountToken, uint256, uint256, address, uint256)
        external
        payable
        returns (uint256, uint256, uint256)
    {
        return (amountToken, msg.value, 0);
    }
}

/// @notice Deploys a mock router and a factory tuned for testnet end to end
///         testing, including a low graduation target reachable with faucet ETH.
contract DeployTestnet is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address devTreasury = vm.envAddress("DEV_TREASURY");

        vm.startBroadcast(pk);
        MockRouterTestnet router = new MockRouterTestnet();
        LaunchpadFactory factory = new LaunchpadFactory(devTreasury, address(router));
        // Low graduation market cap (1.5 ether FDV) reachable with faucet ETH, plus
        // a short anti snipe window so the feature can be exercised on testnet.
        factory.setConfig(
            devTreasury,
            address(router),
            1 ether, // virtualEthReserve
            1.5 ether, // graduationMarketCap
            3, // antiSnipeBlocks
            0.05 ether, // maxBuyPerWallet
            100, // graduationFeeBps (1 percent)
            0 // creationFee
        );
        vm.stopBroadcast();

        console2.log("MockRouter", address(router));
        console2.log("LaunchpadFactory", address(factory));
        console2.log("Dev treasury", devTreasury);
        console2.log("Graduation market cap", "1.5 ether FDV");
        console2.log("Anti snipe", "3 blocks, 0.05 ether per wallet");
    }
}
