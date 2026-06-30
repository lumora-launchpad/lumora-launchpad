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

// A contract that rejects ETH unless explicitly toggled to accept, used to
// model a creator or treasury that cannot receive fees.
contract RejectEth {
    bool public accept;

    function setAccept(bool a) external {
        accept = a;
    }

    function createOn(LaunchpadFactory factory) external returns (address) {
        return factory.createToken("Lumora", "LUM");
    }

    receive() external payable {
        require(accept, "reject");
    }
}

contract LaunchpadTest is Test {
    LaunchpadFactory factory;
    address dev = address(0xD37);
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
        vm.roll(block.number + 6); // past the anti snipe window

        vm.prank(buyer);
        token.buy{value: 1 ether}(0);

        assertGt(token.balanceOf(buyer), 0);
        // Fee is 1 percent of 1 ether = 0.01 ether. Dev takes 65 percent.
        assertEq(dev.balance, 0.0065 ether);
        assertEq(creator.balance, 0.0035 ether);
    }

    function test_BuyThenSell() public {
        LaunchpadToken token = _newToken();
        vm.roll(block.number + 6); // past the anti snipe window

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
        vm.roll(block.number + 6); // past the anti snipe window

        vm.prank(buyer);
        token.buy{value: 5 ether}(0); // crosses the 20 ether market cap target

        assertTrue(token.graduated());
        assertEq(token.graduationProgressBps(), 10_000);

        vm.expectRevert("graduated");
        vm.prank(buyer);
        token.buy{value: 1 ether}(0);
    }

    function test_AntiSnipe() public {
        LaunchpadToken token = _newToken();
        // Factory defaults: 5 block window, 0.1 ether cap per wallet.
        assertTrue(token.antiSnipeActive());

        // A single buy above the cap reverts inside the window.
        vm.prank(buyer);
        vm.expectRevert("anti snipe cap");
        token.buy{value: 0.2 ether}(0);

        // Buying at the cap is allowed.
        vm.prank(buyer);
        token.buy{value: 0.1 ether}(0);
        assertGt(token.balanceOf(buyer), 0);

        // A further buy that exceeds the cumulative cap reverts.
        vm.prank(buyer);
        vm.expectRevert("anti snipe cap");
        token.buy{value: 0.01 ether}(0);

        // After the window the cap no longer applies.
        vm.roll(block.number + 6);
        assertFalse(token.antiSnipeActive());
        vm.prank(buyer);
        token.buy{value: 1 ether}(0);
    }

    function test_MarketCapGraduationTarget() public {
        LaunchpadToken token = _newToken();
        // Market cap starts above zero (virtual reserve) and below the target.
        assertGt(token.marketCap(), 0);
        assertLt(token.marketCap(), token.graduationMarketCap());
        assertEq(token.graduationProgressBps(), 0);
    }

    function test_CreatorInitialBuy() public {
        vm.deal(creator, 1 ether);
        vm.prank(creator);
        // ETH sent with creation seeds the creator's first buy, even though the
        // anti snipe window is active in this same block.
        address t = factory.createToken{value: 0.05 ether}("Lumora", "LUM");
        LaunchpadToken token = LaunchpadToken(payable(t));

        assertTrue(token.initialBought());
        assertGt(token.balanceOf(creator), 0);
        assertGt(token.marketCap(), token.startMarketCap());
    }

    function test_GraduationFee() public {
        LaunchpadToken token = _newToken();
        vm.roll(block.number + 6);

        vm.prank(buyer);
        token.buy{value: 5 ether}(0); // graduates

        assertTrue(token.graduated());
        // Dev got the 1 percent graduation fee on top of trade fees. Trade fee
        // alone would be about 0.0325 ether, so anything above 0.04 proves the
        // graduation fee was paid.
        assertGt(dev.balance, 0.04 ether);
    }

    // M2: a fee recipient that cannot receive ETH must not be able to block
    // trading. Fees that fail to push are accrued for later withdrawal.

    function test_NormalCreatorPaidDirectly() public {
        LaunchpadToken token = _newToken();
        vm.roll(block.number + 6);

        vm.prank(buyer);
        token.buy{value: 1 ether}(0);

        // A receiving creator is paid immediately, nothing is left owed.
        assertEq(creator.balance, 0.0035 ether);
        assertEq(token.feesOwed(creator), 0);
    }

    function test_TradingSurvivesNonReceivingCreator() public {
        RejectEth bad = new RejectEth(); // rejects ETH by default
        address t = bad.createOn(factory); // creator is the rejecting contract
        LaunchpadToken token = LaunchpadToken(payable(t));
        assertEq(token.creator(), address(bad));
        vm.roll(block.number + 6); // past the anti snipe window

        // The buy succeeds even though the creator cannot receive its fee.
        vm.prank(buyer);
        token.buy{value: 1 ether}(0);
        assertGt(token.balanceOf(buyer), 0);

        // The creator's 35 percent of the 1 percent fee is held, not lost.
        uint256 owed = token.feesOwed(address(bad));
        assertEq(owed, 0.0035 ether);

        // Once the creator can receive, it withdraws the accrued fees.
        bad.setAccept(true);
        uint256 before = address(bad).balance;
        vm.prank(address(bad));
        token.withdrawFees();
        assertEq(address(bad).balance - before, owed);
        assertEq(token.feesOwed(address(bad)), 0);

        // Withdrawing again reverts since nothing is owed.
        vm.prank(address(bad));
        vm.expectRevert("nothing owed");
        token.withdrawFees();
    }
}
