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
    uint256 public graduationFeeBps; // cut of raised ETH to dev at graduation
    uint16 public devShareBps; // dev share of trade fee for instant tokens
    uint16 public campaignDevShareBps; // dev share for campaign launched tokens (creator gets more)
    uint256 public creationFee;

    // Only campaigns registered by the trusted CampaignFactory may use
    // createTokenFor, which grants the more generous campaign fee split. Without
    // this gate any caller could claim the campaign split without running a
    // campaign, starving the dev treasury and breaking the fee model.
    address public campaignFactory;
    mapping(address => bool) public isCampaign;

    address[] public allTokens;
    mapping(address => address[]) public tokensByCreator;

    event TokenCreated(address indexed token, address indexed creator, string name, string symbol);
    event ConfigUpdated();
    event OwnershipTransferred(address indexed from, address indexed to);
    event CampaignFactorySet(address indexed campaignFactory);
    event CampaignRegistered(address indexed campaign);

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
        graduationFeeBps = 100; // 1 percent of raised ETH to dev at graduation
        devShareBps = 6500; // instant: dev 65 / creator 35
        campaignDevShareBps = 4000; // campaign: dev 40 / creator 60, rewards backers' creators
        creationFee = 0;
    }

    function createToken(string calldata name, string calldata symbol) external payable returns (address) {
        return _create(msg.sender, name, symbol, devShareBps);
    }

    /// @notice Create a token whose creator is set to `creator_`, while any
    ///         initial buy tokens go to the caller. Restricted to launch
    ///         campaigns registered by the trusted CampaignFactory, which give
    ///         the creator a larger share of the trade fee.
    function createTokenFor(address creator_, string calldata name, string calldata symbol)
        external
        payable
        returns (address)
    {
        require(isCampaign[msg.sender], "not a campaign");
        return _create(creator_, name, symbol, campaignDevShareBps);
    }

    /// @notice Register a campaign as authorized to call createTokenFor. Only
    ///         the trusted CampaignFactory may register, and it does so when it
    ///         deploys each campaign.
    function registerCampaign(address campaign) external {
        require(msg.sender == campaignFactory, "not campaign factory");
        require(campaign != address(0), "zero campaign");
        isCampaign[campaign] = true;
        emit CampaignRegistered(campaign);
    }

    function _create(address creator_, string calldata name, string calldata symbol, uint16 shareBps)
        internal
        returns (address)
    {
        require(creator_ != address(0), "zero creator");
        require(msg.value >= creationFee, "creation fee");

        LaunchpadToken token = new LaunchpadToken(
            name,
            symbol,
            creator_,
            devTreasury,
            virtualEthReserve,
            graduationMarketCap,
            antiSnipeBlocks,
            maxBuyPerWallet,
            graduationFeeBps,
            shareBps,
            router
        );

        allTokens.push(address(token));
        tokensByCreator[creator_].push(address(token));

        if (creationFee > 0) {
            (bool ok,) = devTreasury.call{value: creationFee}("");
            require(ok, "fee transfer failed");
        }
        // Any ETH beyond the creation fee seeds the first buy, credited to the
        // caller (the creator directly, or a campaign that will distribute).
        uint256 extra = msg.value - creationFee;
        if (extra > 0) {
            token.initialBuy{value: extra}(msg.sender, 0);
        }

        emit TokenCreated(address(token), creator_, name, symbol);
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

    /// @notice Set the CampaignFactory trusted to register campaigns. Set this
    ///         to the deployed CampaignFactory after both are deployed.
    function setCampaignFactory(address campaignFactory_) external onlyOwner {
        require(campaignFactory_ != address(0), "zero address");
        campaignFactory = campaignFactory_;
        emit CampaignFactorySet(campaignFactory_);
    }

    function setConfig(
        address devTreasury_,
        address router_,
        uint256 virtualEthReserve_,
        uint256 graduationMarketCap_,
        uint256 antiSnipeBlocks_,
        uint256 maxBuyPerWallet_,
        uint256 graduationFeeBps_,
        uint16 devShareBps_,
        uint16 campaignDevShareBps_,
        uint256 creationFee_
    ) external onlyOwner {
        require(devTreasury_ != address(0) && router_ != address(0), "zero address");
        require(virtualEthReserve_ > 0, "bad seed");
        require(graduationFeeBps_ <= 1000, "fee too high");
        require(devShareBps_ <= 10_000 && campaignDevShareBps_ <= 10_000, "bad share");
        devTreasury = devTreasury_;
        router = router_;
        virtualEthReserve = virtualEthReserve_;
        graduationMarketCap = graduationMarketCap_;
        antiSnipeBlocks = antiSnipeBlocks_;
        maxBuyPerWallet = maxBuyPerWallet_;
        graduationFeeBps = graduationFeeBps_;
        devShareBps = devShareBps_;
        campaignDevShareBps = campaignDevShareBps_;
        creationFee = creationFee_;
        emit ConfigUpdated();
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
