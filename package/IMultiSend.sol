// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IMultiSend {

    /**
     * @notice Send native token to a list of recipients based on the specified amount.
     * @param recipientList The list of recipient addresses to send tokens to.
     * @param amount The amount of native tokens each recipient should receive.
     * 
     * Reverts with `InsufficientValue` error if the provided ETH value is insufficient 
     * to cover the deficits.
     * 
     * Emits no events.
     */
    function multiSend(address[] memory recipientList, uint256 amount) external payable;

    /**
     * @notice Check the deficit balance of each recipient in the list compared to the specified amount.
     * @param recipientList The list of recipient addresses to check balances for.
     * @param amount The target amount that each recipient should have.
     * @return deficit An array of deficits for each recipient address.
     *         If the recipient's balance is greater than or equal to `amount`, 
     *         the corresponding deficit will be 0.
     */
    function checkDeficit(address[] memory recipientList, uint256 amount) external view returns (uint256[] memory);
}
