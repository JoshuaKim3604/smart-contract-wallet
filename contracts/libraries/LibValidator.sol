// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

library LibValidator {
    error InvalidSignature();

    function validateSignature(
        bytes32 operationHash,
        bytes calldata signature
    ) internal view returns (address) {
        address signer = address(uint160(bytes20(signature[:20])));

        require(
            SignatureChecker.isValidSignatureNow(
                signer,
                operationHash,
                bytes(signature[20:])
            ),
            InvalidSignature()
        );
        return signer;
    }
}
