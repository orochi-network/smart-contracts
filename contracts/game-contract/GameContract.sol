// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./UserManager.sol";

contract GameContract is UserManager {

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

}
