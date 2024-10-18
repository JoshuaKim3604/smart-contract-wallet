import { ethers } from 'hardhat'
import { facetFixture, testFacetFixture } from './utils/fixtures/facets'
import { diamondFixture, diamondAsFacetFixture } from './utils/fixtures/diamond'
import { Signer } from 'ethers'
import { generateOperationHash, signMsgHash, fund, getNonce, encodeTransferNativeCoin } from './utils/helpers'
import { Diamond, DiamondCutFacet, DiamondLoupeFacet, GetTokenFacet, MultiSigVerifyAndExecuteFacet, NativeCoinTransferFacet, OwnerManagerFacet, TestFacet, TokenTransferFacet } from '../typechain-types'
import { expect } from 'chai'

describe('=> MultiSigVerifyAndExecuteFacet', () => {
    let diamondCutFacet: DiamondCutFacet
    let diamondLoupeFacet: DiamondLoupeFacet
    let getTokenFacet: GetTokenFacet
    let multiSigVerifyAndExecuteFacet: MultiSigVerifyAndExecuteFacet
    let nativeCoinTransferFacet: NativeCoinTransferFacet
    let ownerManagerFacet: OwnerManagerFacet
    let tokenTransferFacet: TokenTransferFacet
    let testFacet: TestFacet

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

    let user1: Signer;

    before(async () => {
        [owner1, owner2, owner3, owner4, owner5, user1] = await ethers.getSigners();

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
            testFacet
        } = await testFacetFixture());

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

    describe("# verifyExecute", () => {
        it("Should transfer native coin", async () => {
            await fund(await nativeCoinTransferDiamond.getAddress())

            const transferCalldata = encodeTransferNativeCoin(await testFacet.getAddress(), 10)

            const { operationHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), transferCalldata, Number(await multiSigVerifyAndExecuteDiamond.getNonce()))

            const { signers, signatures } = await signMsgHash(ownerList, operationHash)

            await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(signers, signatures, transferCalldata, Number(await getNonce(multiSigVerifyAndExecuteDiamond)))).to.emit(nativeCoinTransferDiamond, "NativeCoinTransferred")
            expect(await ethers.provider.getBalance(await testFacet.getAddress())).to.equal(10)
        })
        it("Should revert if nonce is invalid", async () => {
            await fund(await nativeCoinTransferDiamond.getAddress())

            const transferCalldata = encodeTransferNativeCoin(await owner1.getAddress(), 10)

            const { operationHash, msgHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), transferCalldata, Number(await multiSigVerifyAndExecuteDiamond.getNonce()))

            const { signers, signatures } = await signMsgHash(ownerList, operationHash)

            await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(signers, signatures, transferCalldata, Number(await getNonce(multiSigVerifyAndExecuteDiamond)) + 1)).to.revertedWithCustomError(multiSigVerifyAndExecuteDiamond, "InvalidNonce")
        })
        it("Should revert if signer length is smaller than threshold", async () => {
            await fund(await nativeCoinTransferDiamond.getAddress())

            const transferCalldata = encodeTransferNativeCoin(await owner1.getAddress(), 10)

            const { operationHash, msgHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), transferCalldata, Number(await multiSigVerifyAndExecuteDiamond.getNonce()))

            const { signers, signatures } = await signMsgHash(ownerList, operationHash)

            const modifiedSigners = [signers[0], signers[1]]
            const modifiedSignatures = [signatures[0], signatures[0]]

            await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(modifiedSigners, modifiedSignatures, transferCalldata, Number(await getNonce(multiSigVerifyAndExecuteDiamond)))).to.revertedWithCustomError(multiSigVerifyAndExecuteDiamond, "InvalidSignerLength")
        })
        it("Should revert if length of signer and signature is different", async () => {
            await fund(await nativeCoinTransferDiamond.getAddress())

            const transferCalldata = encodeTransferNativeCoin(await owner1.getAddress(), 10)

            const { operationHash, msgHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), transferCalldata, Number(await multiSigVerifyAndExecuteDiamond.getNonce()))

            const ownerAddresses = [await owner1.getAddress(), await owner2.getAddress()]
            
            const { signers, signatures } = await signMsgHash(ownerList, operationHash)

            await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(ownerAddresses, signatures, transferCalldata, Number(await getNonce(multiSigVerifyAndExecuteDiamond)))).to.be.revertedWithCustomError(multiSigVerifyAndExecuteDiamond, "InvalidSignerAndSignatureLength")
        })
    })
    
})