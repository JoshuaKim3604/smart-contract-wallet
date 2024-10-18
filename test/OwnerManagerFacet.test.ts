import { ethers } from 'hardhat'
import { facetFixture, testFacetFixture, test2FacetFixture, test3FacetFixture } from './utils/fixtures/facets'
import { diamondFixture, diamondAsFacetFixture } from './utils/fixtures/diamond'
import { Signer, ZeroAddress } from 'ethers'
import { diamondCut, generateOperationHash, getSelectors, signMsgHash, FacetCutAction, encodeDiamondCut, getNonce, OneAddress } from './utils/helpers'
import { Diamond, DiamondCutFacet, DiamondLoupeFacet, GetTokenFacet, MultiSigVerifyAndExecuteFacet, NativeCoinTransferFacet, OwnerManagerFacet, TestFacet, Test2Facet, TokenTransferFacet, Test3Facet } from '../typechain-types'
import { expect } from 'chai'

describe('=> OwnerManagerFacet', () => {
    let diamondCutFacet: DiamondCutFacet
    let diamondLoupeFacet: DiamondLoupeFacet
    let getTokenFacet: GetTokenFacet
    let multiSigVerifyAndExecuteFacet: MultiSigVerifyAndExecuteFacet
    let nativeCoinTransferFacet: NativeCoinTransferFacet
    let ownerManagerFacet: OwnerManagerFacet
    let tokenTransferFacet: TokenTransferFacet
    let testFacet: TestFacet
    let test2Facet: Test2Facet
    let test3Facet: Test3Facet

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

        ({
            testFacet
        } = await testFacetFixture());

        ({
            test2Facet
        } = await test2FacetFixture());

        ({
            test3Facet
        } = await test3FacetFixture());

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
        let nonce = await getNonce(multiSigVerifyAndExecuteDiamond)

        const cut = diamondCut(await test2Facet.getAddress(), FacetCutAction.Add, getSelectors(test2Facet))
        const diamondCutCalldata = encodeDiamondCut(cut, ZeroAddress, "0x00")
        const { operationHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), diamondCutCalldata, nonce)
        const { signers, signatures } = await signMsgHash(ownerList, operationHash)
        await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(signers, signatures, diamondCutCalldata, nonce)).to.emit(diamondCutDiamond, "DiamondCut")
    })

    describe('# setupOwners', () => {
        it("Should revert if called directly not using delegatecall", async () => {
            await expect(ownerManagerFacet.setupOwners(ownerList, threshold)).to.be.revertedWithCustomError(ownerManagerDiamond, "InvalidCallRoute")
        })
        it("Should revert if called twice", async () => {
            const setupOwnersCalldata = ownerManagerFacet.interface.encodeFunctionData('setupOwners', [ownerAddressList, threshold])

            const { operationHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), setupOwnersCalldata, await getNonce(multiSigVerifyAndExecuteDiamond))
            const { signers, signatures } = await signMsgHash(ownerList, operationHash)

            await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(signers, signatures, setupOwnersCalldata, await getNonce(multiSigVerifyAndExecuteDiamond))).to.be.revertedWithCustomError(ownerManagerDiamond, "AlreadySetup")
        })
        it("Should revert if owner length is smaller than threshold", async () => {
            const invalidThreshold = 100

            await expect(diamondFixture(
                diamondCutFacet,
                diamondLoupeFacet,
                getTokenFacet,
                multiSigVerifyAndExecuteFacet,
                nativeCoinTransferFacet,
                ownerManagerFacet,
                tokenTransferFacet,
                ownerAddressList,
                invalidThreshold
            )).to.be.revertedWithCustomError(ownerManagerDiamond, "OwnerLengthTooShort")
        })
        it("Should revert if duplicate owner exists", async () => {
            const invalidOwnerList = [await owner1.getAddress(), await owner2.getAddress(), await owner1.getAddress()]
            const customThreshold = 3

            await expect(diamondFixture(
                diamondCutFacet,
                diamondLoupeFacet,
                getTokenFacet,
                multiSigVerifyAndExecuteFacet,
                nativeCoinTransferFacet,
                ownerManagerFacet,
                tokenTransferFacet,
                invalidOwnerList,
                customThreshold
            )).to.be.revertedWithCustomError(ownerManagerDiamond, "DuplicateOwner")
        })
        it("Should set owners", async () => {
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
                ownerManagerDiamond,
            } = await diamondAsFacetFixture(diamond));

            expect(await ownerManagerDiamond.getOwners()).to.deep.equal(ownerAddressList)
            for (const owner of ownerAddressList) {
                expect(await ownerManagerDiamond.isOwner(owner)).to.be.true
            }
        })
    })
    describe('# addOwner', () => {
        it('Should revert if not called by self -> could be done through multi-sig', async () => {
            await expect(ownerManagerDiamond.addOwner(await user1.getAddress())).to.be.revertedWithCustomError(ownerManagerDiamond,'CallerNotSelf')
        })
        it('Should revert if new owner is zero address', async () => {
            const addOwnerCalldata = ownerManagerFacet.interface.encodeFunctionData('addOwner', [ZeroAddress])

            const { operationHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), addOwnerCalldata, await getNonce(multiSigVerifyAndExecuteDiamond))
            const { signers, signatures } = await signMsgHash(ownerList, operationHash)

            await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(signers, signatures, addOwnerCalldata, await getNonce(multiSigVerifyAndExecuteDiamond))).to.be.revertedWithCustomError(ownerManagerDiamond, "InvalidOwnerAddress")
        })
        it('Should revert if new owner is sentinel owner', async () => {
            const addOwnerCalldata = ownerManagerFacet.interface.encodeFunctionData('addOwner', [OneAddress])

            const { operationHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), addOwnerCalldata, await getNonce(multiSigVerifyAndExecuteDiamond))
            const { signers, signatures } = await signMsgHash(ownerList, operationHash)

            await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(signers, signatures, addOwnerCalldata, await getNonce(multiSigVerifyAndExecuteDiamond))).to.be.revertedWithCustomError(ownerManagerDiamond, "InvalidOwnerAddress")
        })
        it('Should revert if new owner is self', async () => {
            const addOwnerCalldata = ownerManagerFacet.interface.encodeFunctionData('addOwner', [await ownerManagerDiamond.getAddress()])

            const { operationHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), addOwnerCalldata, await getNonce(multiSigVerifyAndExecuteDiamond))
            const { signers, signatures } = await signMsgHash(ownerList, operationHash)

            await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(signers, signatures, addOwnerCalldata, await getNonce(multiSigVerifyAndExecuteDiamond))).to.be.revertedWithCustomError(ownerManagerDiamond, "InvalidOwnerAddress")
        })
        it('Should add new owner', async () => {
            const addOwnerCalldata = ownerManagerFacet.interface.encodeFunctionData('addOwner', [await user1.getAddress()])

            const { operationHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), addOwnerCalldata, await getNonce(multiSigVerifyAndExecuteDiamond))
            const { signers, signatures } = await signMsgHash(ownerList, operationHash)

            await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(signers, signatures, addOwnerCalldata, await getNonce(multiSigVerifyAndExecuteDiamond))).to.emit(ownerManagerDiamond, "OwnerAdded")
            expect(await ownerManagerDiamond.isOwner(await user1.getAddress())).to.be.true
        })
        it('Should emit event', async () => {

        })
    })
    describe('# removeOwner', () => {
        it("Should revert if not called by self -> could be done through multi-sig", async () => {
            await expect(ownerManagerDiamond.removeOwner(ownerAddressList[0], ownerAddressList[1])).to.be.revertedWithCustomError(ownerManagerDiamond,'CallerNotSelf')
        })
        it("Should provide valid previous entity for sentinel list", async () => {
            const removeOwnerCalldata = ownerManagerFacet.interface.encodeFunctionData('removeOwner', [ownerAddressList[4], ownerAddressList[1]])

            const { operationHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), removeOwnerCalldata, await getNonce(multiSigVerifyAndExecuteDiamond))
            const { signers, signatures } = await signMsgHash(ownerList, operationHash)

            await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(signers, signatures, removeOwnerCalldata, await getNonce(multiSigVerifyAndExecuteDiamond))).to.be.revertedWithCustomError(ownerManagerDiamond, "InvalidPreviousOwner")
        })
        it("Should revert if zero address", async () => {
            const removeOwnerCalldata = ownerManagerFacet.interface.encodeFunctionData('removeOwner', [ownerAddressList[4], ZeroAddress])

            const { operationHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), removeOwnerCalldata, await getNonce(multiSigVerifyAndExecuteDiamond))
            const { signers, signatures } = await signMsgHash(ownerList, operationHash)

            await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(signers, signatures, removeOwnerCalldata, await getNonce(multiSigVerifyAndExecuteDiamond))).to.be.revertedWithCustomError(ownerManagerDiamond, "InvalidOwnerAddress")
        })
        it("Should revert if one address", async () => {
            const removeOwnerCalldata = ownerManagerFacet.interface.encodeFunctionData('removeOwner', [ownerAddressList[4], OneAddress])

            const { operationHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), removeOwnerCalldata, await getNonce(multiSigVerifyAndExecuteDiamond))
            const { signers, signatures } = await signMsgHash(ownerList, operationHash)

            await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(signers, signatures, removeOwnerCalldata, await getNonce(multiSigVerifyAndExecuteDiamond))).to.be.revertedWithCustomError(ownerManagerDiamond, "InvalidOwnerAddress")
        })
        it("Should revert if threshold is bigger than deducted owner count", async () => {
            const tightThreshold = ownerAddressList.length
            diamond = await diamondFixture(
                diamondCutFacet,
                diamondLoupeFacet,
                getTokenFacet,
                multiSigVerifyAndExecuteFacet,
                nativeCoinTransferFacet,
                ownerManagerFacet,
                tokenTransferFacet,
                ownerAddressList,
                tightThreshold
            );

            ({
                ownerManagerDiamond,
                multiSigVerifyAndExecuteDiamond
            } = await diamondAsFacetFixture(diamond));

            const removeOwnerCalldata = ownerManagerFacet.interface.encodeFunctionData('removeOwner', [ownerAddressList[0], ownerAddressList[1]])

            const { operationHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), removeOwnerCalldata, await getNonce(multiSigVerifyAndExecuteDiamond))
            const { signers, signatures } = await signMsgHash(ownerList, operationHash)

            await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(signers, signatures, removeOwnerCalldata, await getNonce(multiSigVerifyAndExecuteDiamond))).to.be.revertedWithCustomError(ownerManagerDiamond, "OwnerLengthTooShort")
        })
        it("Should remove owner", async () => {
            const ownerToBeRemoved = ownerAddressList[1]
            const removeOwnerCalldata = ownerManagerFacet.interface.encodeFunctionData('removeOwner', [ownerAddressList[0], ownerToBeRemoved])

            const { operationHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), removeOwnerCalldata, await getNonce(multiSigVerifyAndExecuteDiamond))
            const { signers, signatures } = await signMsgHash(ownerList, operationHash)

            expect(await ownerManagerDiamond.isOwner(ownerToBeRemoved)).to.be.true
            await multiSigVerifyAndExecuteDiamond.verifyExecute(signers, signatures, removeOwnerCalldata, await getNonce(multiSigVerifyAndExecuteDiamond))
            expect(await ownerManagerDiamond.isOwner(ownerToBeRemoved)).to.be.false
        })
        it('Should emit event', async () => {
            const ownerToBeRemoved = ownerAddressList[1]
            const removeOwnerCalldata = ownerManagerFacet.interface.encodeFunctionData('removeOwner', [ownerAddressList[0], ownerToBeRemoved])

            const { operationHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), removeOwnerCalldata, await getNonce(multiSigVerifyAndExecuteDiamond))
            const { signers, signatures } = await signMsgHash(ownerList, operationHash)

            await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(signers, signatures, removeOwnerCalldata, await getNonce(multiSigVerifyAndExecuteDiamond))).to.emit(ownerManagerDiamond, "OwnerRemoved").withArgs(ownerAddressList[1])
        })
    })
})