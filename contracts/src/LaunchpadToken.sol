// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IUniswapV2Router02, IUniswapV2Factory} from "./interfaces/IUniswapV2.sol";

/// @title LaunchpadToken
/// @notice ERC20 with a built in constant product bonding curve. Tokens trade
///         against the curve until a real ETH target is reached, then the
///         contract migrates all remaining tokens plus the raised ETH into a
///         Uniswap v2 pool and locks the liquidity by burning the LP receipt.
/// @dev    Every buy and sell pays a 1 percent fee, split 65 to the developer
///         treasury and 35 to the token creator. Parameters are starter values
///         and must be reviewed and audited before any mainnet deployment.
contract LaunchpadToken is ERC20, ReentrancyGuard {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 ether;
    uint256 public constant CURVE_SUPPLY = 800_000_000 ether; // tradable on the curve

    // Bonding curve state. ethReserve includes a virtual seed so price starts sane.
    uint256 public immutable virtualEthReserve;
    uint256 public ethReserve;
    uint256 public tokenReserve;
    uint256 public immutable k;

    uint256 public immutable graduationEth; // real ETH needed to graduate

    uint16 public constant FEE_BPS = 100; // 1 percent per trade
    uint16 public constant DEV_SHARE_BPS = 6500; // 65 percent of the fee

    address public immutable creator;
    address public immutable devTreasury;

    bool public graduated;

    IUniswapV2Router02 public immutable router;

    event Buy(address indexed buyer, uint256 ethIn, uint256 tokensOut, uint256 fee);
    event Sell(address indexed seller, uint256 tokensIn, uint256 ethOut, uint256 fee);
    event Graduated(address indexed pair, uint256 ethLiquidity, uint256 tokenLiquidity);

    constructor(
        string memory name_,
        string memory symbol_,
        address creator_,
        address devTreasury_,
        uint256 virtualEthReserve_,
        uint256 graduationEth_,
        address router_
    ) ERC20(name_, symbol_) {
        require(creator_ != address(0) && devTreasury_ != address(0), "zero address");
        require(virtualEthReserve_ > 0, "bad seed");

        creator = creator_;
        devTreasury = devTreasury_;
        virtualEthReserve = virtualEthReserve_;
        graduationEth = graduationEth_;
        router = IUniswapV2Router02(router_);

        _mint(address(this), TOTAL_SUPPLY);

        ethReserve = virtualEthReserve_;
        tokenReserve = CURVE_SUPPLY;
        k = virtualEthReserve_ * CURVE_SUPPLY;
    }

    /// @notice Real ETH held by the curve, excluding the virtual seed.
    function realEthReserve() public view returns (uint256) {
        return ethReserve - virtualEthReserve;
    }

    function buy(uint256 minTokensOut) external payable nonReentrant {
        require(!graduated, "graduated");
        require(msg.value > 0, "no eth");

        uint256 fee = (msg.value * FEE_BPS) / 10_000;
        uint256 netEth = msg.value - fee;

        uint256 newEthReserve = ethReserve + netEth;
        uint256 newTokenReserve = k / newEthReserve;
        uint256 tokensOut = tokenReserve - newTokenReserve;
        require(tokensOut >= minTokensOut, "slippage");

        ethReserve = newEthReserve;
        tokenReserve = newTokenReserve;

        _transfer(address(this), msg.sender, tokensOut);
        _splitFee(fee);

        emit Buy(msg.sender, msg.value, tokensOut, fee);

        if (realEthReserve() >= graduationEth) _graduate();
    }

    function sell(uint256 tokenAmount, uint256 minEthOut) external nonReentrant {
        require(!graduated, "graduated");
        require(tokenAmount > 0, "no tokens");

        uint256 newTokenReserve = tokenReserve + tokenAmount;
        uint256 newEthReserve = k / newTokenReserve;
        uint256 grossEth = ethReserve - newEthReserve;
        require(grossEth <= realEthReserve(), "insufficient liquidity");

        uint256 fee = (grossEth * FEE_BPS) / 10_000;
        uint256 netEth = grossEth - fee;
        require(netEth >= minEthOut, "slippage");

        ethReserve = newEthReserve;
        tokenReserve = newTokenReserve;

        _transfer(msg.sender, address(this), tokenAmount);
        _splitFee(fee);
        (bool ok,) = msg.sender.call{value: netEth}("");
        require(ok, "eth transfer failed");

        emit Sell(msg.sender, tokenAmount, netEth, fee);
    }

    function _splitFee(uint256 fee) internal {
        if (fee == 0) return;
        uint256 devCut = (fee * DEV_SHARE_BPS) / 10_000;
        uint256 creatorCut = fee - devCut;
        if (devCut > 0) {
            (bool a,) = devTreasury.call{value: devCut}("");
            require(a, "dev fee failed");
        }
        if (creatorCut > 0) {
            (bool b,) = creator.call{value: creatorCut}("");
            require(b, "creator fee failed");
        }
    }

    function _graduate() internal {
        graduated = true;
        uint256 ethLiq = realEthReserve();
        uint256 tokenLiq = balanceOf(address(this));

        _approve(address(this), address(router), tokenLiq);
        router.addLiquidityETH{value: ethLiq}(
            address(this),
            tokenLiq,
            0,
            0,
            address(0xdead), // burn LP to lock liquidity forever
            block.timestamp
        );

        address pair = IUniswapV2Factory(router.factory()).getPair(address(this), router.WETH());
        emit Graduated(pair, ethLiq, tokenLiq);
    }

    // Views used by the frontend.

    function quoteBuy(uint256 ethIn) external view returns (uint256 tokensOut) {
        uint256 fee = (ethIn * FEE_BPS) / 10_000;
        uint256 netEth = ethIn - fee;
        uint256 newEthReserve = ethReserve + netEth;
        tokensOut = tokenReserve - (k / newEthReserve);
    }

    function quoteSell(uint256 tokenAmount) external view returns (uint256 ethOut) {
        uint256 newTokenReserve = tokenReserve + tokenAmount;
        uint256 grossEth = ethReserve - (k / newTokenReserve);
        uint256 fee = (grossEth * FEE_BPS) / 10_000;
        ethOut = grossEth - fee;
    }

    /// @notice Marginal price in ETH per token, scaled by 1e18.
    function currentPrice() external view returns (uint256) {
        return (ethReserve * 1e18) / tokenReserve;
    }

    /// @notice Curve progress toward graduation in basis points (0 to 10000).
    function graduationProgressBps() external view returns (uint256) {
        if (graduated) return 10_000;
        uint256 p = (realEthReserve() * 10_000) / graduationEth;
        return p > 10_000 ? 10_000 : p;
    }

    receive() external payable {}
}
