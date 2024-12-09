// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import '@openzeppelin/contracts/access/Ownable.sol';

contract GameContract is Ownable {
    error InvalidGameContractUser();

    mapping(address => bool) private signerMap;

    uint256 private totalSigner;

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

    function addListSigner(address[] memory listSigner) external onlyOwner {
        for (uint256 i = 0; i < listSigner.length; i += 1) {
            if (!signerMap[listSigner[i]]) { 
                signerMap[listSigner[i]] = true; 
                totalSigner += 1;
            }
        }
        emit AddListSigner(totalSigner, block.timestamp);
    }

    function removeListSigner(address[] memory listRemoveSigner) external onlyOwner {
        for (uint256 i = 0; i < listRemoveSigner.length; i += 1) {
            if (signerMap[listRemoveSigner[i]]) { 
                signerMap[listRemoveSigner[i]] = false; 
                totalSigner -= 1;
            }
        }
         emit RemoveListSigner(totalSigner, block.timestamp);
    }

    function dailyQuestSubmit(bytes32 _questName) external User {
        emit DailyQuestSubmit(msg.sender, _questName);
    }

    function socialQuestSubmit(bytes32 _questName) external User {
        emit SocialQuestSubmit(msg.sender, _questName);
    }

    function gameQuestSubmit(bytes32 _questName) external User {
        emit GameQuestSubmit(msg.sender, _questName);
    }

    function checkListSigner(address[] memory _addresses) external view returns (bool[] memory) {
        bool[] memory listStatus = new bool[](_addresses.length);
        for (uint256 i = 0; i < _addresses.length; i += 1) {
            listStatus[i] = signerMap[_addresses[i]];
        }
        return listStatus; 
    }

    function isSigner(address _address) external view returns (bool) {
        return signerMap[_address];
    }

    function getTotalSigner() external view onlyOwner returns (uint256) {
        return totalSigner;
    }
}
