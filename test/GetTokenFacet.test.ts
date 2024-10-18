import { ethers } from 'hardhat'
import { facetFixture } from './utils/fixtures/facets'
import { diamondFixture, diamondAsFacetFixture } from './utils/fixtures/diamond'
import { Signer, ZeroAddress } from 'ethers'
import { Diamond, DiamondCutFacet, DiamondLoupeFacet, GetTokenFacet, MultiSigVerifyAndExecuteFacet, NativeCoinTransferFacet, OwnerManagerFacet, TestFacet, TokenTransferFacet } from '../typechain-types'
import { expect } from 'chai'

describe('=> GetTokenFacet', () => {
    let diamondCutFacet: DiamondCutFacet
    let diamondLoupeFacet: DiamondLoupeFacet
    let getTokenFacet: GetTokenFacet
    let multiSigVerifyAndExecuteFacet: MultiSigVerifyAndExecuteFacet
    let nativeCoinTransferFacet: NativeCoinTransferFacet
    let ownerManagerFacet: OwnerManagerFacet
    let tokenTransferFacet: TokenTransferFacet

    let diamondCutDiamond: DiamondCutFacet
    let diamondLoupeDiamond: DiamondLoupeFacet
    let getTokenDiamond: GetTokenFacet
    let multiSigVerifyAndExecuteDiamond: MultiSigVerifyAndExecuteFacet
    let nativeCoinTransferDiamond: NativeCoinTransferFacet
    let ownerManagerDiamond: OwnerManagerFacet
    let tokenTransferDiamond: TokenTransferFacet
    let testDiamond: TestFacet

    let diamond: Diamond
    let threshold: number = 4
    let chainId: bigint
    let defaultSalt: number = 0

    let owner1: Signer;
    let owner2: Signer;
    let owner3: Signer;
    let owner4: Signer;
    let owner5: Signer;
    let ownerList: Array<Signer>;

    before(async () => {
        [owner1, owner2, owner3, owner4, owner5] = await ethers.getSigners();

        ownerList = [owner1, owner2, owner3, owner4, owner5]

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
            [
                await owner1.getAddress(),
                await owner2.getAddress(),
                await owner3.getAddress(),
                await owner4.getAddress(),
                await owner5.getAddress(),
            ],
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
    })
    describe('# onERC721Received', () => {
        it('Should return valid value', async () => {
            const expectedERC721Receiver = "0x150b7a02"
            expect(await getTokenFacet.onERC721Received(ZeroAddress, ZeroAddress, 0, "0x00")).to.equal(expectedERC721Receiver)
            expect(await getTokenDiamond.onERC721Received(ZeroAddress, ZeroAddress, 0, "0x00")).to.equal(expectedERC721Receiver)
        })
    })
    describe('# onERC1155Received', () => {
        it('Should return valid value', async () => {
            const expectedERC1155Receiver = "0xf23a6e61"
            expect(await getTokenFacet.onERC1155Received(ZeroAddress, ZeroAddress, 0, 0, "0x00")).to.equal(expectedERC1155Receiver)
            expect(await getTokenDiamond.onERC1155Received(ZeroAddress, ZeroAddress, 0, 0, "0x00")).to.equal(expectedERC1155Receiver)
        })
    })
    describe('# onERC1155BatchReceived', () => {
        it('Should return valid value', async () => {
            const expectedERC1155BatchReceiver = "0xbc197c81"
            expect(await getTokenFacet.onERC1155BatchReceived(ZeroAddress, ZeroAddress, [0], [0], "0x00")).to.equal(expectedERC1155BatchReceiver)
            expect(await getTokenDiamond.onERC1155BatchReceived(ZeroAddress, ZeroAddress, [0], [0], "0x00")).to.equal(expectedERC1155BatchReceiver)
        })
    })
    describe('# tokenReceived', () => {
        it('Should not revert', async () => {
            expect(await getTokenFacet.tokensReceived(ZeroAddress, ZeroAddress, ZeroAddress, 0, "0x00", "0x00")).to.not.reverted
            expect(await getTokenDiamond.tokensReceived(ZeroAddress, ZeroAddress, ZeroAddress, 0, "0x00", "0x00")).to.not.reverted
        })
    })
    describe('# supportsInterface', () => {
        it('Should return true if interfaceId is ERC1155TokenReceiver', async () => {
            const ERC1155TokenReceiverIdentifier = "0x4e2312e0"
            expect(await getTokenFacet.supportsInterface(ERC1155TokenReceiverIdentifier)).to.be.true
            expect(await getTokenDiamond.supportsInterface(ERC1155TokenReceiverIdentifier)).to.be.true
        })
        it('Should return true if interfaceId is ERC721TokenReceiver', async () => {
            const ERC721TokenReceiverIdentifier = "0x150b7a02"
            expect(await getTokenFacet.supportsInterface(ERC721TokenReceiverIdentifier)).to.be.true
            expect(await getTokenDiamond.supportsInterface(ERC721TokenReceiverIdentifier)).to.be.true
        })
    })
})