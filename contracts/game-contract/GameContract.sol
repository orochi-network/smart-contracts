// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import '@openzeppelin/contracts/access/Ownable.sol';

contract GameContract is Ownable {
    // Invalid User
    error InvalidUser();

    // Only able to init once time
    error OnlyAbleToInitOnce();

    // Signer List
    mapping(address => bool) private _signerMap;

    // Signer Total
    uint256 private _signerTotal;

    // init state
    bool private _initialized = false;

    // Complete daily quest
    event QuestCompleteDaily(address indexed user, bytes32 indexed questName);

    // Complete Social quest
    event QuestCompleteSocial(address indexed user, bytes32 indexed questName);

    // Complete Game quest
    event QuestCompleteGame(address indexed user, bytes32 indexed questName);

    //  Add list Users
    event SignerListAdd(uint256 indexed totalAddedUser, uint256 indexed timestamp);

    // Remove list Users
    event SignerListRemove(uint256 indexed totalAddedUser, uint256 indexed timestamp);

    // Init event
    event Initialize(address indexed owner, uint256 indexed timestamp);

    // We only allow User have been add by owner
    modifier onlyUser() {
        if (!_signerMap[msg.sender]) {
            revert InvalidUser();
        }
        _;
    }


    /*******************************************************
    * External section
    ********************************************************/

    // init once time
    function initialize(address newGameContractOwner) external {
        if(_initialized){
            revert OnlyAbleToInitOnce();
        }
        _transferOwnership(newGameContractOwner);
        _initialized = true;
        emit Initialize(newGameContractOwner, block.timestamp);
    }

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
}
