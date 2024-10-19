// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

interface IDiamondLoupeFacet {

    struct Facet {
        address facetAddress;
        bytes4[] functionSelectors;
    }

    function facets() external view returns (Facet[] memory facets_);

    function facetFunctionSelectors(address facet) external view returns (bytes4[] memory facetFunctionSelectors_);

    function facetAddresses() external view returns (address[] memory facetAddresses_);

    function facetAddress(bytes4 functionSelector) external view returns (address facetAddress_);

}