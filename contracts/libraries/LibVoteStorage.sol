// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

library LibVoteStorage {
    bytes32 constant DIAMOND_VOTE_STORAGE_POSITION =
        keccak256("diamond.vote.storage");

    struct Proposal {
        address to;
        address token;
        address proposer;
        uint256 data;
        uint128 nonce;
        uint128 forCount;
        uint128 againstCount;
        uint128 startTime;
        uint64 duration;
        uint64 chainId;
        bool isExecuted;
        bool isNFT;
    }

    struct ProposalInfo {
        mapping(bytes32 => Proposal) proposal;
        mapping(bytes32 => mapping(address => uint256)) proposalVote;
        uint256 nonce;
    }

    function voteStorage() internal pure returns (ProposalInfo storage ms) {
        bytes32 slot = DIAMOND_VOTE_STORAGE_POSITION;
        assembly {
            ms.slot := slot
        }
    }
}
