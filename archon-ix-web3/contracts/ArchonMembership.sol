// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ArchonMembership
 * @dev ERC‑721 membership NFT for the ARCHON‑IX community with tier system.
 *      Roles: MINTER can batch-mint; ADMIN can pause/unpause and set tiers.
 *      Tiers: 0 = Citizen, 1 = Sovereign, 2 = Imperial, 3 = Architect.
 */
contract ArchonMembership is ERC721, Ownable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    uint256 public nextTokenId;

    enum Tier { Citizen, Sovereign, Imperial, Architect }

    struct MemberInfo {
        Tier tier;
        uint256 mintedAt;
        bool active;
        string metadataURI;
    }

    mapping(uint256 => MemberInfo) public members;
    mapping(address => uint256[]) public memberTokens;
    mapping(address => bool) public hasMembership;

    uint256 public totalMembers;
    uint256 public paused;

    event MemberMinted(uint256 indexed tokenId, address indexed to, Tier tier, uint256 mintedAt);
    event TierUpdated(uint256 indexed tokenId, Tier newTier);
    event MemberRevoked(uint256 indexed tokenId);
    event MetadataUpdated(uint256 indexed tokenId, string newURI);

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    constructor() ERC721("ARCHON-IX Membership", "ARCHON") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        paused = 1;
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        paused = 0;
    }

    function mint(address to, Tier tier, string calldata metadataURI) external onlyRole(MINTER_ROLE) whenNotPaused returns (uint256) {
        uint256 tokenId = ++nextTokenId;
        _safeMint(to, tokenId);
        members[tokenId] = MemberInfo({
            tier: tier,
            mintedAt: block.timestamp,
            active: true,
            metadataURI: metadataURI
        });
        memberTokens[to].push(tokenId);
        hasMembership[to] = true;
        totalMembers++;
        emit MemberMinted(tokenId, to, tier, block.timestamp);
        return tokenId;
    }

    function batchMint(address[] calldata recipients, Tier[] calldata tiers, string[] calldata uris) external onlyRole(MINTER_ROLE) whenNotPaused returns (uint256[] memory) {
        require(recipients.length == tiers.length && recipients.length == uris.length, "Length mismatch");
        uint256[] memory tokenIds = new uint256[](recipients.length);
        for (uint256 i = 0; i < recipients.length; i++) {
            tokenIds[i] = mint(recipients[i], tiers[i], uris[i]);
        }
        return tokenIds;
    }

    function setTier(uint256 tokenId, Tier newTier) external onlyRole(ADMIN_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        members[tokenId].tier = newTier;
        emit TierUpdated(tokenId, newTier);
    }

    function setMetadataURI(uint256 tokenId, string calldata newURI) external onlyRole(ADMIN_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        members[tokenId].metadataURI = newURI;
        emit MetadataUpdated(tokenId, newURI);
    }

    function revoke(uint256 tokenId) external onlyRole(ADMIN_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        members[tokenId].active = false;
        address holder = ownerOf(tokenId);
        hasMembership[holder] = false;
        emit MemberRevoked(tokenId);
    }

    function isActive(uint256 tokenId) external view returns (bool) {
        return members[tokenId].active;
    }

    function getMemberTier(uint256 tokenId) external view returns (Tier) {
        return members[tokenId].tier;
    }

    function getMemberCount() external view returns (uint256) {
        return totalMembers;
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return members[tokenId].metadataURI;
    }
}
