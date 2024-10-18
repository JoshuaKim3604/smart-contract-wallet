// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

interface INativeCoinTransferFacet {

    function transferNativeCoin(address _to, uint256 _value) external;

}