// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import '@openzeppelin/contracts/access/Ownable.sol';

contract GameContract is Ownable {
    error InvalidGameContractUser();

    mapping(address => bool) private signerMap;

    uint256 private totalUserGameContract;

    event DailyQuestSubmit(address indexed user, bytes32 indexed questName);
    event SocialQuestSubmit(address indexed user, bytes32 indexed questName);
    event GameQuestSubmit(address indexed user, bytes32 indexed questName);
    event AddListSigner(uint256 indexed totalAddedUser, uint256 indexed timestamp);
    event RemoveListSigner(uint256 indexed totalAddedUser, uint256 indexed timestamp);

    modifier User() {
        if (!signerMap[msg.sender]) {
            revert InvalidGameContractUser();
        }
        _;
    }

    function addListSigner(address[] memory listSignerToAdd) external onlyOwner {
        for (uint256 i = 0; i < listSignerToAdd.length; i += 1) {
            if (!signerMap[listSignerToAdd[i]]) { 
                signerMap[listSignerToAdd[i]] = true; 
                totalUserGameContract += 1;
            }
        }
        emit AddListSigner(totalUserGameContract, block.timestamp);
    }

    function removeListSigner(address[] memory listSignerToRemove) external onlyOwner {
        for (uint256 i = 0; i < listSignerToRemove.length; i += 1) {
            if (signerMap[listSignerToRemove[i]]) { 
                signerMap[listSignerToRemove[i]] = false; 
                totalUserGameContract -= 1;
            }
        }
         emit RemoveListSigner(totalUserGameContract, block.timestamp);
    }

    function dailyQuestSubmit(bytes32 questName) external User {
        emit DailyQuestSubmit(msg.sender, questName);
    }

    function socialQuestSubmit(bytes32 questName) external User {
        emit SocialQuestSubmit(msg.sender, questName);
    }

    function gameQuestSubmit(bytes32 questName) external User {
        emit GameQuestSubmit(msg.sender, questName);
    }

    function checkListSigner(address[] memory listSignerToCheck) external view returns (bool[] memory) {
        bool[] memory listStatus = new bool[](listSignerToCheck.length);
        for (uint256 i = 0; i < listSignerToCheck.length; i += 1) {
            listStatus[i] = signerMap[listSignerToCheck[i]];
        }
        return listStatus; 
    }

    function isSigner(address signerToCheck) external view returns (bool) {
        return signerMap[signerToCheck];
    }

    function getTotalSigner() external view onlyOwner returns (uint256) {
        return totalUserGameContract;
    }
}
