import { ethers } from 'hardhat'
import type {
Diamond,
    DiamondCutFacet,
    DiamondLoupeFacet,
    GetTokenFacet,
    MultiSigVerifyAndExecuteFacet,
    NativeCoinTransferFacet,
    OwnerManagerFacet,
    TokenTransferFacet
} from "../../../typechain-types"

export const diamondFixture = async (
    diamondCutFacet: DiamondCutFacet,
    diamondLoupeFacet: DiamondLoupeFacet,
    getTokenFacet: GetTokenFacet,
    multiSigVerifyAndExecuteFacet: MultiSigVerifyAndExecuteFacet,
    nativeCoinTransferFacet: NativeCoinTransferFacet,
    ownerManagerFacet: OwnerManagerFacet,
    tokenTransferFacet: TokenTransferFacet,
    ownerAddresses: string[],
    threshold: number
) => {

    const factory = await ethers.getContractFactory("Diamond")
    return (await factory.deploy(
        await diamondCutFacet.getAddress(),
        await diamondLoupeFacet.getAddress(),
        await getTokenFacet.getAddress(),
        await multiSigVerifyAndExecuteFacet.getAddress(),
        await nativeCoinTransferFacet.getAddress(),
        await ownerManagerFacet.getAddress(),
        await tokenTransferFacet.getAddress(),
        ownerAddresses,
        threshold
    ))
}

export const diamondAsFacetFixture = async (
    diamond: Diamond
) => {
    const diamondAddress = await diamond.getAddress()
    const diamondCutDiamond = await ethers.getContractAt("DiamondCutFacet", diamondAddress)
    const diamondLoupeDiamond = await ethers.getContractAt("DiamondLoupeFacet", diamondAddress)
    const getTokenDiamond = await ethers.getContractAt("GetTokenFacet", diamondAddress)
    const multiSigVerifyAndExecuteDiamond = await ethers.getContractAt("MultiSigVerifyAndExecuteFacet", diamondAddress)
    const nativeCoinTransferDiamond = await ethers.getContractAt("NativeCoinTransferFacet", diamondAddress)
    const ownerManagerDiamond = await ethers.getContractAt("OwnerManagerFacet", diamondAddress)
    const tokenTransferDiamond = await ethers.getContractAt("TokenTransferFacet", diamondAddress)

    return {
        diamondCutDiamond,
        diamondLoupeDiamond,
        getTokenDiamond,
        multiSigVerifyAndExecuteDiamond,
        nativeCoinTransferDiamond,
        ownerManagerDiamond,
        tokenTransferDiamond
    }

}