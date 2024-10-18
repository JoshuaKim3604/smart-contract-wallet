import { ethers } from 'hardhat'
import type {
    DiamondCutFacet,
    DiamondLoupeFacet,
    GetTokenFacet,
    MultiSigVerifyAndExecuteFacet,
    NativeCoinTransferFacet,
    OwnerManagerFacet,
    TestFacet,
    Test2Facet,
    Test3Facet,
    TokenTransferFacet,
    TestERC20,
    TestERC721
} from "../../../typechain-types"

export const facetFixture = async () => {
    const diamondCutFacetFactory = await ethers.getContractFactory("DiamondCutFacet")
    const diamondCutFacet = await diamondCutFacetFactory.deploy() as DiamondCutFacet

    const diamondLoupeFacetFactory = await ethers.getContractFactory("DiamondLoupeFacet")
    const diamondLoupeFacet = await diamondLoupeFacetFactory.deploy() as DiamondLoupeFacet

    const getTokenFacetFactory = await ethers.getContractFactory("GetTokenFacet")
    const getTokenFacet = await getTokenFacetFactory.deploy() as GetTokenFacet

    const multiSigVerifyAndExecuteFacetFactory = await ethers.getContractFactory("MultiSigVerifyAndExecuteFacet")
    const multiSigVerifyAndExecuteFacet = await multiSigVerifyAndExecuteFacetFactory.deploy() as MultiSigVerifyAndExecuteFacet

    const nativeCoinTransferFacetFactoy = await ethers.getContractFactory("NativeCoinTransferFacet")
    const nativeCoinTransferFacet = await nativeCoinTransferFacetFactoy.deploy() as NativeCoinTransferFacet

    const ownerManagerFacetFactory = await ethers.getContractFactory("OwnerManagerFacet")
    const ownerManagerFacet = await ownerManagerFacetFactory.deploy() as OwnerManagerFacet

    const tokenTransferFacetFactory = await ethers.getContractFactory("TokenTransferFacet")
    const tokenTransferFacet = await tokenTransferFacetFactory.deploy() as TokenTransferFacet

    return { diamondCutFacet, diamondLoupeFacet, getTokenFacet, multiSigVerifyAndExecuteFacet, nativeCoinTransferFacet, ownerManagerFacet, tokenTransferFacet }
}

export const testFacetFixture = async () => {
    const testFacetFactory = await ethers.getContractFactory("TestFacet")
    const testFacet = (await testFacetFactory.deploy()) as TestFacet

    return { testFacet }
}

export const test2FacetFixture = async () => {
    const test2FacetFactory = await ethers.getContractFactory("Test2Facet")
    const test2Facet = (await test2FacetFactory.deploy()) as Test2Facet

    return { test2Facet }
}

export const test3FacetFixture = async () => {
    const test3FacetFactory = await ethers.getContractFactory("Test3Facet")
    const test3Facet = (await test3FacetFactory.deploy()) as Test3Facet

    return { test3Facet }
}

export const testERC20Fixture = async () => {
    const testERC20Factory = await ethers.getContractFactory("TestERC20")
    const testERC20 = (await testERC20Factory.deploy()) as TestERC20

    return { testERC20 }
}

export const testERC721Fixture = async () => {
    const testERC721Factory = await ethers.getContractFactory("TestERC721")
    const testERC721 = (await testERC721Factory.deploy()) as TestERC721

    return { testERC721 }
}