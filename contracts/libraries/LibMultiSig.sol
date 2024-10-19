// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {LibMultiSigStorage} from "./LibMultiSigStorage.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

library LibMultiSig {
    error InvalidSigner();
    error InvalidSignature();

    address internal constant SENTINEL_OWNERS = address(0x1);

    function verifyMultiSig(
        address[] calldata signers,
        bytes[] calldata signatures,
        bytes32 msgHash
    ) internal view {
        LibMultiSigStorage.MultiSigStorage storage ds = LibMultiSigStorage
            .multiSigStorage();

        address lastSigner;

        for (uint256 i = 0; i < ds.threshold; i++) {
            address signer = signers[i];
            require(
                SignatureChecker.isValidSignatureNow(
                    signer,
                    msgHash,
                    signatures[i]
                ),
                InvalidSignature()
            );
            require(
                ds.owners[signer] != address(0) &&
                    signer > lastSigner &&
                    signer != SENTINEL_OWNERS,
                InvalidSigner()
            );

            signer = lastSigner;
        }
    }
}
