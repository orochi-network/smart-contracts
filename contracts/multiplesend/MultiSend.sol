// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MultiSend {
    error InsufficientFund();

    function multiSend(
        address[] memory recipientList,
        uint256 amount
    ) external payable {
        for (uint256 i = 0; i < recipientList.length; i += 1) {
            uint256 sendAmount = amount > address(recipientList[i]).balance
                ? amount - address(recipientList[i]).balance
                : 0;
            // Calculate deficit for the recipient
            if (sendAmount > 0) {
                if (address(this).balance >= sendAmount) {
                    payable(recipientList[i]).transfer(sendAmount); // Send the deficit amount
                } else {
                    // If not enough funds to send the deficit, revert InsufficientFund
                    revert InsufficientFund();
                }
            }
        }

        if (address(this).balance > 0) {
            payable(tx.origin).transfer(address(this).balance);
        }
    }
}