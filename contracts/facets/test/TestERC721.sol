// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestERC721 is ERC721 {
    uint256 public tokenCounter;

    constructor() ERC721("SimpleNFT", "SNFT") {
        tokenCounter = 0;
    }

    function mintNFT(address recipient) public returns (uint256) {
        uint256 newTokenId = tokenCounter;
        _safeMint(recipient, newTokenId);
        tokenCounter += 1;
        return newTokenId;
    }
}
