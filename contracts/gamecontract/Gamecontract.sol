// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import '@openzeppelin/contracts/access/Ownable.sol';

contract GameContract is Ownable {
    error InvalidUser();

    mapping(address => bool) private signerMap;

    uint256 private signerTotal;

    event QuestCompleteDaily(address indexed user, bytes32 indexed questName);
    event QuestCompleteSocial(address indexed user, bytes32 indexed questName);
    event QuestCompleteGame(address indexed user, bytes32 indexed questName);
    event SignerListAdd(uint256 indexed totalAddedUser, uint256 indexed timestamp);
    event SignerListRemove(uint256 indexed totalAddedUser, uint256 indexed timestamp);

    modifier User() {
        if (!signerMap[msg.sender]) {
            revert InvalidUser();
        }
        _;
    }

    function signerListAdd(address[] memory signerListToAdd) external onlyOwner {
        for (uint256 i = 0; i < signerListToAdd.length; i += 1) {
            if (!signerMap[signerListToAdd[i]]) { 
                signerMap[signerListToAdd[i]] = true; 
                signerTotal += 1;
            }
        }
        emit SignerListAdd(signerTotal, block.timestamp);
    }

    function signerListRemove(address[] memory listSignerToRemove) external onlyOwner {
        for (uint256 i = 0; i < listSignerToRemove.length; i += 1) {
            if (signerMap[listSignerToRemove[i]]) { 
                signerMap[listSignerToRemove[i]] = false; 
                signerTotal -= 1;
            }
        }
         emit SignerListRemove(signerTotal, block.timestamp);
    }

    function questSubmitDaily(bytes32 questName) external User {
        emit QuestCompleteDaily(msg.sender, questName);
    }

    function questSubmitSocial(bytes32 questName) external User {
        emit QuestCompleteSocial(msg.sender, questName);
    }

    function questSubmitGame(bytes32 questName) external User {
        emit QuestCompleteGame(msg.sender, questName);
    }

    function signerListCheck(address[] memory signerListToCheck) external view returns (bool[] memory) {
        bool[] memory statusList = new bool[](signerListToCheck.length);
        for (uint256 i = 0; i < signerListToCheck.length; i += 1) {
            statusList[i] = signerMap[signerListToCheck[i]];
        }
        return statusList; 
    }

    function isSigner(address signerToCheck) external view returns (bool) {
        return signerMap[signerToCheck];
    }

    function getTotalSigner() external view onlyOwner returns (uint256) {
        return signerTotal;
    }
}
