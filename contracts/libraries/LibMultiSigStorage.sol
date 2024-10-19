// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

library LibMultiSigStorage {
    bytes32 constant MULTI_SIG_STORAGE_SLOT =
        keccak256("MultiSigStorage.diamond.storage");
    address constant SENTINEL_OWNER = address(1);

    struct MultiSigStorage {
        mapping(address => address) owners;
        uint256 threshold;
        uint256 ownerCount;
        uint256 nonce;
    }

    function multiSigStorage()
        internal
        pure
        returns (MultiSigStorage storage ms)
    {
        bytes32 slot = MULTI_SIG_STORAGE_SLOT;
        assembly {
            ms.slot := slot
        }
    }
}
