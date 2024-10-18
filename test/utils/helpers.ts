import { Signer, concat, getBytes, keccak256, toBeArray, toUtf8Bytes } from "ethers"
import { ethers } from "hardhat"
import { DiamondCutFacet__factory, MultiSigVerifyAndExecuteFacet, NativeCoinTransferFacet__factory, TokenTransferFacet__factory } from "../../typechain-types"
import { start } from "repl"

export const OneAddress = "0x0000000000000000000000000000000000000001"

export const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 }

export const diamondCut = (facetAddress: string, action: any, selectors: any) => {
    const diamondCut = []
    diamondCut.push({
        facetAddress: facetAddress,
        action: action,
        functionSelectors: Array.isArray(selectors) ? selectors : getSelectors(selectors)
    })
    return diamondCut
}

export const generateOperationHash = (chainId: string, diamondAddress: string, calldata: string, salt: number | bigint) => {
    const abiCoder = ethers.AbiCoder.defaultAbiCoder()
    const encodedData = abiCoder.encode(
        ["uint256", "address", "bytes", "uint256"],
        [chainId, diamondAddress, calldata, salt.toString()]
    )
    const operationHash = keccak256(concat([encodedData]))

    const prefix = toUtf8Bytes("\x19Ethereum Signed Message:\n32")

    // Concatenate the prefix with operationHash and hash it
    const msgHash = keccak256(concat([prefix, getBytes(operationHash)]))

    return { operationHash, msgHash }
}

export const signMsgHash = async (owners: Array<Signer>, msgHash: string) => {
    const signers = []
    const signatures = []
    for (const owner of owners) {
        signers.push(await owner.getAddress())
        signatures.push((await owner.signMessage(toBeArray(msgHash))).toString())
    }

    return { signers, signatures }
}

export const getSelectors = (contract: any) => {
    let selectors = []
    for (const fragments of contract.interface.fragments) {
        if (fragments.type == 'function') {
            selectors.push(contract.interface.getFunction(fragments.name).selector.toString())
        }
    }

    return selectors
}

export const encodeDiamondCut = (cut: any, init: string, initData: string) => {
    const diamondCutFacet = new ethers.Interface(DiamondCutFacet__factory.abi)

    return diamondCutFacet.encodeFunctionData("diamondCut", [cut, init, initData])
}

export const encodeTransferNativeCoin = (to: string, value: number) => {
    const nativeCoinTransferFacet = new ethers.Interface(NativeCoinTransferFacet__factory.abi)

    return nativeCoinTransferFacet.encodeFunctionData("transferNativeCoin", [to, value])
}

export const encodeTransferToken = (
        to: string,
        token: string,
        proposer: string,
        data: number,
        nonce: string,
        forCount: number,
        againstCount: number,
        startTime: number,
        duration: number,
        chainId: number,
        isExecuted: boolean,
        isNFT: boolean
    ) => {
    const nativeCoinTransferFacet = new ethers.Interface(TokenTransferFacet__factory.abi)

    return nativeCoinTransferFacet.encodeFunctionData("createProposal", [to, token, proposer, data, nonce, forCount, againstCount, startTime, duration, chainId, isExecuted, isNFT])
}

export const getSalt = () => {
    return Math.floor(Math.random() * (Math.floor(1e10) - Math.ceil(0) + 1)) + Math.ceil(0)
}

export const fund = async (address: string, balance: string ="0x1000000000000000000000") => {
    await ethers.provider.send("hardhat_setBalance", [
        address,
        balance
    ])
}

export const getNonce = async (multiSigVerifyAndExecuteFacet: MultiSigVerifyAndExecuteFacet) => {
    return await multiSigVerifyAndExecuteFacet.getNonce()
}

export const increaseTime = async (duration: string | number) => {
    await ethers.provider.send("evm_increaseTime", [duration])
    await ethers.provider.send("evm_mine", [])
}