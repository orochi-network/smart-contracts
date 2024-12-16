// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MultiSend {
    // Insufficient send value error
    error InsufficientValue(uint256 provided, uint256 required);

    // Send native token to all address in list base on amount input 
    function multiSend(address[] memory recipientList, uint256 amount) external payable {
        uint256 deficitTotal = 0;
        uint256[] memory deficit = new uint256[](recipientList.length);

        // Calculate total deficit
        for (uint256 i = 0; i < recipientList.length; i+=1) {
            uint256 balance = address(recipientList[i]).balance;  
            if (balance < amount) {
                deficit[i] = amount - balance;
                deficitTotal += deficit[i];
            } else {
                deficit[i] = 0;
            }
        }

        // Check if enough value to send
        if (msg.value < deficitTotal) {
            revert InsufficientValue(msg.value, deficitTotal);
        }

        // Send deficit
        for (uint256 i = 0; i < recipientList.length; i+=1) {
            if (deficit[i] > 0) {
                payable(recipientList[i]).transfer(deficit[i]);
            }
        }

        // Refund remaining amount back to the sender
        uint256 refund = msg.value - deficitTotal;
        if (refund > 0) {
            payable(msg.sender).transfer(refund);
        }
    }

    // Check deficit address balance against amount input
    function checkDeficit(address[] memory recipientList, uint256 amount) external view returns (uint256[] memory) {
        uint256[] memory deficit = new uint256[](recipientList.length);

        for (uint256 i = 0; i < recipientList.length; i+=1) {
            uint256 balance = address(recipientList[i]).balance;  
            if (balance < amount) {
                deficit[i] = amount - balance;
            } else {
                deficit[i] = 0;
            }
        }

        return deficit;
    }
}
