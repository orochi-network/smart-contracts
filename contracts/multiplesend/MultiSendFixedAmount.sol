// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MultiSendFixedAmount {
    function multiSend(address[] memory recipients, uint256 amount) external payable {
        require(msg.value >= recipients.length * amount, "Not enough gas provided.");

        for (uint256 i = 0; i < recipients.length; i++) {
            (bool success, ) = recipients[i].call{value: amount}("");
            require(success, "Transfer failed");
        }

        uint256 refund = msg.value - recipients.length * amount;
        if (refund > 0) {
            (bool success, ) = msg.sender.call{value: refund}("");
            require(success, "Refund failed");
        }
    }
}
