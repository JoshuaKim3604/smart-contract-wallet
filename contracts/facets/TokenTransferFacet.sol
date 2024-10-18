// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import { LibVoteStorage } from '../libraries/LibVoteStorage.sol';
import { LibValidator } from '../libraries/LibValidator.sol';
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { ITokenTransferFacet } from '../interfaces/ITokenTransferFacet.sol';

contract TokenTransferFacet is ITokenTransferFacet {

    error InvalidTo();
    error InvalidToken();
    error InvalidDuration();
    error InvalidStartTime();
    error InvalidNonce();
    error AlreadyExecuted();
    error InvalidExecutionFlag();
    error InvalidChainId();
    error InvalidCount();
    error VoteForIsInsufficient();
    error SecurityWindowPassed();
    error ProposalNotStarted();
    error DurationPassed();
    error AlreadyVoted();
    error DurationNotPassed();

    event ProposalCreated(bytes32 proposalHash, LibVoteStorage.Proposal proposal);
    event ProposalVoted(bytes32 proposalHash, bool voteFor, address signer);
    event ProposalExecuted(bytes32 proposalHash);

    uint64 constant MIN_DURATION = 60 * 30;
    uint128 constant SECURITY_WINDOW = 60 * 60 * 24 * 7;
    uint256 constant FOR = 1;
    uint256 constant AGAINST = 2;

    function createProposal(
        LibVoteStorage.Proposal calldata proposal
    ) external override {
        bytes32 proposalHash = keccak256(abi.encode(proposal));
        LibVoteStorage.ProposalInfo storage vs = LibVoteStorage.voteStorage();

        require(proposal.to != address(0), InvalidTo());
        require(proposal.token != address(0), InvalidToken());
        require(proposal.duration >= MIN_DURATION, InvalidDuration());
        require(proposal.startTime >= block.timestamp, InvalidStartTime());
        require(proposal.nonce == vs.nonce, InvalidNonce());
        require(proposal.isExecuted == false, InvalidExecutionFlag());
        require(vs.proposal[proposalHash].isExecuted == false, AlreadyExecuted());
        require(proposal.chainId == block.chainid, InvalidChainId());
        require(proposal.forCount == 0 && proposal.againstCount == 0, InvalidCount());

        ++vs.nonce;
        vs.proposal[proposalHash] = proposal;
        emit ProposalCreated(proposalHash, proposal);
    }

    function voteProposal(bytes32 proposalHash, bool voteFor, bytes calldata signature) external override {
        LibVoteStorage.ProposalInfo storage vs = LibVoteStorage.voteStorage();
        LibVoteStorage.Proposal storage voteProposalInfo = vs.proposal[proposalHash];

        require(voteProposalInfo.startTime <= block.timestamp, ProposalNotStarted());
        require(voteProposalInfo.to != address(0), InvalidTo());
        require(voteProposalInfo.startTime + uint128(voteProposalInfo.duration) >= block.timestamp, DurationPassed());

        bytes32 msgHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", proposalHash)
        );
        address signer = signature.length == 0 ? msg.sender : LibValidator.validateSignature(msgHash, signature);

        require(vs.proposalVote[proposalHash][signer] == 0, AlreadyVoted());

        if(voteFor == true) {
            vs.proposalVote[proposalHash][signer] = FOR;

            ++voteProposalInfo.forCount;
        } else {
            vs.proposalVote[proposalHash][signer] == AGAINST;

            ++voteProposalInfo.againstCount;
        }

        emit ProposalVoted(proposalHash, voteFor, signer);
    }

    function executeProposal(bytes32 proposalHash) external override {
        LibVoteStorage.ProposalInfo storage vs = LibVoteStorage.voteStorage();
        LibVoteStorage.Proposal storage executeProposalInfo = vs.proposal[proposalHash];

        require(executeProposalInfo.startTime + uint128(executeProposalInfo.duration) < block.timestamp, DurationNotPassed());
        require(executeProposalInfo.startTime + uint128(executeProposalInfo.duration) + SECURITY_WINDOW > block.timestamp, SecurityWindowPassed());
        require(executeProposalInfo.isExecuted == false, AlreadyExecuted());
        require(executeProposalInfo.forCount > executeProposalInfo.againstCount, VoteForIsInsufficient());
        require(executeProposalInfo.chainId == block.chainid, InvalidChainId());

        if(executeProposalInfo.isNFT == true) {
            executeProposalInfo.isExecuted = true;

            IERC721 erc721Contract = IERC721(executeProposalInfo.token);
            erc721Contract.safeTransferFrom(address(this), executeProposalInfo.to, executeProposalInfo.data, "0x");
        } else {
            executeProposalInfo.isExecuted = true;

            IERC20 erc20Contract = IERC20(executeProposalInfo.token);
            erc20Contract.transfer(executeProposalInfo.to, executeProposalInfo.data);
        }

        emit ProposalExecuted(proposalHash);
    }

    function getProposalNonce() external view override returns (uint256) {
        return LibVoteStorage.voteStorage().nonce;
    }

}