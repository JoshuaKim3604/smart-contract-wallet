
import { ethers } from 'hardhat'
import { facetFixture } from './utils/fixtures/facets'
import { diamondFixture, diamondAsFacetFixture } from './utils/fixtures/diamond'
import { Signer } from 'ethers'
import { getSelectors, getSalt } from './utils/helpers'
import { Diamond, DiamondCutFacet, DiamondLoupeFacet, GetTokenFacet, MultiSigVerifyAndExecuteFacet, NativeCoinTransferFacet, OwnerManagerFacet, TestFacet, Test2Facet, TokenTransferFacet, Test3Facet } from '../typechain-types'
import { expect } from 'chai'

describe('=> DiamondLoupeFacet', () => {
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
        let salt = getSalt()
    })
    describe('# facets', () => {
        it("Should return facets in Diamond", async () => {

            const facetList = [
                [
                    await diamondCutFacet.getAddress(),
                    [
                        diamondCutDiamond.interface.getFunction("diamondCut").selector
                    ]
                ],
                [
                    await diamondLoupeFacet.getAddress(),
                    [
                        diamondLoupeDiamond.interface.getFunction("facets").selector,
                        diamondLoupeDiamond.interface.getFunction("facetFunctionSelectors").selector,
                        diamondLoupeDiamond.interface.getFunction("facetAddresses").selector,
                        diamondLoupeDiamond.interface.getFunction("facetAddress").selector
                    ]
                ],
                [
                    await getTokenFacet.getAddress(),
                    [
                        getTokenDiamond.interface.getFunction("onERC1155Received").selector,
                        getTokenDiamond.interface.getFunction("onERC1155BatchReceived").selector,
                        getTokenDiamond.interface.getFunction("onERC721Received").selector,
                        getTokenDiamond.interface.getFunction("tokensReceived").selector,
                        getTokenDiamond.interface.getFunction("supportsInterface").selector
                    ]
                ],
                [
                    await multiSigVerifyAndExecuteFacet.getAddress(),
                    [
                        multiSigVerifyAndExecuteDiamond.interface.getFunction("verifyExecute").selector,
                        multiSigVerifyAndExecuteDiamond.interface.getFunction("getNonce").selector
                    ]
                ],
                [
                    await nativeCoinTransferFacet.getAddress(),
                    [
                        nativeCoinTransferDiamond.interface.getFunction("transferNativeCoin").selector
                    ]
                ],
                [
                    await ownerManagerFacet.getAddress(),
                    [
                        ownerManagerDiamond.interface.getFunction("setupOwners").selector,
                        ownerManagerDiamond.interface.getFunction("addOwner").selector,
                        ownerManagerDiamond.interface.getFunction("removeOwner").selector,
                        ownerManagerDiamond.interface.getFunction("changeThreshold").selector,
                        ownerManagerDiamond.interface.getFunction("getOwners").selector,
                        ownerManagerDiamond.interface.getFunction("isOwner").selector
                    ]
                ],
                [
                    await tokenTransferFacet.getAddress(),
                    [
                        tokenTransferDiamond.interface.getFunction("createProposal").selector,
                        tokenTransferDiamond.interface.getFunction("voteProposal").selector,
                        tokenTransferDiamond.interface.getFunction("executeProposal").selector,
                        tokenTransferDiamond.interface.getFunction("getProposalNonce").selector,
                    ]
                ]
            ]

            const facet = await(await diamondLoupeDiamond.facets())

        expect(facet).to.deep.equal(facetList);

        })
        describe("# facetAddresses", () => {
            it("Should return facetAddress", async () => {

                const facetAddressList = [
                    await diamondCutFacet.getAddress(),
                    await diamondLoupeFacet.getAddress(),
                    await getTokenFacet.getAddress(),
                    await multiSigVerifyAndExecuteFacet.getAddress(),
                    await nativeCoinTransferFacet.getAddress(),
                    await ownerManagerFacet.getAddress(),
                    await tokenTransferFacet.getAddress()
                ]
                expect(await diamondLoupeDiamond.facetAddresses()).to.deep.equal(facetAddressList)
            })
        })
        describe("# facetFunctionSelectors", () => {
            it("Should return selectors",async () => {
                const facetSelectors = await getSelectors(diamondCutFacet)
                expect(await diamondLoupeDiamond.facetFunctionSelectors(await diamondCutFacet.getAddress())).to.deep.equal(facetSelectors)
            })
        })
        describe("# facetAddress", () => {
            it("Should return facet address",async () => {
                const facetAddress = await getSelectors(diamondCutFacet)[0]

                expect(await diamondLoupeDiamond.facetAddress(facetAddress)).to.equal(await diamondCutFacet.getAddress())
            })
        })
    })
})