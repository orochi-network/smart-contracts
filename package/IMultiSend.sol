// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IMultiSend {

    /**
     * @notice Send native token to a list of recipients based on the specified amount.
     * @param recipientList The list of recipient addresses to send tokens to.
     * @param amount The amount of native tokens each recipient should receive.
     * 
     */
    function multiSend(address[] memory recipientList, uint256 amount) external payable;
}
