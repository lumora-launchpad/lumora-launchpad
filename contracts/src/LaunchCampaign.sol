// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ILaunchpadFactory {
    function createTokenFor(address creator, string calldata name, string calldata symbol)
        external
        payable
        returns (address);
}

interface IERC20Min {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @title LaunchCampaign
/// @notice Demand gated token launch. Backers commit ETH toward a target. When
///         the target is reached the campaign deploys a bonding curve token
///         through the factory, seeds it with the committed ETH as one initial
///         buy, and lets backers claim the resulting tokens pro rata to their
///         contribution. If the deadline passes without reaching the target,
///         backers refund their ETH in full. A small fee on the raised ETH goes
///         to the developer treasury, only on a successful launch.
contract LaunchCampaign is ReentrancyGuard {
    address public immutable factory;
    address public immutable devTreasury;
    address public immutable creator;
    string public name;
    string public symbol;
    uint256 public immutable targetEth;
    uint256 public immutable fundingOpensAt; // commits are rejected before this time
    uint256 public immutable deadline;
    uint16 public immutable commitFeeBps;

    uint256 public totalCommitted;
    mapping(address => uint256) public committed;

    bool public launched;
    address public token;
    uint256 public tokensForBackers; // snapshot held by this contract at launch

    mapping(address => bool) public claimed;
    mapping(address => bool) public refunded;

    event Committed(address indexed backer, uint256 amount, uint256 total);
    event Launched(address indexed token, uint256 ethSeeded, uint256 tokensForBackers);
    event Claimed(address indexed backer, uint256 amount);
    event Refunded(address indexed backer, uint256 amount);

    constructor(
        address factory_,
        address devTreasury_,
        address creator_,
        string memory name_,
        string memory symbol_,
        uint256 targetEth_,
        uint256 duration_,
        uint256 fundingOpensAt_,
        uint16 commitFeeBps_
    ) {
        require(factory_ != address(0) && devTreasury_ != address(0) && creator_ != address(0), "zero");
        require(targetEth_ > 0, "bad target");
        require(duration_ > 0, "bad duration");
        require(commitFeeBps_ <= 1000, "fee too high");
        factory = factory_;
        devTreasury = devTreasury_;
        creator = creator_;
        name = name_;
        symbol = symbol_;
        targetEth = targetEth_;
        // A campaign can be scheduled to open later. Funding is closed until
        // fundingOpensAt, and the deadline is measured from when it opens, so a
        // scheduled campaign always gets its full funding window. A value in the
        // past means funding is open immediately.
        uint256 opensAt = fundingOpensAt_ < block.timestamp ? block.timestamp : fundingOpensAt_;
        fundingOpensAt = opensAt;
        deadline = opensAt + duration_;
        commitFeeBps = commitFeeBps_;
    }

    /// @notice Back this launch with ETH. Triggers the launch once the target is met.
    function commit() external payable nonReentrant {
        require(!launched, "launched");
        require(block.timestamp >= fundingOpensAt, "not open yet");
        require(block.timestamp < deadline, "ended");
        require(msg.value > 0, "no eth");

        committed[msg.sender] += msg.value;
        totalCommitted += msg.value;
        emit Committed(msg.sender, msg.value, totalCommitted);

        if (totalCommitted >= targetEth) _launch();
    }

    function _launch() internal {
        launched = true;

        uint256 fee = (totalCommitted * commitFeeBps) / 10_000;
        uint256 seed = totalCommitted - fee;
        if (fee > 0) {
            (bool f,) = devTreasury.call{value: fee}("");
            require(f, "fee failed");
        }

        // Deploy the token and seed it with one initial buy; the bought tokens
        // arrive here for backers to claim.
        token = ILaunchpadFactory(factory).createTokenFor{value: seed}(creator, name, symbol);
        tokensForBackers = IERC20Min(token).balanceOf(address(this));
        emit Launched(token, seed, tokensForBackers);
    }

    /// @notice Claim your pro rata share of the launched tokens.
    function claim() external nonReentrant {
        require(launched, "not launched");
        require(!claimed[msg.sender], "claimed");
        uint256 c = committed[msg.sender];
        require(c > 0, "nothing");

        claimed[msg.sender] = true;
        uint256 amount = (tokensForBackers * c) / totalCommitted;
        require(IERC20Min(token).transfer(msg.sender, amount), "transfer failed");
        emit Claimed(msg.sender, amount);
    }

    /// @notice Refund your commitment if the campaign failed to reach its target.
    function refund() external nonReentrant {
        require(!launched, "launched");
        require(block.timestamp >= deadline, "not ended");
        require(!refunded[msg.sender], "refunded");
        uint256 c = committed[msg.sender];
        require(c > 0, "nothing");

        refunded[msg.sender] = true;
        (bool ok,) = msg.sender.call{value: c}("");
        require(ok, "refund failed");
        emit Refunded(msg.sender, c);
    }

    // Views for the frontend.

    function progressBps() external view returns (uint256) {
        uint256 p = (totalCommitted * 10_000) / targetEth;
        return p > 10_000 ? 10_000 : p;
    }

    function timeLeft() external view returns (uint256) {
        return block.timestamp >= deadline ? 0 : deadline - block.timestamp;
    }

    /// @notice True while the campaign is scheduled but funding has not opened.
    function scheduled() external view returns (bool) {
        return block.timestamp < fundingOpensAt;
    }

    /// @notice Seconds until funding opens, or 0 once it is open.
    function opensIn() external view returns (uint256) {
        return block.timestamp >= fundingOpensAt ? 0 : fundingOpensAt - block.timestamp;
    }

    function claimable(address backer) external view returns (uint256) {
        if (!launched || claimed[backer] || totalCommitted == 0) return 0;
        return (tokensForBackers * committed[backer]) / totalCommitted;
    }
}
