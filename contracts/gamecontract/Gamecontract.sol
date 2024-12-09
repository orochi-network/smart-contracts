// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import '@openzeppelin/contracts/access/Ownable.sol';

contract GameContract is Ownable {
    error InvalidUser();

    mapping(address => bool) private _signerMap;

    uint256 private _signerTotal;

    event QuestCompleteDaily(address indexed user, bytes32 indexed questName);
    event QuestCompleteSocial(address indexed user, bytes32 indexed questName);
    event QuestCompleteGame(address indexed user, bytes32 indexed questName);
    event SignerListAdd(uint256 indexed totalAddedUser, uint256 indexed timestamp);
    event SignerListRemove(uint256 indexed totalAddedUser, uint256 indexed timestamp);

    modifier onlyUser() {
        if (!_signerMap[msg.sender]) {
            revert InvalidUser();
        }
        _;
    }

    function signerListAdd(address[] memory signerListToAdd) external onlyOwner {
        for (uint256 i = 0; i < signerListToAdd.length; i += 1) {
            if (!_signerMap[signerListToAdd[i]]) { 
                _signerMap[signerListToAdd[i]] = true; 
                _signerTotal += 1;
            }
        }
        emit SignerListAdd(_signerTotal, block.timestamp);
    }

    function signerListRemove(address[] memory listSignerToRemove) external onlyOwner {
        for (uint256 i = 0; i < listSignerToRemove.length; i += 1) {
            if (_signerMap[listSignerToRemove[i]]) { 
                _signerMap[listSignerToRemove[i]] = false; 
                _signerTotal -= 1;
            }
        }
         emit SignerListRemove(_signerTotal, block.timestamp);
    }

    function questSubmitDaily(bytes32 questName) external onlyUser {
        emit QuestCompleteDaily(msg.sender, questName);
    }

    function questSubmitSocial(bytes32 questName) external onlyUser {
        emit QuestCompleteSocial(msg.sender, questName);
    }

    function questSubmitGame(bytes32 questName) external onlyUser {
        emit QuestCompleteGame(msg.sender, questName);
    }

    function signerListCheck(address[] memory signerListToCheck) external view returns (bool[] memory) {
        bool[] memory statusList = new bool[](signerListToCheck.length);
        for (uint256 i = 0; i < signerListToCheck.length; i += 1) {
            statusList[i] = _signerMap[signerListToCheck[i]];
        }
        return statusList; 
    }

    function signerCheck(address signerToCheck) external view returns (bool) {
        return _signerMap[signerToCheck];
    }

    function signerTotal() external view returns (uint256) {
        return _signerTotal;
    }
}
