// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IMultiSendFixedAmount {
 
    /**
    * Send native Token to each User in list address
    * @param recipients address[] - List of User address to send
    * @param amount uint256 - Token amount each address receive
    * Emits event SignerListAdd with total User and block timestamp
    */
    function multiSend(address[] memory recipients, uint256 amount) external payable;
}
