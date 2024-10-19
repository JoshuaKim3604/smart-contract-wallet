// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

interface IDiamondCutFacet {

    enum FacetCutAction {Add, Replace, Remove}
    // Add=0, Replace=1, Remove=2

    struct FacetCut {
        address facetAddress;
        FacetCutAction action;
        bytes4[] functionSelectors;
    }

    function diamondCut(
        FacetCut[] calldata diamondCut,
        address init,
        bytes calldata _calldata
    ) external;

    event DiamondCut(FacetCut[] diamondCut, address init, bytes _calldata);

}