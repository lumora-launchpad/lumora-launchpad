// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {LaunchpadFactory} from "../src/LaunchpadFactory.sol";

contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address devTreasury = vm.envAddress("DEV_TREASURY");
        address router = vm.envAddress("UNISWAP_V2_ROUTER");

        vm.startBroadcast(pk);
        LaunchpadFactory factory = new LaunchpadFactory(devTreasury, router);
        vm.stopBroadcast();

        console2.log("LaunchpadFactory deployed at", address(factory));
        console2.log("Dev treasury", devTreasury);
        console2.log("Router", router);
    }
}
