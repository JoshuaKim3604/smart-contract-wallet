// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {LibVoteStorage} from "../libraries/LibVoteStorage.sol";

interface ITokenTransferFacet {
    function createProposal(LibVoteStorage.Proposal memory proposal) external;

    function voteProposal(
        bytes32 proposalHash,
        bool voteFor,
        bytes calldata signature
    ) external;

    function executeProposal(bytes32 proposalHash) external;

    function getProposalNonce() external view returns (uint256);
}
