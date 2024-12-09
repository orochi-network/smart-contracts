// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import '@openzeppelin/contracts/access/Ownable.sol';

contract GameContract is Ownable {
    error InvalidGameContractUser();

    mapping(address => bool) private signerMap;

    uint256 private totalSigner;

    event DailyQuestSubmit(address user, bytes32 indexed questName);
    event SocialQuestSubmit(address user, bytes32 indexed questName);
    event GameQuestSubmit(address user, bytes32 indexed questName);
    event AddListSigner(uint256 indexed totalAddedUser, uint256 indexed timestamp);
    event RemoveListSigner(uint256 indexed totalAddedUser, uint256 indexed timestamp);

    modifier User() {
        if (!signerMap[tx.origin]) {
            revert InvalidGameContractUser();
        }
        _;
    }

    function addListSigner(address[] memory listSigner) external onlyOwner {
        bool[] memory listStatus = checkListSigner(listSigner); 

        for (uint256 i = 0; i < listSigner.length; i += 1) {
            if (!listStatus[i]) { 
                signerMap[listSigner[i]] = true; 
                totalSigner += 1;
            }
        }
        emit AddListSigner(totalSigner, block.timestamp);
    }

    function removeListSigner(address[] memory listRemoveSigner) external onlyOwner {
        bool[] memory listStatus = checkListSigner(listRemoveSigner); 

        for (uint256 i = 0; i < listRemoveSigner.length; i += 1) {
            if (listStatus[i]) { 
                signerMap[listRemoveSigner[i]] = false; 
                totalSigner -= 1;
            }
        }
         emit RemoveListSigner(totalSigner, block.timestamp);
    }

    function dailyQuestSubmit(bytes32 _questName) external User {
        emit DailyQuestSubmit(tx.origin, _questName);
    }

    function socialQuestSubmit(bytes32 _questName) external User {
        emit SocialQuestSubmit(tx.origin, _questName);
    }

    function gameQuestSubmit(bytes32 _questName) external User {
        emit GameQuestSubmit(tx.origin, _questName);
    }

    function checkListSigner(address[] memory _addresses) private view returns (bool[] memory) {
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
