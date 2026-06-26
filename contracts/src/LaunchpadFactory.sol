// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {LaunchpadToken} from "./LaunchpadToken.sol";

/// @title LaunchpadFactory
/// @notice Deploys bonding curve tokens and keeps a registry the frontend reads.
///         Holds the global curve config and the developer treasury address that
///         collects the 65 percent share of every trade fee.
contract LaunchpadFactory {
    address public owner;
    address public devTreasury;
    address public router;
    uint256 public virtualEthReserve;
    uint256 public graduationMarketCap; // FDV target at which tokens graduate
    uint256 public antiSnipeBlocks; // opening window length in blocks; 0 disables
    uint256 public maxBuyPerWallet; // max ETH per wallet during the window
    uint256 public creationFee;

    address[] public allTokens;
    mapping(address => address[]) public tokensByCreator;

    event TokenCreated(address indexed token, address indexed creator, string name, string symbol);
    event ConfigUpdated();
    event OwnershipTransferred(address indexed from, address indexed to);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(address devTreasury_, address router_) {
        require(devTreasury_ != address(0) && router_ != address(0), "zero address");
        owner = msg.sender;
        devTreasury = devTreasury_;
        router = router_;
        virtualEthReserve = 1 ether;
        graduationMarketCap = 20 ether; // roughly the old 3 ether raised target
        antiSnipeBlocks = 5; // about 10 seconds on Base
        maxBuyPerWallet = 0.1 ether;
        creationFee = 0;
    }

    function createToken(string calldata name, string calldata symbol) external payable returns (address) {
        require(msg.value >= creationFee, "creation fee");

        LaunchpadToken token = new LaunchpadToken(
            name,
            symbol,
            msg.sender,
            devTreasury,
            virtualEthReserve,
            graduationMarketCap,
            antiSnipeBlocks,
            maxBuyPerWallet,
            router
        );

        allTokens.push(address(token));
        tokensByCreator[msg.sender].push(address(token));

        if (creationFee > 0) {
            (bool ok,) = devTreasury.call{value: creationFee}("");
            require(ok, "fee transfer failed");
        }
        uint256 extra = msg.value - creationFee;
        if (extra > 0) {
            (bool r,) = msg.sender.call{value: extra}("");
            require(r, "refund failed");
        }

        emit TokenCreated(address(token), msg.sender, name, symbol);
        return address(token);
    }

    function tokensCount() external view returns (uint256) {
        return allTokens.length;
    }

    /// @notice Paginated registry read for the frontend. Returns newest last.
    function getTokens(uint256 start, uint256 limit) external view returns (address[] memory page) {
        uint256 n = allTokens.length;
        if (start >= n) return new address[](0);
        uint256 end = start + limit;
        if (end > n) end = n;
        page = new address[](end - start);
        for (uint256 i = start; i < end; i++) {
            page[i - start] = allTokens[i];
        }
    }

    function creatorTokensCount(address creator) external view returns (uint256) {
        return tokensByCreator[creator].length;
    }

    // Admin controls.

    function setConfig(
        address devTreasury_,
        address router_,
        uint256 virtualEthReserve_,
        uint256 graduationMarketCap_,
        uint256 antiSnipeBlocks_,
        uint256 maxBuyPerWallet_,
        uint256 creationFee_
    ) external onlyOwner {
        require(devTreasury_ != address(0) && router_ != address(0), "zero address");
        require(virtualEthReserve_ > 0, "bad seed");
        devTreasury = devTreasury_;
        router = router_;
        virtualEthReserve = virtualEthReserve_;
        graduationMarketCap = graduationMarketCap_;
        antiSnipeBlocks = antiSnipeBlocks_;
        maxBuyPerWallet = maxBuyPerWallet_;
        creationFee = creationFee_;
        emit ConfigUpdated();
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
