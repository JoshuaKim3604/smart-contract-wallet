// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

interface IOwnerManagerFacet {
    function setupOwners(address[] calldata owners, uint256 threshold) external;

    function addOwner(address newOwner) external;

    function removeOwner(address prevOwner, address owner) external;

    function changeThreshold(uint256 threshold) external;

    function getOwners() external view returns (address[] memory);

    function isOwner(address owner) external view returns (bool);
}
