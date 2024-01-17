// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import './interfaces/IOrandPenaltyV2.sol';

contract OrandPenaltyV2 is IOrandPenaltyV2 {
  // Penalty fee
  uint256 private penaltyFee;

  // Apply penalty
  event ApplyPenalty(address indexed plaintiff, address indexed theAccused, uint256 indexed value);

  // Set penalty
  event SetPenalty(address indexed actor, uint256 indexed oldPenaltyFee, uint256 indexed newPenaltyFee);

  // Set penalty fee for consumer
  constructor(uint256 initalFee) {
    _setPenalty(initalFee);
  }

  //=======================[  Internal ]====================

  // Withdraw all native token to trigger address
  function _withdraw() internal returns (bool isSuccess) {
    payable(address(msg.sender)).transfer(address(this).balance);
    return true;
  }

  // Apply penalty to the accused
  function _applyPenalty(address theAccused) internal {
    address plaintiff = msg.sender;
    payable(address(plaintiff)).transfer(penaltyFee);
    emit ApplyPenalty(plaintiff, theAccused, penaltyFee);
  }

  // Set the penalty amount
  function _setPenalty(uint256 newPenaltyFee) internal {
    emit SetPenalty(msg.sender, penaltyFee, newPenaltyFee);
    penaltyFee = newPenaltyFee;
  }

  //=======================[  Internal view ]====================

  // Get penalty fee
  function _getPenaltyFee() internal view returns (uint256 fee) {
    return penaltyFee;
  }

  //=======================[  External view ]====================

  // Get penalty fee
  function getPenaltyFee() external view returns (uint256 fee) {
    return _getPenaltyFee();
  }
}
