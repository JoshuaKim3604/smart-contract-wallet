// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {LibDiamond} from "./libraries/LibDiamond.sol";
import {IDiamondCutFacet} from "./interfaces/IDiamondCutFacet.sol";
import {IDiamondLoupeFacet} from "./interfaces/IDiamondLoupeFacet.sol";
import {IGetTokenFacet} from "./interfaces/IGetTokenFacet.sol";
import {IMultiSigVerifyAndExecuteFacet} from "./interfaces/IMultiSigVerifyAndExecuteFacet.sol";
import {INativeCoinTransferFacet} from "./interfaces/INativeCoinTransferFacet.sol";
import {IOwnerManagerFacet} from "./interfaces/IOwnerManagerFacet.sol";
import {ITokenTransferFacet} from "./interfaces/ITokenTransferFacet.sol";

contract Diamond {
    constructor(
        address _diamondCutFacet,
        address _diamondLoupeFacet,
        address _getTokenFacet,
        address _multiSigVerifyFacet,
        address _nativeCoinTransferFacet,
        address _ownerManagerFacet,
        address _tokenTransferFacet,
        address[] memory _ownerAddresses,
        uint256 _threshold
    ) payable {
        IDiamondCutFacet.FacetCut[]
            memory cut = new IDiamondCutFacet.FacetCut[](7);
        bytes4[] memory diamondCutFacetSelectors = new bytes4[](1);
        diamondCutFacetSelectors[0] = IDiamondCutFacet.diamondCut.selector;

        bytes4[] memory diamondLoupeFacetSelectors = new bytes4[](4);
        diamondLoupeFacetSelectors[0] = IDiamondLoupeFacet.facets.selector;
        diamondLoupeFacetSelectors[1] = IDiamondLoupeFacet
            .facetFunctionSelectors
            .selector;
        diamondLoupeFacetSelectors[2] = IDiamondLoupeFacet
            .facetAddresses
            .selector;
        diamondLoupeFacetSelectors[3] = IDiamondLoupeFacet
            .facetAddress
            .selector;

        bytes4[] memory getTokenFacetSelectors = new bytes4[](5);
        getTokenFacetSelectors[0] = IGetTokenFacet.onERC1155Received.selector;
        getTokenFacetSelectors[1] = IGetTokenFacet
            .onERC1155BatchReceived
            .selector;
        getTokenFacetSelectors[2] = IGetTokenFacet.onERC721Received.selector;
        getTokenFacetSelectors[3] = IGetTokenFacet.tokensReceived.selector;
        getTokenFacetSelectors[4] = IGetTokenFacet.supportsInterface.selector;

        bytes4[] memory multiSigVerifyAndExecuteFacetSelectors = new bytes4[](
            2
        );
        multiSigVerifyAndExecuteFacetSelectors[
            0
        ] = IMultiSigVerifyAndExecuteFacet.verifyExecute.selector;
        multiSigVerifyAndExecuteFacetSelectors[
            1
        ] = IMultiSigVerifyAndExecuteFacet.getNonce.selector;

        bytes4[] memory nativeCoinTransferFacetSelectors = new bytes4[](1);
        nativeCoinTransferFacetSelectors[0] = INativeCoinTransferFacet
            .transferNativeCoin
            .selector;

        bytes4[] memory ownerManagerFacetSelectors = new bytes4[](6);
        ownerManagerFacetSelectors[0] = IOwnerManagerFacet.setupOwners.selector;
        ownerManagerFacetSelectors[1] = IOwnerManagerFacet.addOwner.selector;
        ownerManagerFacetSelectors[2] = IOwnerManagerFacet.removeOwner.selector;
        ownerManagerFacetSelectors[3] = IOwnerManagerFacet
            .changeThreshold
            .selector;
        ownerManagerFacetSelectors[4] = IOwnerManagerFacet.getOwners.selector;
        ownerManagerFacetSelectors[5] = IOwnerManagerFacet.isOwner.selector;

        bytes4[] memory tokenTransferFacetSelectors = new bytes4[](4);
        tokenTransferFacetSelectors[0] = ITokenTransferFacet
            .createProposal
            .selector;
        tokenTransferFacetSelectors[1] = ITokenTransferFacet
            .voteProposal
            .selector;
        tokenTransferFacetSelectors[2] = ITokenTransferFacet
            .executeProposal
            .selector;
        tokenTransferFacetSelectors[3] = ITokenTransferFacet
            .getProposalNonce
            .selector;

        cut[0] = IDiamondCutFacet.FacetCut({
            facetAddress: _diamondCutFacet,
            action: IDiamondCutFacet.FacetCutAction.Add,
            functionSelectors: diamondCutFacetSelectors
        });

        cut[1] = IDiamondCutFacet.FacetCut({
            facetAddress: _diamondLoupeFacet,
            action: IDiamondCutFacet.FacetCutAction.Add,
            functionSelectors: diamondLoupeFacetSelectors
        });

        cut[2] = IDiamondCutFacet.FacetCut({
            facetAddress: _getTokenFacet,
            action: IDiamondCutFacet.FacetCutAction.Add,
            functionSelectors: getTokenFacetSelectors
        });

        cut[3] = IDiamondCutFacet.FacetCut({
            facetAddress: _multiSigVerifyFacet,
            action: IDiamondCutFacet.FacetCutAction.Add,
            functionSelectors: multiSigVerifyAndExecuteFacetSelectors
        });

        cut[4] = IDiamondCutFacet.FacetCut({
            facetAddress: _nativeCoinTransferFacet,
            action: IDiamondCutFacet.FacetCutAction.Add,
            functionSelectors: nativeCoinTransferFacetSelectors
        });

        cut[5] = IDiamondCutFacet.FacetCut({
            facetAddress: _ownerManagerFacet,
            action: IDiamondCutFacet.FacetCutAction.Add,
            functionSelectors: ownerManagerFacetSelectors
        });

        cut[6] = IDiamondCutFacet.FacetCut({
            facetAddress: _tokenTransferFacet,
            action: IDiamondCutFacet.FacetCutAction.Add,
            functionSelectors: tokenTransferFacetSelectors
        });

        LibDiamond.diamondCut(cut, address(0), "");

        (bool success, bytes memory returndata) = _ownerManagerFacet
            .delegatecall(
                abi.encodeWithSelector(
                    IOwnerManagerFacet.setupOwners.selector,
                    _ownerAddresses,
                    _threshold
                )
            );
        if (!success) {
            assembly {
                revert(add(returndata, 0x20), mload(returndata))
            }
        }
    }

    fallback() external payable {
        LibDiamond.DiamondStorage storage ds;
        bytes32 position = LibDiamond.DIAMOND_STORAGE_POSITION;

        assembly {
            ds.slot := position
        }

        address facet = ds.selectorToFacetAndPosition[msg.sig].facetAddress;
        require(facet != address(0), "Diamond: Function does not exist");

        assembly {
            calldatacopy(0, 0, calldatasize())

            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)

            returndatacopy(0, 0, returndatasize())

            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }
}
