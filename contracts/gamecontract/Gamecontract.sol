// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import '@openzeppelin/contracts/access/Ownable.sol';


contract GameContract is Ownable {

    error GameContract__NotAuthorized();

    mapping(address => bool) public signers;

    event DailyQuestSubmit(address indexed user, string questName);
    event SocialQuestSubmit(address indexed user, string questName);
    event GameQuestSubmit(address indexed user, string questName);

    modifier User() {
        if (!signers[msg.sender]) {
            revert GameContract__NotAuthorized();
        }
        _;
    }

    constructor() {}

    function dailyQuestSubmit (
        string memory _questName
    ) external User {
        emit DailyQuestSubmit(msg.sender, _questName);
    }

    function socialQuestSubmit (
        string memory _questName
    ) external User {
        emit SocialQuestSubmit(msg.sender, _questName);
    }

    function gameQuestSubmit (
        string memory _questName
    ) external User {
        emit GameQuestSubmit(msg.sender, _questName);
    }

    function addSigners(address[] memory _signers) external onlyOwner {
        for (uint256 i = 0; i < _signers.length; i++) {
            signers[_signers[i]] = true;
        }
    }

    function removeSigners(address[] memory _signers) external onlyOwner {
        for (uint256 i = 0; i < _signers.length; i++) {
            signers[_signers[i]] = false;
        }
    }
}
