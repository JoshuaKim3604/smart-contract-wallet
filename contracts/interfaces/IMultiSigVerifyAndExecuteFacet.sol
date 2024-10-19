// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

interface IMultiSigVerifyAndExecuteFacet {

    function verifyExecute(
        address[] calldata signers,
        bytes[] calldata signatures,
        bytes calldata calldata,
        uint256 nonce
    ) external;

    function getNonce() external view returns (uint256);

}