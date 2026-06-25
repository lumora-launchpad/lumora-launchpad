// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {LaunchpadFactory} from "../src/LaunchpadFactory.sol";
import {LaunchpadToken} from "../src/LaunchpadToken.sol";

contract MockUniFactory {
    function getPair(address, address) external pure returns (address) {
        return address(0xBEEF);
    }
}

contract MockRouter {
    address public factoryAddr;

    constructor() {
        factoryAddr = address(new MockUniFactory());
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

contract LaunchpadTest is Test {
    LaunchpadFactory factory;
    address dev = address(0xD3V);
    address creator = address(0xC0FFEE);
    address buyer = address(0xB0B);

    function setUp() public {
        MockRouter router = new MockRouter();
        factory = new LaunchpadFactory(dev, address(router));
        vm.deal(buyer, 100 ether);
    }

    function _newToken() internal returns (LaunchpadToken) {
        vm.prank(creator);
        address t = factory.createToken("Lumora", "LUM");
        return LaunchpadToken(payable(t));
    }

    function test_CreateRegistersToken() public {
        _newToken();
        assertEq(factory.tokensCount(), 1);
        assertEq(factory.creatorTokensCount(creator), 1);
    }

    function test_BuySplitsFee() public {
        LaunchpadToken token = _newToken();

        vm.prank(buyer);
        token.buy{value: 1 ether}(0);

        assertGt(token.balanceOf(buyer), 0);
        // Fee is 1 percent of 1 ether = 0.01 ether. Dev takes 65 percent.
        assertEq(dev.balance, 0.0065 ether);
        assertEq(creator.balance, 0.0035 ether);
    }

    function test_BuyThenSell() public {
        LaunchpadToken token = _newToken();

        vm.startPrank(buyer);
        token.buy{value: 1 ether}(0);
        uint256 bal = token.balanceOf(buyer);
        token.sell(bal, 0);
        vm.stopPrank();

        assertEq(token.balanceOf(buyer), 0);
        assertGt(buyer.balance, 98 ether); // got most of the ETH back minus fees
    }

    function test_Graduation() public {
        LaunchpadToken token = _newToken();

        vm.prank(buyer);
        token.buy{value: 5 ether}(0); // crosses the 3 ether graduation target

        assertTrue(token.graduated());
        assertEq(token.graduationProgressBps(), 10_000);

        vm.expectRevert("graduated");
        vm.prank(buyer);
        token.buy{value: 1 ether}(0);
    }
}
