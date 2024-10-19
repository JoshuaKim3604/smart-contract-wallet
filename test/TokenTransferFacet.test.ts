import { ethers } from 'hardhat'
import { facetFixture, testERC20Fixture, testERC721Fixture } from './utils/fixtures/facets'
import { diamondFixture, diamondAsFacetFixture } from './utils/fixtures/diamond'
import { Signer, ZeroAddress, keccak256, toBeArray } from 'ethers'
import { increaseTime } from './utils/helpers'
import { Diamond, DiamondCutFacet, DiamondLoupeFacet, GetTokenFacet, MultiSigVerifyAndExecuteFacet, NativeCoinTransferFacet, OwnerManagerFacet, TokenTransferFacet, TestERC20, TestERC721 } from '../typechain-types'
import { expect } from 'chai'

describe('=> TokenTransferFacet', () => {
    let diamondCutFacet: DiamondCutFacet
    let diamondLoupeFacet: DiamondLoupeFacet
    let getTokenFacet: GetTokenFacet
    let multiSigVerifyAndExecuteFacet: MultiSigVerifyAndExecuteFacet
    let nativeCoinTransferFacet: NativeCoinTransferFacet
    let ownerManagerFacet: OwnerManagerFacet
    let tokenTransferFacet: TokenTransferFacet
    let testERC20: TestERC20
    let testERC721: TestERC721

    let diamondCutDiamond: DiamondCutFacet
    let diamondLoupeDiamond: DiamondLoupeFacet
    let getTokenDiamond: GetTokenFacet
    let multiSigVerifyAndExecuteDiamond: MultiSigVerifyAndExecuteFacet
    let nativeCoinTransferDiamond: NativeCoinTransferFacet
    let ownerManagerDiamond: OwnerManagerFacet
    let tokenTransferDiamond: TokenTransferFacet

    let diamond: Diamond
    let threshold: number = 4
    let chainId: bigint

    let owner1: Signer;
    let owner2: Signer;
    let owner3: Signer;
    let owner4: Signer;
    let owner5: Signer;
    let ownerList: Array<Signer>;
    let ownerAddressList: Array<string>;

    let user1: Signer;

    let defaultBalance = 10000

    before(async () => {
        [owner1, owner2, owner3, owner4, owner5, user1] = await ethers.getSigners();

        ownerList = [owner1, owner2, owner3, owner4, owner5]
        ownerAddressList = [
            await owner1.getAddress(),
            await owner2.getAddress(),
            await owner3.getAddress(),
            await owner4.getAddress(),
            await owner5.getAddress(),
        ];

        chainId = (await ethers.provider.getNetwork()).chainId;
    })
    beforeEach(async () => {
        ({
            diamondCutFacet,
            diamondLoupeFacet,
            getTokenFacet,
            multiSigVerifyAndExecuteFacet,
            nativeCoinTransferFacet,
            ownerManagerFacet,
            tokenTransferFacet
        } = await facetFixture());

        

        diamond = await diamondFixture(
            diamondCutFacet,
            diamondLoupeFacet,
            getTokenFacet,
            multiSigVerifyAndExecuteFacet,
            nativeCoinTransferFacet,
            ownerManagerFacet,
            tokenTransferFacet,
            ownerAddressList,
            threshold
        );

        ({
            diamondCutDiamond,
            diamondLoupeDiamond,
            getTokenDiamond,
            multiSigVerifyAndExecuteDiamond,
            nativeCoinTransferDiamond,
            ownerManagerDiamond,
            tokenTransferDiamond
        } = await diamondAsFacetFixture(diamond));

        ({
            testERC20
        } = await testERC20Fixture());

        ({
            testERC721
        } = await testERC721Fixture());

        await testERC20.mint(await tokenTransferDiamond.getAddress(), defaultBalance)
        await testERC721.mintNFT(await tokenTransferDiamond.getAddress())
    })

    describe('# createProposal', () => {
        it('Should create proposal', async () => {
            let Proposal = {
                to: await user1.getAddress(),
                token: await testERC20.getAddress(),
                proposer: await user1.getAddress(),
                data: 10,
                nonce: await tokenTransferDiamond.getProposalNonce(),
                forCount: 0,
                againstCount: 0,
                startTime: (await ethers.provider.getBlock("latest"))?.timestamp as any + 100,
                duration: 2500,
                chainId: Number((await ethers.provider.getNetwork()).chainId),
                isExecuted: false,
                isNFT: false,
            }
            expect(await tokenTransferDiamond.createProposal(Proposal)).to.emit(tokenTransferDiamond, "ProposalCreated")
        })
        it('Should revert if to address is zero address', async () => {
            let ZeroAddressProposal = {
                to: ZeroAddress,
                token: await testERC20.getAddress(),
                proposer: await user1.getAddress(),
                data: 10,
                nonce: await tokenTransferDiamond.getProposalNonce(),
                forCount: 0,
                againstCount: 0,
                startTime: (await ethers.provider.getBlock("latest"))?.timestamp as any + 100,
                duration: 2500,
                chainId: Number((await ethers.provider.getNetwork()).chainId),
                isExecuted: false,
                isNFT: false,
            }
            await expect(tokenTransferDiamond.createProposal(ZeroAddressProposal)).to.be.revertedWithCustomError(tokenTransferDiamond, "InvalidTo")
        })
        it('Should revert if token address is zero address', async () => {
            let ZeroAddressProposal = {
                to: await user1.getAddress(),
                token: ZeroAddress,
                proposer: await user1.getAddress(),
                data: 10,
                nonce: await tokenTransferDiamond.getProposalNonce(),
                forCount: 0,
                againstCount: 0,
                startTime: (await ethers.provider.getBlock("latest"))?.timestamp as any + 100,
                duration: 2500,
                chainId: Number((await ethers.provider.getNetwork()).chainId),
                isExecuted: false,
                isNFT: false,
            }
            await expect(tokenTransferDiamond.createProposal(ZeroAddressProposal)).to.be.revertedWithCustomError(tokenTransferDiamond, "InvalidToken")
        })
        it('Should revert if duration is smaller than min duration', async () => {
            let minDurationProposal = {
                to: await user1.getAddress(),
                token: await testERC20.getAddress(),
                proposer: await user1.getAddress(),
                data: 10,
                nonce: await tokenTransferDiamond.getProposalNonce(),
                forCount: 0,
                againstCount: 0,
                startTime: (await ethers.provider.getBlock("latest"))?.timestamp as any + 100,
                duration: 1000,
                chainId: Number((await ethers.provider.getNetwork()).chainId),
                isExecuted: false,
                isNFT: false,
            }
            await expect(tokenTransferDiamond.createProposal(minDurationProposal)).to.be.revertedWithCustomError(tokenTransferDiamond, "InvalidDuration")
        })
        it('Should revert if start time is smaller than block timestamp', async () => {
            let minDurationProposal = {
                to: await user1.getAddress(),
                token: await testERC20.getAddress(),
                proposer: await user1.getAddress(),
                data: 10,
                nonce: await tokenTransferDiamond.getProposalNonce(),
                forCount: 0,
                againstCount: 0,
                startTime: (await ethers.provider.getBlock("latest"))?.timestamp as any,
                duration: 2500,
                chainId: Number((await ethers.provider.getNetwork()).chainId),
                isExecuted: false,
                isNFT: false,
            }
            await expect(tokenTransferDiamond.createProposal(minDurationProposal)).to.be.revertedWithCustomError(tokenTransferDiamond, "InvalidStartTime")
        })
        it('Should revert if nonce is different', async () => {
            let minDurationProposal = {
                to: await user1.getAddress(),
                token: await testERC20.getAddress(),
                proposer: await user1.getAddress(),
                data: 10,
                nonce: Number(await tokenTransferDiamond.getProposalNonce()) + 1,
                forCount: 0,
                againstCount: 0,
                startTime: (await ethers.provider.getBlock("latest"))?.timestamp as any + 100,
                duration: 2500,
                chainId: Number((await ethers.provider.getNetwork()).chainId),
                isExecuted: false,
                isNFT: false,
            }
            await expect(tokenTransferDiamond.createProposal(minDurationProposal)).to.be.revertedWithCustomError(tokenTransferDiamond, "InvalidNonce")
        })
        it('Should revert if it is already executed', async () => {
            let alreadyExecutedProposal = {
                to: await user1.getAddress(),
                token: await testERC20.getAddress(),
                proposer: await user1.getAddress(),
                data: 10,
                nonce: await tokenTransferDiamond.getProposalNonce(),
                forCount: 0,
                againstCount: 0,
                startTime: (await ethers.provider.getBlock("latest"))?.timestamp as any + 100,
                duration: 2500,
                chainId: Number((await ethers.provider.getNetwork()).chainId),
                isExecuted: true,
                isNFT: false,
            }

            await expect(tokenTransferDiamond.createProposal(alreadyExecutedProposal)).to.be.revertedWithCustomError(tokenTransferDiamond, "InvalidExecutionFlag")
        })
        it('Should revert if chain id is different with current chain id', async () => {
            let Proposal = {
                to: await user1.getAddress(),
                token: await testERC20.getAddress(),
                proposer: await user1.getAddress(),
                data: 10,
                nonce: await tokenTransferDiamond.getProposalNonce(),
                forCount: 0,
                againstCount: 0,
                startTime: (await ethers.provider.getBlock("latest"))?.timestamp as any + 100,
                duration: 2500,
                chainId: Number((await ethers.provider.getNetwork()).chainId) + 1,
                isExecuted: false,
                isNFT: false,
            }
            await expect(tokenTransferDiamond.createProposal(Proposal)).to.be.revertedWithCustomError(tokenTransferDiamond, "InvalidChainId")
        })
    })
    describe('# voteProposal', () => {
        let creationProposalNonce: bigint
        let createdProposalHash: string
        let defaultWindow = 100
        let duration = 60 * 30
        beforeEach(async function () {
            creationProposalNonce = await tokenTransferDiamond.getProposalNonce()
            let Proposal = {
                to: await user1.getAddress(),
                token: await testERC20.getAddress(),
                proposer: await user1.getAddress(),
                data: 10,
                nonce: creationProposalNonce,
                forCount: 0,
                againstCount: 0,
                startTime: (await ethers.provider.getBlock("latest"))?.timestamp as any + defaultWindow,
                duration,
                chainId: Number((await ethers.provider.getNetwork()).chainId),
                isExecuted: false,
                isNFT: false,
            }
            const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
                [
                    'address',  // to
                    'address',  // token
                    'address',  // proposer
                    'uint256',  // data
                    'uint128',  // nonce
                    'uint128',  // forCount
                    'uint128',  // againstCount
                    'uint128',  // startTime
                    'uint64',   // duration
                    'uint64',   // chainId
                    'bool',     // isExecuted
                    'bool'      // isNFT
                ],
                [
                    Proposal.to, 
                    Proposal.token, 
                    Proposal.proposer, 
                    Proposal.data, 
                    creationProposalNonce,  // nonce
                    Proposal.forCount,
                    Proposal.againstCount,
                    Proposal.startTime,
                    Proposal.duration,
                    Proposal.chainId,
                    Proposal.isExecuted,
                    Proposal.isNFT
                ]
            );

            createdProposalHash = keccak256(encodedData)
            expect(await tokenTransferDiamond.createProposal(Proposal)).to.emit(tokenTransferDiamond, "ProposalCreated")
        })
        it('Should revert if duration passed', async () => {
            await increaseTime(duration + defaultWindow)

            await expect(tokenTransferDiamond.connect(user1).voteProposal(createdProposalHash, true, "0x")).to.be.revertedWithCustomError(tokenTransferDiamond, "DurationPassed")
        })
        it('Should revert if voted again', async () => {
            await increaseTime(defaultWindow)

            await tokenTransferDiamond.connect(user1).voteProposal(createdProposalHash, true, "0x")

            await expect(tokenTransferDiamond.connect(user1).voteProposal(createdProposalHash, true, "0x")).to.be.revertedWithCustomError(tokenTransferDiamond, "AlreadyVoted")
        })
        it('Should vote for proposal with signature', async () => {
            const signature = await user1.signMessage(toBeArray(createdProposalHash))
            const formattedSignature = signature.replace("0x", await user1.getAddress())

            await increaseTime(defaultWindow)

            await expect(tokenTransferDiamond.voteProposal(createdProposalHash, true, formattedSignature)).to.emit(tokenTransferDiamond, "ProposalVoted").withArgs(createdProposalHash, true, user1)
        })
        it('Should vote for proposal without signature', async () => {
            await increaseTime(defaultWindow)

            await expect(tokenTransferDiamond.connect(user1).voteProposal(createdProposalHash, true, "0x")).to.emit(tokenTransferDiamond, "ProposalVoted").withArgs(createdProposalHash, true, user1)
        })
    })
    describe('# executeProposal', () => {
        let erc20ProposalNonce: bigint
        let erc721ProposalNonce: bigint
        let erc20ProposalHash: string
        let erc721ProposalHash: string
        let defaultWindow = 100
        let duration = 60 * 30
        let transferAmount = 10
        let tokenId = 0
        let voteFor = true
        let voteAgainst = false
        let securityWindow = 60 * 60 * 24 * 7
        beforeEach(async function () {
            erc20ProposalNonce = await tokenTransferDiamond.getProposalNonce()
            
            const ERC20Proposal = {
                to: await user1.getAddress(),
                token: await testERC20.getAddress(),
                proposer: await user1.getAddress(),
                data: transferAmount,
                nonce: erc20ProposalNonce,
                forCount: 0,
                againstCount: 0,
                startTime: (await ethers.provider.getBlock("latest"))?.timestamp as any + defaultWindow,
                duration,
                chainId: Number((await ethers.provider.getNetwork()).chainId),
                isExecuted: false,
                isNFT: false,
            }
            const erc20ProposalEncodedData = ethers.AbiCoder.defaultAbiCoder().encode(
                [
                    'address',  // to
                    'address',  // token
                    'address',  // proposer
                    'uint256',  // data
                    'uint128',  // nonce
                    'uint128',  // forCount
                    'uint128',  // againstCount
                    'uint128',  // startTime
                    'uint64',   // duration
                    'uint64',   // chainId
                    'bool',     // isExecuted
                    'bool'      // isNFT
                ],
                [
                    ERC20Proposal.to, 
                    ERC20Proposal.token, 
                    ERC20Proposal.proposer, 
                    ERC20Proposal.data, 
                    erc20ProposalNonce,  // nonce
                    ERC20Proposal.forCount,
                    ERC20Proposal.againstCount,
                    ERC20Proposal.startTime,
                    ERC20Proposal.duration,
                    ERC20Proposal.chainId,
                    ERC20Proposal.isExecuted,
                    ERC20Proposal.isNFT
                ]
            );

            erc20ProposalHash = keccak256(erc20ProposalEncodedData)
            expect(await tokenTransferDiamond.createProposal(ERC20Proposal)).to.emit(tokenTransferDiamond, "ProposalCreated")


            erc721ProposalNonce = await tokenTransferDiamond.getProposalNonce()
            
            const ERC721Proposal = {
                to: await user1.getAddress(),
                token: await testERC721.getAddress(),
                proposer: await user1.getAddress(),
                data: tokenId,
                nonce: erc721ProposalNonce,
                forCount: 0,
                againstCount: 0,
                startTime: (await ethers.provider.getBlock("latest"))?.timestamp as any + defaultWindow,
                duration,
                chainId: Number((await ethers.provider.getNetwork()).chainId),
                isExecuted: false,
                isNFT: true,
            }
            const erc721ProposalEncodedData = ethers.AbiCoder.defaultAbiCoder().encode(
                [
                    'address',  // to
                    'address',  // token
                    'address',  // proposer
                    'uint256',  // data
                    'uint128',  // nonce
                    'uint128',  // forCount
                    'uint128',  // againstCount
                    'uint128',  // startTime
                    'uint64',   // duration
                    'uint64',   // chainId
                    'bool',     // isExecuted
                    'bool'      // isNFT
                ],
                [
                    ERC721Proposal.to, 
                    ERC721Proposal.token, 
                    ERC721Proposal.proposer, 
                    ERC721Proposal.data, 
                    erc721ProposalNonce,  // nonce
                    ERC721Proposal.forCount,
                    ERC721Proposal.againstCount,
                    ERC721Proposal.startTime,
                    ERC721Proposal.duration,
                    ERC721Proposal.chainId,
                    ERC721Proposal.isExecuted,
                    ERC721Proposal.isNFT
                ]
            );

            erc721ProposalHash = keccak256(erc721ProposalEncodedData)
            expect(await tokenTransferDiamond.createProposal(ERC721Proposal)).to.emit(tokenTransferDiamond, "ProposalCreated")
            
            await increaseTime(defaultWindow)
            await tokenTransferDiamond.connect(owner1).voteProposal(erc20ProposalHash, voteFor, "0x")
            await tokenTransferDiamond.connect(owner1).voteProposal(erc721ProposalHash, voteFor, "0x")

        })
        it('Should execute proposal - ERC20', async () => {
            await increaseTime(duration)

            const balanceBefore = await testERC20.balanceOf(await user1.getAddress())
            await expect(tokenTransferDiamond.executeProposal(erc20ProposalHash)).to.emit(tokenTransferDiamond, "ProposalExecuted")
            const balanceAfter = await testERC20.balanceOf(await user1.getAddress())
            expect(balanceAfter).to.equal(Number(balanceBefore) + transferAmount)
        })
        it('Should execute proposal - ERC721', async () => {
            await increaseTime(duration)

            const ownerBefore = await testERC721.ownerOf(tokenId)
            await expect(tokenTransferDiamond.executeProposal(erc721ProposalHash)).to.emit(tokenTransferDiamond, "ProposalExecuted")
            const ownerAfter = await testERC721.ownerOf(tokenId)
            expect(ownerBefore).to.equal(await tokenTransferDiamond.getAddress())
            expect(ownerAfter).to.equal(await user1.getAddress())
        })
        it('Should revert if already executed', async () => {
            await increaseTime(duration)

            await expect(tokenTransferDiamond.executeProposal(erc20ProposalHash)).to.emit(tokenTransferDiamond, "ProposalExecuted")
            await expect(tokenTransferDiamond.executeProposal(erc20ProposalHash)).to.be.revertedWithCustomError(tokenTransferDiamond, "AlreadyExecuted")
        })
        it('Should revert if for is less than against', async () => {
            await tokenTransferDiamond.connect(owner2).voteProposal(erc20ProposalHash, voteAgainst, "0x")
            await tokenTransferDiamond.connect(owner3).voteProposal(erc20ProposalHash, voteAgainst, "0x")

            await increaseTime(duration)

            await expect(tokenTransferDiamond.executeProposal(erc20ProposalHash)).to.be.revertedWithCustomError(tokenTransferDiamond, "VoteForIsInsufficient")
        })
        it('Should revert if security window passed', async () => {
            await increaseTime(duration + securityWindow)
    
            await expect(tokenTransferDiamond.executeProposal(erc721ProposalHash)).to.be.revertedWithCustomError(tokenTransferDiamond, "SecurityWindowPassed")
        })
    })
})