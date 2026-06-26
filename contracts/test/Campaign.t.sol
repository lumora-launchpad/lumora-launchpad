// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {LaunchpadFactory} from "../src/LaunchpadFactory.sol";
import {CampaignFactory} from "../src/CampaignFactory.sol";
import {LaunchCampaign} from "../src/LaunchCampaign.sol";
import {LaunchpadToken} from "../src/LaunchpadToken.sol";

contract MockUniFactoryC {
    function getPair(address, address) external pure returns (address) {
        return address(0xBEEF);
    }
}

contract MockRouterC {
    address public factoryAddr;

    constructor() {
        factoryAddr = address(new MockUniFactoryC());
    }

    function factory() external view returns (address) {
        return factoryAddr;
    }

    function WETH() external pure returns (address) {
        return address(0x4200000000000000000000000000000000000006);
    }

    function addLiquidityETH(address, uint256 amountToken, uint256, uint256, address, uint256)
        external
        payable
        returns (uint256, uint256, uint256)
    {
        return (amountToken, msg.value, 1);
    }
}

contract CampaignTest is Test {
    LaunchpadFactory launchpad;
    CampaignFactory campaigns;
    address dev = address(0xD37);
    address creator = address(0xC0FFEE);
    address backer1 = address(0xB1);
    address backer2 = address(0xB2);

    function setUp() public {
        MockRouterC router = new MockRouterC();
        launchpad = new LaunchpadFactory(dev, address(router));
        campaigns = new CampaignFactory(address(launchpad), dev);
        vm.deal(backer1, 10 ether);
        vm.deal(backer2, 10 ether);
    }

    function _newCampaign(uint256 target) internal returns (LaunchCampaign) {
        vm.prank(creator);
        address c = campaigns.createCampaign("Lumora", "LUM", target, 1 days);
        return LaunchCampaign(c);
    }

    function test_CreateRegistersCampaign() public {
        _newCampaign(0.5 ether);
        assertEq(campaigns.campaignsCount(), 1);
    }

    function test_SuccessLaunchAndClaim() public {
        LaunchCampaign c = _newCampaign(0.5 ether);

        vm.prank(backer1);
        c.commit{value: 0.3 ether}();
        assertFalse(c.launched());

        uint256 devBefore = dev.balance;
        vm.prank(backer2);
        c.commit{value: 0.3 ether}(); // crosses 0.5 target -> launches

        assertTrue(c.launched());
        // Dev gets at least the 2 percent commit fee on 0.6 ether = 0.012 ether,
        // plus its 65 percent share of the 1 percent trade fee on the seed buy.
        assertGe(dev.balance - devBefore, 0.012 ether);

        LaunchpadToken token = LaunchpadToken(payable(c.token()));
        // token creator is the original creator, not the campaign
        assertEq(token.creator(), creator);

        uint256 pool = c.tokensForBackers();
        assertGt(pool, 0);

        vm.prank(backer1);
        c.claim();
        vm.prank(backer2);
        c.claim();

        // equal commits -> roughly equal allocations, summing to the pool
        assertApproxEqAbs(token.balanceOf(backer1), pool / 2, 1e6);
        assertApproxEqAbs(token.balanceOf(backer2), pool / 2, 1e6);
    }

    function test_FailRefund() public {
        LaunchCampaign c = _newCampaign(1 ether);

        vm.prank(backer1);
        c.commit{value: 0.3 ether}();
        assertFalse(c.launched());

        vm.warp(block.timestamp + 2 days); // past the deadline

        uint256 before = backer1.balance;
        vm.prank(backer1);
        c.refund();
        assertEq(backer1.balance - before, 0.3 ether);

        // cannot refund twice
        vm.prank(backer1);
        vm.expectRevert("refunded");
        c.refund();
    }

    function test_NoCommitAfterDeadline() public {
        LaunchCampaign c = _newCampaign(1 ether);
        vm.warp(block.timestamp + 2 days);
        vm.prank(backer1);
        vm.expectRevert("ended");
        c.commit{value: 0.1 ether}();
    }
}
