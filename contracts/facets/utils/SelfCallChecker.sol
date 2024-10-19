// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

abstract contract SelfCallChecker {
    error CallerNotSelf();

    modifier enforceSelfCall() {
        require(msg.sender == address(this), CallerNotSelf());
        _;
    }
}
