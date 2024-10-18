// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

contract Test3Facet {

    event NumberIncremented();

    uint256 private number;

    function getNumber2() external view returns (uint256) {
        return number;
    }
}