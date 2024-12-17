// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MultiSend {
    // Mapping to store the total amount that each address has received
    mapping(address => uint256) private FaucetAmount;

    function multiSend(address[] memory recipientList, uint256 amount) 
        external 
        payable 
        returns (bool[] memory successfulRecipients)
    {
        uint256 deficitTotal = 0; // Tracks the total amount of funds sent
        bool[] memory tempRecipients = new bool[](recipientList.length); // Temporary array to store success flags
        uint256 count = 0; // Counter for the number of recipients who successfully received funds

        for (uint256 i = 0; i < recipientList.length; i+=1) {
            uint256 balance = address(recipientList[i]).balance;

            // Calculate deficit for the recipient
            if (balance < amount) {
                uint256 deficit = amount - balance;

                // Check if enough value is available to send
                if (msg.value - deficitTotal >= deficit) {
                    deficitTotal += deficit; // Add to the total funds sent
                    payable(recipientList[i]).transfer(deficit); // Send the deficit amount

                    // Mark the recipient as successful
                    tempRecipients[i] = true;
                    count++;

                    // Update the total faucet amount for this recipient (no impact on logic)
                    FaucetAmount[recipientList[i]] += deficit;
                } else {
                    // If not enough funds to send the deficit, mark as unsuccessful
                    tempRecipients[i] = false;
                }
            } else {
                // If no deficit, mark as successful
                tempRecipients[i] = true;
            }
        }

        // Refund any remaining ETH back to the sender
        uint256 refund = msg.value - deficitTotal;
        if (refund > 0) {
            payable(msg.sender).transfer(refund);
        }

        // Return the list of booleans indicating successful payments
        successfulRecipients = tempRecipients;
        return successfulRecipients;
    }

    // Check deficit address balance against the input amount
    function checkDeficit(address[] memory recipientList, uint256 amount) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory deficits = new uint256[](recipientList.length);

        for (uint256 i = 0; i < recipientList.length; i+=1) {
            uint256 balance = address(recipientList[i]).balance;

            if (balance < amount) {
                deficits[i] = amount - balance;
            } else {
                deficits[i] = 0;
            }
        }

        return deficits;
    }
    function AddressFaucetAmount(address recipient) external view returns (uint256) {
        return FaucetAmount[recipient];
    }
}
