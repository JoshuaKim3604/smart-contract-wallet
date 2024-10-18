// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

abstract contract ReentrancyGuard {

    modifier nonReentrant {
        assembly {
            if tload(0) { revert(0, 0) }
            tstore(0,1)
        }
        _;
        assembly {
            tstore(0, 0)
        }
    }
}