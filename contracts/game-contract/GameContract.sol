// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import '@openzeppelin/contracts/access/Ownable.sol';

contract GameContract is Ownable {
    // Invalid User
    error InvalidUser();

    // Only able to init once time
    error OnlyAbleToInitOnce();

    // Signer List
    mapping(address => bool) private _userMap;

    // Signer Total
    uint256 private _userTotal;

    // init state
    bool private _initialized = false;

    // Complete daily quest
    event QuestCompleteDaily(address indexed user, bytes32 indexed questName);

    // Complete Social quest
    event QuestCompleteSocial(address indexed user, bytes32 indexed questName);

    // Complete Game quest
    event QuestCompleteGame(address indexed user, bytes32 indexed questName);

    //  Add list Users
    event UserListAdd(address indexed actor ,uint256 indexed totalAddedUser);

    // Remove list Users
    event UserListRemove(address indexed actor , uint256 indexed totalAddedUser);


    // We only allow User have been add by owner
    modifier onlyUser() {
        if (!_userMap[msg.sender]) {
            revert InvalidUser();
        }
        _;
    }

    // Modifier to check if already initialized
    modifier onlyOnceInitialize() {
        if (_initialized) {
            revert OnlyAbleToInitOnce();
        }
        _;
    }

    /*******************************************************
    * Once time init external section
    ********************************************************/

    // init once time
    function initialize(address newGameContractOwner) external onlyOnceInitialize {
        _transferOwnership(newGameContractOwner);
        _initialized = true;
    }

    /*******************************************************
    * Owner section
    ********************************************************/

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

    // submit transaction daily quest
    function questSubmitDaily(bytes32 questName) external onlyUser {
        emit QuestCompleteDaily(msg.sender, questName);
    }

    // submit transaction social quest
    function questSubmitSocial(bytes32 questName) external onlyUser {
        emit QuestCompleteSocial(msg.sender, questName);
    }

    // submit transaction game quest
    function questSubmitGame(bytes32 questName) external onlyUser {
        emit QuestCompleteGame(msg.sender, questName);
    }

    /*******************************************************
    * External view section
    ********************************************************/

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
}
