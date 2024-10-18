// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import { IDiamondCutFacet } from "../interfaces/IDiamondCutFacet.sol";
import { LibMultiSigStorage } from "../libraries/LibMultiSigStorage.sol";
import { LibMultiSig } from "../libraries/LibMultiSig.sol";
import { ReentrancyGuard } from "./utils/ReentrancyGuard.sol";

contract NativeCoinTransferFacet is ReentrancyGuard {

    error CallerNotSelf();
    error BalanceNotSufficient();
    error CallFailed();

    event NativeCoinTransferred(address to, uint256 value);
    
    function transferNativeCoin(address _to, uint256 _value) external nonReentrant {
        require(msg.sender == address(this), CallerNotSelf());

        require(address(this).balance >= _value, BalanceNotSufficient());

        (bool success, ) = _to.call{
            value: _value
        }("");
        require(success, CallFailed());

        emit NativeCoinTransferred(_to, _value);
    }

}