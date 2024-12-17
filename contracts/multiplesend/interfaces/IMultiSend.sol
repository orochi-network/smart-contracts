// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IMultiSend {

    /**
     * @notice Send native token to a list of recipients based on the specified amount.
     * @param recipientList The list of recipient addresses to send tokens to.
     * @param amount The amount of native tokens each recipient should receive.
     * 
     * @return successfulRecipients A boolean array indicating success for each recipient.
     *         `true` means the recipient received the tokens successfully, `false` means failure.
     */
    function multiSend(address[] memory recipientList, uint256 amount) external payable returns (bool[] memory successfulRecipients);

    /**
     * @notice Check the deficit balance of each recipient in the list compared to the specified amount.
     * @param recipientList The list of recipient addresses to check balances for.
     * @param amount The target amount that each recipient should have.
     * @return deficits An array of deficits for each recipient address.
     *         If the recipient's balance is greater than or equal to `amount`, 
     *         the corresponding deficit will be 0.
     */
    function checkDeficit(address[] memory recipientList, uint256 amount) external view returns (uint256[] memory);

    /**
     * @notice Returns the total amount of native tokens a given address has received.
     * @param recipient The address whose received amount is to be queried.
     * @return The amount of tokens the recipient has received from the faucet.
     */
    function AddressFaucetAmount(address recipient) external view returns (uint256);
}
