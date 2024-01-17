// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

error InvalidActiveFee(address receiver, uint256 activeFee);

interface IOrandPenaltyV2 {
  // Get penalty fee
  function getPenaltyFee() external view returns (uint256 fee);
}
