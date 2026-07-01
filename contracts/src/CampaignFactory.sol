// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {LaunchCampaign} from "./LaunchCampaign.sol";

interface ILaunchpadRegistry {
    function registerCampaign(address campaign) external;
}

/// @title CampaignFactory
/// @notice Deploys demand gated launch campaigns and keeps a registry the
///         frontend reads. Holds the launchpad factory address that campaigns
///         use to deploy their token, plus global limits and the commit fee.
contract CampaignFactory {
    address public owner;
    address public launchpadFactory;
    address public devTreasury;

    uint256 public minTarget; // smallest allowed ETH target
    uint256 public maxDuration; // longest allowed campaign window
    uint16 public commitFeeBps; // fee on raised ETH at a successful launch

    address[] public allCampaigns;
    mapping(address => address[]) public campaignsByCreator;

    event CampaignCreated(
        address indexed campaign,
        address indexed creator,
        string name,
        string symbol,
        uint256 targetEth,
        uint256 fundingOpensAt,
        uint256 deadline
    );
    event ConfigUpdated();
    event OwnershipTransferred(address indexed from, address indexed to);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(address launchpadFactory_, address devTreasury_) {
        require(launchpadFactory_ != address(0) && devTreasury_ != address(0), "zero address");
        owner = msg.sender;
        launchpadFactory = launchpadFactory_;
        devTreasury = devTreasury_;
        minTarget = 0.001 ether;
        maxDuration = 7 days;
        commitFeeBps = 200; // 2 percent
    }

    function createCampaign(
        string calldata name,
        string calldata symbol,
        uint256 targetEth,
        uint256 duration,
        uint256 fundingOpensAt
    ) external returns (address) {
        require(targetEth >= minTarget, "target too low");
        require(duration > 0 && duration <= maxDuration, "bad duration");
        // Campaigns may be scheduled to open later, bounded so a creator cannot
        // park a campaign that never opens. Zero means open immediately.
        require(fundingOpensAt <= block.timestamp + 60 days, "opens too far");

        LaunchCampaign campaign = new LaunchCampaign(
            launchpadFactory, devTreasury, msg.sender, name, symbol, targetEth, duration, fundingOpensAt, commitFeeBps
        );

        // Authorize the campaign to deploy its token through the launchpad
        // factory. This requires the launchpad factory to trust this contract as
        // its campaignFactory (set via setCampaignFactory after deployment).
        ILaunchpadRegistry(launchpadFactory).registerCampaign(address(campaign));

        allCampaigns.push(address(campaign));
        campaignsByCreator[msg.sender].push(address(campaign));

        emit CampaignCreated(
            address(campaign), msg.sender, name, symbol, targetEth, campaign.fundingOpensAt(), campaign.deadline()
        );
        return address(campaign);
    }

    function campaignsCount() external view returns (uint256) {
        return allCampaigns.length;
    }

    /// @notice Paginated registry read for the frontend. Returns newest last.
    function getCampaigns(uint256 start, uint256 limit) external view returns (address[] memory page) {
        uint256 n = allCampaigns.length;
        if (start >= n) return new address[](0);
        uint256 end = start + limit;
        if (end > n) end = n;
        page = new address[](end - start);
        for (uint256 i = start; i < end; i++) {
            page[i - start] = allCampaigns[i];
        }
    }

    function setConfig(
        address launchpadFactory_,
        address devTreasury_,
        uint256 minTarget_,
        uint256 maxDuration_,
        uint16 commitFeeBps_
    ) external onlyOwner {
        require(launchpadFactory_ != address(0) && devTreasury_ != address(0), "zero address");
        require(commitFeeBps_ <= 1000, "fee too high");
        launchpadFactory = launchpadFactory_;
        devTreasury = devTreasury_;
        minTarget = minTarget_;
        maxDuration = maxDuration_;
        commitFeeBps = commitFeeBps_;
        emit ConfigUpdated();
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
