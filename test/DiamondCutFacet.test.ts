import { ethers } from 'hardhat'
import { facetFixture, testFacetFixture, test2FacetFixture, test3FacetFixture } from './utils/fixtures/facets'
import { diamondFixture, diamondAsFacetFixture } from './utils/fixtures/diamond'
import { Signer, ZeroAddress } from 'ethers'
import { diamondCut, generateOperationHash, getSelectors, signMsgHash, FacetCutAction, encodeDiamondCut, fund, getNonce } from './utils/helpers'
import { Diamond, DiamondCutFacet, DiamondLoupeFacet, GetTokenFacet, MultiSigVerifyAndExecuteFacet, NativeCoinTransferFacet, OwnerManagerFacet, TestFacet, Test2Facet, TokenTransferFacet, Test3Facet } from '../typechain-types'
import { expect } from 'chai'

describe('=> DiamondCutFacet', () => {
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

        const cut = diamondCut(await test2Facet.getAddress(), FacetCutAction.Add, getSelectors(test2Facet))
        const diamondCutCalldata = encodeDiamondCut(cut, ZeroAddress, "0x00")
        const { operationHash, msgHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), diamondCutCalldata, Number(await getNonce(multiSigVerifyAndExecuteDiamond)))
        const { signers, signatures } = await signMsgHash(ownerList, operationHash)
        await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(signers, signatures, diamondCutCalldata, Number(await getNonce(multiSigVerifyAndExecuteDiamond)))).to.emit(diamondCutDiamond, "DiamondCut")
    })
    describe('# diamondCut', () => {
        it('Should cut facet(Add) for diamond', async () => {

            const cut = diamondCut(await testFacet.getAddress(), FacetCutAction.Add, getSelectors(testFacet))
            const diamondCutCalldata = encodeDiamondCut(cut, ZeroAddress, "0x00")
            const { operationHash, msgHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), diamondCutCalldata, Number(await getNonce(multiSigVerifyAndExecuteDiamond)))
            const { signers, signatures } = await signMsgHash(ownerList, operationHash)

            await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(signers, signatures, diamondCutCalldata, Number(await getNonce(multiSigVerifyAndExecuteDiamond)))).to.emit(diamondCutDiamond, "DiamondCut")

            expect(await diamondLoupeDiamond.facetFunctionSelectors(await testFacet.getAddress())).to.deep.equal(getSelectors(testFacet))
        })
        it('Should cut facet(Remove) for diamond', async () => {
            expect(await diamondLoupeDiamond.facetFunctionSelectors(await test2Facet.getAddress())).to.deep.equal(getSelectors(test2Facet))
            const cut = diamondCut(ZeroAddress, FacetCutAction.Remove, getSelectors(test2Facet))
            const diamondCutCalldata = encodeDiamondCut(cut, ZeroAddress, "0x00")
            const { operationHash, msgHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), diamondCutCalldata, Number(await getNonce(multiSigVerifyAndExecuteDiamond)))
            const { signers, signatures } = await signMsgHash(ownerList, operationHash)

            await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(signers, signatures, diamondCutCalldata, Number(await getNonce(multiSigVerifyAndExecuteDiamond)))).to.emit(diamondCutDiamond, "DiamondCut")

            expect(await diamondLoupeDiamond.facetFunctionSelectors(await test2Facet.getAddress())).to.deep.equal([])
        })
    
        it('Should cut facet(Replace) for diamond', async () => {

            const cut = diamondCut(await test3Facet.getAddress(), FacetCutAction.Replace, getSelectors(test3Facet))
            const diamondCutCalldata = encodeDiamondCut(cut, ZeroAddress, "0x00")
            const { operationHash, msgHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), diamondCutCalldata, Number(await getNonce(multiSigVerifyAndExecuteDiamond)))
            const { signers, signatures } = await signMsgHash(ownerList, operationHash)

            await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(signers, signatures, diamondCutCalldata, Number(await getNonce(multiSigVerifyAndExecuteDiamond)))).to.emit(diamondCutDiamond, "DiamondCut")

            expect(await diamondLoupeDiamond.facetAddress(getSelectors(test3Facet)[0])).to.equal(await test3Facet.getAddress())
        })
        it('Should revert if caller is not self', async () => {
            const cut = diamondCut(await testFacet.getAddress(), FacetCutAction.Add, getSelectors(testFacet))
            const diamondCutData = [cut, ZeroAddress, "0x00"]
            
            await expect(diamondCutFacet.diamondCut(cut, ZeroAddress, "0x00")).to.be.revertedWithCustomError(diamondCutFacet, "CallerNotSelf")
            
            await fund(ZeroAddress)
        })
        it('Should revert when facet does not have code', async () => {
            const cut = diamondCut(await owner1.getAddress(), FacetCutAction.Add, getSelectors(testFacet))
            const diamondCutCalldata = encodeDiamondCut(cut, ZeroAddress, "0x00")
            const { operationHash, msgHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), diamondCutCalldata, Number(await getNonce(multiSigVerifyAndExecuteDiamond)))
            const { signers, signatures } = await signMsgHash(ownerList, operationHash)

            await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(signers, signatures, diamondCutCalldata, Number(await getNonce(multiSigVerifyAndExecuteDiamond)))).to.be.revertedWith("LibDiamondCut: New facet has no code")
        })
        
        it('Should revert when initialization address does not have any code', async () => {
            const cut = diamondCut(await testFacet.getAddress(), FacetCutAction.Add, getSelectors(testFacet))
            const diamondCutCalldata = encodeDiamondCut(cut, ZeroAddress, await owner1.getAddress())
            const { operationHash, msgHash } = generateOperationHash(chainId.toString(), await diamond.getAddress(), diamondCutCalldata, Number(await getNonce(multiSigVerifyAndExecuteDiamond)))
            const { signers, signatures } = await signMsgHash(ownerList, operationHash)

            await expect(multiSigVerifyAndExecuteDiamond.verifyExecute(signers, signatures, diamondCutCalldata, Number(await getNonce(multiSigVerifyAndExecuteDiamond)))).to.emit(diamondCutDiamond, "DiamondCut")

            expect(await diamondLoupeDiamond.facetFunctionSelectors(await testFacet.getAddress())).to.be.revertedWith("Call Failed")
        })
    })
})