// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./UserManager.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameContract is UserManager, Ownable {

    // Only able to init once time
    error OnlyAbleToInitOnce();

    // init state
    bool private _initialized = false;

    // Complete daily quest
    event QuestCompleteDaily(address indexed user, bytes32 indexed questName);

    // Complete Social quest
    event QuestCompleteSocial(address indexed user, bytes32 indexed questName);

    // Complete Game quest
    event QuestCompleteGame(address indexed user, bytes32 indexed questName);

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
        _userListAdd(userListToAdd);
    }

    // Remove new Users in list
    function userListRemove(address[] memory userListToRemove) external onlyOwner {
        _userListRemove(userListToRemove);
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

    // Check list user status which have added and which hasn't
    function userListCheck(address[] memory userListToCheck) external view returns (bool[] memory) {
        return _userListCheck(userListToCheck);
    }

    // Check user status 
    function userCheck(address userToCheck) external view returns (bool) {
        return _userCheck(userToCheck);
    }

    // Total user has been added
    function userTotal() external view returns (uint256) {
        return _userTotal();
    }
}
