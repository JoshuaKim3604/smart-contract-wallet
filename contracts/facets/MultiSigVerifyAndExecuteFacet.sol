// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import { IDiamondCutFacet } from "../interfaces/IDiamondCutFacet.sol";
import { LibMultiSigStorage } from "../libraries/LibMultiSigStorage.sol";
import { LibMultiSig } from "../libraries/LibMultiSig.sol";

contract MultiSigVerifyAndExecuteFacet {

    error InvalidNonce();
    error InvalidSignerAndSignatureLength();
    error InvalidSignerLength();

    function verifyExecute(
        address[] calldata _signers,
        bytes[] calldata _signatures,
        bytes calldata _calldata,
        uint256 _nonce
    ) external {
        bytes32 operationHash = keccak256(
            abi.encode(block.chainid, address(this), _calldata, _nonce)
        );
        bytes32 msgHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", operationHash)
        );

        LibMultiSigStorage.MultiSigStorage storage ds = LibMultiSigStorage
            .multiSigStorage();
        require(ds.nonce == _nonce, InvalidNonce());
        require(_signers.length == _signatures.length, InvalidSignerAndSignatureLength());
        require(ds.threshold <= _signers.length, InvalidSignerLength());

        LibMultiSig.verifyMultiSig(_signers, _signatures, msgHash);

        ++ds.nonce;

        (bool success, bytes memory returndata) = address(this).call{value: 0}(
            _calldata
        );
        if (!success) {
            assembly {
                revert(add(returndata, 0x20), mload(returndata))
            }
        }
    }

    function getNonce() external view returns (uint256) {
        return LibMultiSigStorage.multiSigStorage().nonce;
    }
}
