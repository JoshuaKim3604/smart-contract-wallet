import { ethers } from 'hardhat'
import { facetFixture } from './utils/fixtures/facets'
import { diamondFixture, diamondAsFacetFixture } from './utils/fixtures/diamond'
import { Signer } from 'ethers'
import { generateOperationHash, signMsgHash, fund, encodeTransferNativeCoin, getNonce, sortAddresses } from './utils/helpers'
import { Diamond, DiamondCutFacet, DiamondLoupeFacet, GetTokenFacet, MultiSigVerifyAndExecuteFacet, NativeCoinTransferFacet, OwnerManagerFacet, TokenTransferFacet } from '../typechain-types'
import { expect } from 'chai'

describe('=> NativeCoinTransferFacet', () => {
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

    let diamond: Diamond
    let threshold: number = 4
    let chainId: bigint

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

    it('Should transfer native coin with multiSig', async () => {
        await fund(await nativeCoinTransferDiamond.getAddress())

        const transferCalldata = encodeTransferNativeCoin(await owner1.getAddress(), 10)
        const { operationHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), transferCalldata, Number(await multiSigVerifyAndExecuteDiamond.getNonce()))

        const sortedSigners = await sortAddresses(ownerList)
        const { signers, signatures } = await signMsgHash(sortedSigners, operationHash)

        await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(signers, signatures, transferCalldata, Number(await getNonce(multiSigVerifyAndExecuteDiamond)))).to.emit(nativeCoinTransferDiamond, "NativeCoinTransferred")
    })
    it('Should revert if msg.sender is not address(this)', async () => {
        await fund(await nativeCoinTransferDiamond.getAddress())

        await expect(nativeCoinTransferDiamond.transferNativeCoin(await owner1.getAddress(), 100)).to.be.revertedWithCustomError(nativeCoinTransferDiamond, "CallerNotSelf")
    })
    it('Should revert if value is higher than balance', async () => {
        await fund(await nativeCoinTransferDiamond.getAddress(), "0x01")

        const transferCalldata = encodeTransferNativeCoin(await owner1.getAddress(), 10)
        const { operationHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), transferCalldata, Number(await multiSigVerifyAndExecuteDiamond.getNonce()))

        const sortedSigners = await sortAddresses(ownerList)
        const { signers, signatures } = await signMsgHash(sortedSigners, operationHash)

        await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(signers, signatures, transferCalldata, Number(await getNonce(multiSigVerifyAndExecuteDiamond)))).to.be.revertedWithCustomError(nativeCoinTransferDiamond, "BalanceNotSufficient")
    })
    it('Should fail if receipient contract does not have receive', async () => {
        await fund(await nativeCoinTransferDiamond.getAddress())

        const transferCalldata = encodeTransferNativeCoin(await tokenTransferFacet.getAddress(), 10)
        const { operationHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), transferCalldata, Number(await multiSigVerifyAndExecuteDiamond.getNonce()))

        const sortedSigners = await sortAddresses(ownerList)
        const { signers, signatures } = await signMsgHash(sortedSigners, operationHash)

        await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(signers, signatures, transferCalldata, Number(await getNonce(multiSigVerifyAndExecuteDiamond)))).to.be.revertedWithCustomError(nativeCoinTransferDiamond, "CallFailed")
    })

})