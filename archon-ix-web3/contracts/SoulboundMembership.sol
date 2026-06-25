// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

/**
 * @title Soulbound Membership Token
 * @dev A non-transferable NFT (soulbound token) representing ARCHON-IX membership.
 *      Uses ERC-721 with enforced non-transferability per EIP-4337 patterns.
 * @notice Minting is restricted to the owner (deployer) for administrative control.
 */
contract SoulboundMembershipToken is ERC721, Ownable {
    uint256 private _nextTokenIdCounter;
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC721("ARCHON-IX Soulbound", "ARCHON-SBT") {}

    // Prevent transfers - this is a soulbound token
    function transferFrom(address, address, uint256) public pure override returns (bool) {
        revert("SBT: soulbound — cannot transfer");
    }

    function safeTransferFrom(address, address, uint256) public pure override returns (bool) {
        revert("SBT: soulbound — cannot transfer");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override returns (bool) {
        revert("SBT: soulbound — cannot transfer");
    }

    // Mint a new soulbound token to the specified recipient
    function mint(address recipient, string memory tokenUri) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenIdCounter;
        _nextTokenIdCounter++;
        _mint(recipient, tokenId);
        _tokenURIs[tokenId] = tokenUri;
        emit SoulboundMinted(tokenId, recipient, tokenUri);
        return tokenId;
    }

    // Burn a token (owner only - emergency revocation)
    function burn(uint256 tokenId) public onlyOwner {
        _burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    event SoulboundMinted(uint256 indexed tokenId, address indexed recipient, string tokenUri);
}
