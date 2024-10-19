// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

contract TestFacet {
    event NumberIncremented();

    uint256 private number;

    function getNumber() external view returns (uint256) {
        return number;
    }

    function setNumber(uint256 _number) external {
        number = _number;
    }

    function incrementNumber() external {
        ++number;

        emit NumberIncremented();
    }

    receive() external payable {}
}
