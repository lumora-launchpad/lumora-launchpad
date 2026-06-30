// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {LaunchpadFactory} from "../src/LaunchpadFactory.sol";
import {CampaignFactory} from "../src/CampaignFactory.sol";

/// @notice Production deploy. Uses the real Uniswap v2 router from the
///         environment and the launchpad factory's built-in production defaults
///         (graduation market cap, anti snipe window, fees, fee splits). Sets a
///         credible minimum campaign target so backers cannot start dust
///         campaigns. Deploys both the launchpad and campaign factories. Only
///         run this after an audit.
contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address devTreasury = vm.envAddress("DEV_TREASURY");
        address router = vm.envAddress("UNISWAP_V2_ROUTER");

        vm.startBroadcast(pk);
        LaunchpadFactory factory = new LaunchpadFactory(devTreasury, router);
        CampaignFactory campaignFactory = new CampaignFactory(address(factory), devTreasury);
        // Trust the campaign factory so its campaigns can deploy tokens.
        factory.setCampaignFactory(address(campaignFactory));
        // Minimum campaign target of 0.6 ETH, roughly 1000 USD. Other campaign
        // params keep their defaults: 7 day max duration and 2 percent commit fee.
        campaignFactory.setConfig(address(factory), devTreasury, 0.6 ether, 7 days, 200);
        vm.stopBroadcast();

        console2.log("LaunchpadFactory", address(factory));
        console2.log("CampaignFactory", address(campaignFactory));
        console2.log("Dev treasury", devTreasury);
        console2.log("Router", router);
    }
}
