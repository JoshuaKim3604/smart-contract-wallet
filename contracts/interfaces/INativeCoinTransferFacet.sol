// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

interface INativeCoinTransferFacet {

    function transferNativeCoin(address to, uint256 value) external;

}