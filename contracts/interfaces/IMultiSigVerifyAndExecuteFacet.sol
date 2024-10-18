// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

interface IMultiSigVerifyAndExecuteFacet {

    function verifyExecute(
        address[] calldata _signers,
        bytes[] calldata _signature,
        bytes calldata _calldata,
        uint256 _salt
    ) external;

    function getNonce() external view returns (uint256);

}