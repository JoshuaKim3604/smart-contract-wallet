// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

contract Test2Facet {
    event NumberIncremented();

    uint256 private number;

    function getNumber2() external view returns (uint256) {
        return number;
    }

    function setNumber2(uint256 _number) external {
        number = _number;
    }

    function incrementNumber2() external {
        ++number;

        emit NumberIncremented();
    }
}
