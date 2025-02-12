// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./GameContract.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

contract GameContractFactory is Ownable {
    using Clones for address;

    // Address of template game contract
    address private implementation;

    // Contract deployed array 
    address[] public contractListDeploy;

    // Signer list
    mapping(address => bool) private _signerMap;

    // Signer total
    uint256 private _signerTotal;

    // Game Contract deployed event
    event GameContractDeploy(address indexed owner, address indexed contractAddress);

    //  Add list Users
    event SignerListAdd(uint256 indexed totalAddedUser, uint256 indexed timestamp);

    // Remove list Users
    event SignerListRemove(uint256 indexed totalAddedUser, uint256 indexed timestamp);

    // Upgrade implementation
    event UpgradeImplementation(address indexed oldImplementation, address indexed upgradeImplementation);

    // Invalid User
    error InvalidUser();

    // Invalid Address
    error InvalidAddress();

    // Deploy fail
    error UnableToInitNewContract();

    // We only allow User have been add by owner
    modifier onlyUser() {
        if (!_signerMap[msg.sender]) {
            revert InvalidUser();
        }
        _;
    }

    // Check address is valid
    modifier onlyValidAddress(address validatingAddress) {
        if (validatingAddress == address(0)) {
        revert InvalidAddress();
        }
        _;
    }

    constructor(address _implementation) onlyValidAddress((_implementation)){
        implementation = _implementation;
    }


    /*******************************************************
    * External section
    ********************************************************/

    // Add new Users in list
    function signerListAdd(address[] memory signerListToAdd) external onlyOwner {
        for (uint256 i = 0; i < signerListToAdd.length; i += 1) {
            if (!_signerMap[signerListToAdd[i]]) { 
                _signerMap[signerListToAdd[i]] = true; 
                _signerTotal += 1;
            }
        }
        emit SignerListAdd(_signerTotal, block.timestamp);
    }

    // Remove old Users in list
    function signerListRemove(address[] memory listSignerToRemove) external onlyOwner {
        for (uint256 i = 0; i < listSignerToRemove.length; i += 1) {
            if (_signerMap[listSignerToRemove[i]]) { 
                _signerMap[listSignerToRemove[i]] = false; 
                _signerTotal -= 1;
            }
        }
        emit SignerListRemove(_signerTotal, block.timestamp);
    }

    // Deploy game contract
    function deployGameContract(address gameContractOwner, uint96 salt) external onlyUser returns (address) {
        address clone = implementation.cloneDeterministic(_packing(salt, msg.sender));

        GameContract(clone).initialize(gameContractOwner);

        contractListDeploy.push(clone);
        emit GameContractDeploy(gameContractOwner, clone);
        return clone;
    }
    
    // Upgrade new implementation
    function upgradeImplementation(
        address newImplementation
    ) external onlyOwner onlyValidAddress(newImplementation) returns (bool) {
        // Overwrite current implementation address
        implementation = newImplementation;
        emit UpgradeImplementation(implementation, newImplementation);
        return true;
    }
    /*******************************************************
    * External view section
    ********************************************************/

    // packing salt and address to generate unique salt for this address
    function _packing(uint96 a, address b) internal pure returns (bytes32 packed) {
        assembly {
        packed := or(shl(160, a), b)
        }
    }

    // Predict deploy address with this salt
    function predictWalletAddress(uint96 salt, address creatorAddress) external view returns (address predictedAddress) {
        return implementation.predictDeterministicAddress(_packing(salt, creatorAddress));
    }
    
    // Get all address contract
    function getContractListDeploy() external view returns (address[] memory) {
        return contractListDeploy;
    }

    // Check if contract existed
    function _isGameContractExist(address gameContractAddress) external view returns (bool isExist) {
        return gameContractAddress.code.length > 0;
    }

    // Check list signer status which have add and which hasn't add
    function signerListCheck(address[] memory signerListToCheck) external view returns (bool[] memory) {
        bool[] memory statusList = new bool[](signerListToCheck.length);
        for (uint256 i = 0; i < signerListToCheck.length; i += 1) {
            statusList[i] = _signerMap[signerListToCheck[i]];
        }
        return statusList; 
    }

    // Check signer status 
    function signerCheck(address signerToCheck) external view returns (bool) {
        return _signerMap[signerToCheck];
    }

    // Total signer has been added
    function signerTotal() external view returns (uint256) {
        return _signerTotal;
    }

    // Pacing salt and creator address
    function packingSalt(uint96 salt, address creatorAddress) external pure returns (uint256 packedSalt) {
        return uint256(_packing(salt, creatorAddress));
    }
}
