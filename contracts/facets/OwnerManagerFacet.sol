// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import { LibMultiSigStorage } from "../libraries/LibMultiSigStorage.sol";

contract OwnerManagerFacet {

    address internal constant SENTINEL_OWNERS = address(0x1);
    address internal immutable self;

    error CallerNotSelf();
    error InvalidCallRoute();
    error AlreadySetup();
    error OwnerLengthTooShort();
    error InvalidOwnerAddress();
    error DuplicateOwner();
    error InvalidPreviousOwner();
    error InvalidThreshold();
    error ZeroThreshold();

    event OwnerAdded(address newOwner);
    event OwnerRemoved(address removedOwner);
    event ThresholdChanged(uint256 newThreshold);

    constructor() {
        self = address(this);
    }

    function setupOwners(address[] calldata _owners, uint256 _threshold) external {
        require(address(this) != self, InvalidCallRoute());

        LibMultiSigStorage.MultiSigStorage storage ds = LibMultiSigStorage.multiSigStorage();
        
        require(ds.threshold == 0, AlreadySetup());
        require(_owners.length >= _threshold, OwnerLengthTooShort());
        require(_threshold != 0, InvalidThreshold());

        address currentOwner = SENTINEL_OWNERS;
        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];

            require(owner != address(0) && owner != SENTINEL_OWNERS && owner != address(this) && currentOwner != owner, InvalidOwnerAddress());
            require(ds.owners[owner] == address(0), DuplicateOwner());

            ds.owners[currentOwner] = owner;
            currentOwner = owner;
        }

        ds.owners[currentOwner] = SENTINEL_OWNERS;
        ds.ownerCount = _owners.length;
        ds.threshold = _threshold;
    }
    
    function addOwner(address newOwner) external {
        LibMultiSigStorage.MultiSigStorage storage ds = LibMultiSigStorage.multiSigStorage();

        require(msg.sender == address(this), CallerNotSelf());
        require(newOwner != address(0) && newOwner != SENTINEL_OWNERS && newOwner != address(this), InvalidOwnerAddress());
        
        ds.owners[newOwner] = ds.owners[SENTINEL_OWNERS];
        ds.owners[SENTINEL_OWNERS] = newOwner;
        ds.ownerCount++;

        emit OwnerAdded(newOwner);
    }

    function removeOwner(address prevOwner, address owner) external {
        LibMultiSigStorage.MultiSigStorage storage ds = LibMultiSigStorage.multiSigStorage();

        require(msg.sender == address(this), CallerNotSelf());
        require(owner != address(0) && owner != SENTINEL_OWNERS, InvalidOwnerAddress());
        require(ds.owners[prevOwner] == owner, InvalidPreviousOwner());
        require(ds.ownerCount - 1 >= ds.threshold, OwnerLengthTooShort());

        ds.owners[prevOwner] = ds.owners[owner];
        ds.owners[owner] = address(0);
        ds.ownerCount--;

        emit OwnerRemoved(owner);
    }

    function changeThreshold(uint _threshold) external {
        LibMultiSigStorage.MultiSigStorage storage ds = LibMultiSigStorage.multiSigStorage();

        require(msg.sender == address(this), CallerNotSelf());

        require(_threshold <= ds.ownerCount, InvalidThreshold());
        require(_threshold > 0, ZeroThreshold());

        ds.threshold = _threshold;

        emit ThresholdChanged(_threshold);
    }

    function getOwners() external view returns (address[] memory owners) {
        LibMultiSigStorage.MultiSigStorage storage ds = LibMultiSigStorage.multiSigStorage();

        owners = new address[](ds.ownerCount);

        uint256 index = 0;
        address currentOwner = ds.owners[SENTINEL_OWNERS];
        while (currentOwner != SENTINEL_OWNERS) {
            owners[index] = currentOwner;
            currentOwner = ds.owners[currentOwner];
            index++;
        }
    }

    function isOwner(address _owner) external view returns (bool) {
        return (LibMultiSigStorage.multiSigStorage().owners[_owner] != address(0) && _owner != SENTINEL_OWNERS);
    }
}