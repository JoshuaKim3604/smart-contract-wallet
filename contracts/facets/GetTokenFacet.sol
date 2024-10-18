// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.27;

import { ERC1155TokenReceiver } from "../interfaces/ERC1155TokenReceiver.sol";
import { ERC721TokenReceiver } from "../interfaces/ERC721TokenReceiver.sol";
import { IERC165 } from "../interfaces/IERC165.sol";

contract GetTokenFacet is ERC1155TokenReceiver, ERC721TokenReceiver, IERC165 {

    function onERC1155Received(address, address, uint256, uint256, bytes calldata) external pure override returns (bytes4) {
        return 0xf23a6e61;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        return 0xbc197c81;
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
        return 0x150b7a02;
    }

    function tokensReceived(address, address, address, uint256, bytes calldata, bytes calldata) external pure {}

    function supportsInterface(bytes4 interfaceId) external view virtual override returns (bool) {
        return
            interfaceId == type(ERC1155TokenReceiver).interfaceId ||
            interfaceId == type(ERC721TokenReceiver).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }

}