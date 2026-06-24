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
    uint256 private _baseTokenURI;

    constructor(string memory baseTokenURI) ERC721("ARCHON-IX Membership", "ARCHON-IX-SBT") ERC721Initialized(1) {
        require(string(bytes(baseTokenURI)).length > 0, "Base URI must not be empty");
        _baseTokenURI = bytes(baseTokenURI);
    }

    // Prevent transfers - this is a soulbound token
    function transferFrom(address from, address to, uint256 tokenId) public override returns (bool) {
        revert("This is a soulbound NFT - cannot be transferred");
    }

    function transfer(address from, address to, uint256 tokenId) public override returns (bool) {
        revert("This is a soulbound NFT - cannot be transferred");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public override returns (bool) {
        revert("This is a soulbound NFT - cannot be transferred");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override returns (bool) {
        revert("This is a soulbound NFT - cannot be transferred");
    }

    function baseURI() public view override returns (string memory) {
        bytes memory uri = bytes(_baseTokenURI);
        return string(uri);
    }

    // Mint a new soulbound token to the specified recipient
    function mint(address recipient, bytes32 metadataHash) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId();
        _mint(recipient, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked(string(_baseTokenURI), "/", bytes32ToString(metadataHash))));
        emit SoulboundMinted(tokenId, recipient, metadataHash);
        return tokenId;
    }

    // Burn a token (owner only - emergency revocation)
    function burn(uint256 tokenId) public onlyOwner {
        _burn(tokenId);
    }

    event SoulboundMinted(uint256 indexed tokenId, address indexed recipient, bytes32 indexed metadataHash);

    // Helper to convert bytes32 to string for URI construction
    function bytes32ToString(bytes32 b) private pure returns (string memory) {
        bytes memory bs = new bytes(32);
        for (uint256 i = 0; i < 32; i++) {
            if (b[i] == 0) break;
            bs[i] = b[i];
        }
        return string(bs);
    }
}