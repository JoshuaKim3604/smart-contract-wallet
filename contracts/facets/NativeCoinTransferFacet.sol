// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import { LibMultiSigStorage } from "../libraries/LibMultiSigStorage.sol";
import { LibMultiSig } from "../libraries/LibMultiSig.sol";
import { ReentrancyGuard } from "./utils/ReentrancyGuard.sol";
import { SelfCallChecker } from "./utils/SelfCallChecker.sol";
import { IDiamondCutFacet } from "../interfaces/IDiamondCutFacet.sol";
import { INativeCoinTransferFacet } from "../interfaces/INativeCoinTransferFacet.sol";

contract NativeCoinTransferFacet is INativeCoinTransferFacet, ReentrancyGuard, SelfCallChecker {

    event NativeCoinTransferred(address to, uint256 value);

    error BalanceNotSufficient();
    error CallFailed();
    
    function transferNativeCoin(address _to, uint256 _value) external override nonReentrant enforceSelfCall {
        require(address(this).balance >= _value, BalanceNotSufficient());

        (bool success, ) = _to.call{
            value: _value
        }("");
        require(success, CallFailed());

        emit NativeCoinTransferred(_to, _value);
    }

}