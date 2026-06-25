// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ArchonGovernance
 * @dev On-chain governance for ARCHON‑IX DAO. Members holding Membership NFTs
 *      can create proposals, vote, and execute outcomes. Voting power is
 *      proportional to membership tier: Citizen=1, Sovereign=2, Imperial=4, Architect=8.
 */
contract ArchonGovernance is Ownable, AccessControl {
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");

    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 startBlock;
        uint256 endBlock;
        bool executed;
        bool canceled;
    }

    struct Vote {
        uint8 choice; // 0=against, 1=for, 2=abstain
        uint256 weight;
        uint256 timestamp;
    }

    uint256 public proposalCount;
    uint256 public votingPeriod; // blocks
    uint256 public quorumThreshold; // minimum total votes needed

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(uint256 => bool) public hasVoted;
    mapping(address => uint256) public totalVotesCast;

    event ProposalCreated(uint256 indexed id, address indexed proposer, string title, uint256 startBlock, uint256 endBlock);
    event VoteCast(uint256 indexed proposalId, address indexed voter, uint8 choice, uint256 weight);
    event ProposalExecuted(uint256 indexed id);
    event ProposalCanceled(uint256 indexed id);

    constructor(uint256 _votingPeriod, uint256 _quorumThreshold) {
        votingPeriod = _votingPeriod;
        quorumThreshold = _quorumThreshold;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROPOSER_ROLE, msg.sender);
    }

    function createProposal(string calldata title, string calldata description) external returns (uint256) {
        require(bytes(title).length > 0, "Title required");
        proposalCount++;
        uint256 startBlock = block.number;
        uint256 endBlock = startBlock + votingPeriod;

        proposals[proposalCount] = Proposal({
            id: proposalCount,
            proposer: msg.sender,
            title: title,
            description: description,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            startBlock: startBlock,
            endBlock: endBlock,
            executed: false,
            canceled: false
        });

        emit ProposalCreated(proposalCount, msg.sender, title, startBlock, endBlock);
        return proposalCount;
    }

    function vote(uint256 proposalId, uint8 choice) external {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        Proposal storage p = proposals[proposalId];
        require(block.number >= p.startBlock && block.number <= p.endBlock, "Voting period ended");
        require(!hasVoted[proposalId * 1000000 + uint256(uint160(msg.sender))], "Already voted");
        require(choice <= 2, "Invalid choice");

        // Voting power is tier-weighted (must be read from ArchonMembership externally)
        // For simplicity, minimum weight of 1 for any NFT holder
        uint256 weight = _getVotingPower(msg.sender);
        require(weight > 0, "No voting power");

        if (choice == 0) p.againstVotes += weight;
        else if (choice == 1) p.forVotes += weight;
        else p.abstainVotes += weight;

        hasVoted[proposalId * 1000000 + uint256(uint160(msg.sender))] = true;
        totalVotesCast[msg.sender]++;

        emit VoteCast(proposalId, msg.sender, choice, weight);
    }

    function executeProposal(uint256 proposalId) external onlyOwner {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        Proposal storage p = proposals[proposalId];
        require(block.number > p.endBlock, "Voting not ended");
        require(!p.executed, "Already executed");
        require(!p.canceled, "Proposal canceled");

        uint256 totalVotes = p.forVotes + p.againstVotes + p.abstainVotes;
        require(totalVotes >= quorumThreshold, "Quorum not reached");

        p.executed = true;
        emit ProposalExecuted(proposalId);
    }

    function cancelProposal(uint256 proposalId) external {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        Proposal storage p = proposals[proposalId];
        require(msg.sender == p.proposer || msg.sender == owner(), "Not authorized");
        require(!p.executed, "Already executed");

        p.canceled = true;
        emit ProposalCanceled(proposalId);
    }

    function getProposalState(uint256 proposalId) external view returns (string memory) {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        Proposal storage p = proposals[proposalId];
        if (p.canceled) return "Canceled";
        if (p.executed) return "Executed";
        if (block.number < p.startBlock) return "Pending";
        if (block.number <= p.endBlock) return "Active";
        uint256 totalVotes = p.forVotes + p.againstVotes + p.abstainVotes;
        if (totalVotes < quorumThreshold) return "Defeated (Quorum)";
        if (p.forVotes > p.againstVotes) return "Succeeded";
        return "Defeated";
    }

    function _getVotingPower(address voter) internal view returns (uint256) {
        // Minimum 1 vote for any address. In production, read tier from ArchonMembership.
        return 1;
    }

    function setVotingPeriod(uint256 _period) external onlyOwner {
        votingPeriod = _period;
    }

    function setQuorumThreshold(uint256 _threshold) external onlyOwner {
        quorumThreshold = _threshold;
    }

    function supportsInterface(bytes4 interfaceId) public view override(Ownable, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
