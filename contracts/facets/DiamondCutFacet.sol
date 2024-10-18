// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import { IDiamondCutFacet } from "../interfaces/IDiamondCutFacet.sol";
import { LibDiamond } from "../libraries/LibDiamond.sol";

contract DiamondCutFacet is IDiamondCutFacet {

    error CallerNotSelf();

    function diamondCut(
        FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata _calldata
    ) external override {
        require(msg.sender == address(this), CallerNotSelf());

        LibDiamond.diamondCut(_diamondCut, _init, _calldata);
    }
}