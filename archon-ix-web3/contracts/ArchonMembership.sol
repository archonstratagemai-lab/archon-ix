// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ArchonMembership
 * @dev Simple ERC‑721 representing a membership NFT for the ARCHON‑IX community.
 *      The contract is deliberately minimal – it only needs a `mint` function
 *      that only the contract owner (deployer) can call.  In production you
 *      would add role‑based access, metadata, and maybe a merkle‑tree allow‑list.
 */
contract ArchonMembership is ERC721, Ownable {
    constructor() ERC721("ARCHON-IX Membership", "ARCHON") {}

    uint256 public nextTokenId;


    /**
     * @dev Mint a new token to `to`. Only the contract owner can call.
     */
    function mint(address to) external onlyOwner returns (uint256 tokenId) {
        tokenId = ++nextTokenId;
        _safeMint(to, tokenId);
    }
}
