// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./GameContract.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

contract GameContractFactory is Ownable {
    using Clones for address;

    // Address of template game contract
    address private implementation;

    // User list
    mapping(address => bool) private _userMap;

    // User total
    uint256 private _userTotal;

    // Game Contract deployed event
    event GameContractDeploy(address indexed contractAddress, address indexed ownerAddress, bytes32 indexed salt);

    //  Add list Users
    event UserListAdd(address indexed actor, uint256 indexed totalAddedUser);

    // Remove list Users
    event UserListRemove(address indexed actor, uint256 indexed totalAddedUser);

    // Upgrade implementation
    event UpgradeImplementation(address indexed actor, address indexed oldImplementation, address indexed upgradeImplementation);

    // Invalid User
    error InvalidUser();

    // Invalid Address
    error InvalidAddress();

    // Deploy fail
    error UnableToInitNewContract();

    // We only allow User have been add by owner
    modifier onlyUser() {
        if (!_userMap[msg.sender]) {
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


    constructor(address _implementation) onlyValidAddress(_implementation){
        implementation = _implementation;
        emit UpgradeImplementation(msg.sender , address(0), _implementation);
    }


    /*******************************************************
    * Owner section
    ********************************************************/

    // Upgrade new implementation
    function upgradeImplementation(
        address newImplementation
    ) external onlyOwner onlyValidAddress(newImplementation) returns (bool) {
        address oldImplementation = implementation;
        // Overwrite current implementation address
        implementation = newImplementation;
        emit UpgradeImplementation(msg.sender, oldImplementation, newImplementation);
        return true;
    }

    // Add new Users in list
    function userListAdd(address[] memory userListToAdd) external onlyOwner {
        for (uint256 i = 0; i < userListToAdd.length; i += 1) {
            if (!_userMap[userListToAdd[i]]) { 
                _userMap[userListToAdd[i]] = true; 
                _userTotal += 1;
            }
        }
        emit UserListAdd(msg.sender, _userTotal);
    }

    // Remove old Users in list
    function userListRemove(address[] memory userListToRemove) external onlyOwner {
        for (uint256 i = 0; i < userListToRemove.length; i += 1) {
            if (_userMap[userListToRemove[i]]) { 
                _userMap[userListToRemove[i]] = false; 
                _userTotal -= 1;
            }
        }
        emit UserListRemove(msg.sender, _userTotal);
    }

    /*******************************************************
    * User section
    ********************************************************/

    // Deploy game contract
    function deployGameContract(address gameContractOwner, uint96 salt) external onlyUser returns (address) {
        address newGameContract = implementation.cloneDeterministic(_packing(salt, msg.sender));

        GameContract(newGameContract).initialize(gameContractOwner);
        emit GameContractDeploy(newGameContract, gameContractOwner, _packing(salt, msg.sender));
        return newGameContract;
    }
    

    /*******************************************************
    * Internal pure section
    ********************************************************/

    // packing salt and address to generate unique salt for this address
    function _packing(uint96 a, address b) internal pure returns (bytes32 packed) {
        assembly {
        packed := or(shl(160, a), b)
        }
    }

    /*******************************************************
    * External view section
    ********************************************************/

    // Predict deploy address with this salt
    function predictWalletAddress(uint96 salt, address creatorAddress) external view returns (address predictedAddress) {
        return implementation.predictDeterministicAddress(_packing(salt, creatorAddress));
    }

    // Check if contract existed
    function isGameContractExist(address gameContractAddress) external view returns (bool isExist) {
        return gameContractAddress.code.length > 0;
    }

    // Check list user status which have add and which hasn't add
    function userListCheck(address[] memory userListToCheck) external view returns (bool[] memory) {
        bool[] memory statusList = new bool[](userListToCheck.length);
        for (uint256 i = 0; i < userListToCheck.length; i += 1) {
            statusList[i] = _userMap[userListToCheck[i]];
        }
        return statusList; 
    }

    // Check user status 
    function userCheck(address userToCheck) external view returns (bool) {
        return _userMap[userToCheck];
    }

    // Total user has been added
    function userTotal() external view returns (uint256) {
        return _userTotal;
    }

    // Packing salt and creator address
    function packingSalt(uint96 salt, address creatorAddress) external pure returns (uint256 packedSalt) {
        return uint256(_packing(salt, creatorAddress));
    }
}
