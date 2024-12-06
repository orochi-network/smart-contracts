// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import '@openzeppelin/contracts/access/Ownable.sol';


contract GameContract is Ownable {

    error InvalidGameContractUser();

    mapping(address => bool) signers;

    event DailyQuestSubmit(address indexed user, string questName);
    event SocialQuestSubmit(address indexed user, string questName);
    event GameQuestSubmit(address indexed user, string questName);
    event AddSigners(address[] users);
    event RemoveSigners(address[] users);



    modifier User() {
        if (!signers[tx.origin]) {
            revert InvalidGameContractUser();
        }
        _;
    }

    
    function isSigner(address _address) external view returns (bool) {
        return signers[_address];
    }

    function dailyQuestSubmit (
        string memory _questName
    ) external User {
        emit DailyQuestSubmit(tx.origin, _questName);
    }

    function socialQuestSubmit (
        string memory _questName
    ) external User {
        emit SocialQuestSubmit(tx.origin, _questName);
    }

    function gameQuestSubmit (
        string memory _questName
    ) external User {
        emit GameQuestSubmit(tx.origin, _questName);
    }

    function addSigners(address[] memory _signers) external onlyOwner {
        for (uint256 i = 0; i < _signers.length; i+=1) {
            signers[_signers[i]] = true;
        }
        emit AddSigners(_signers);
    }

    function removeSigners(address[] memory _signers) external onlyOwner {
        for (uint256 i = 0; i < _signers.length; i+=1) {
            signers[_signers[i]] = false;
        }
        emit RemoveSigners(_signers);
    }
}
