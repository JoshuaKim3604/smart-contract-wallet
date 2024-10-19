// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {LibDiamond} from "../libraries/LibDiamond.sol";
import {SelfCallChecker} from "./utils/SelfCallChecker.sol";
import {IDiamondCutFacet} from "../interfaces/IDiamondCutFacet.sol";

contract DiamondCutFacet is IDiamondCutFacet, SelfCallChecker {
    function diamondCut(
        FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata _calldata
    ) external override enforceSelfCall {
        LibDiamond.diamondCut(_diamondCut, _init, _calldata);
    }
}
