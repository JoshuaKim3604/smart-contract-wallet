// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

interface ERC721TokenReceiver {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}
