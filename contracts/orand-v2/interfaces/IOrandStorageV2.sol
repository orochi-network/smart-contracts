// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

error UnableToAddEpoch(address receiverAddress, uint96 receiverEpoch, uint256 epochResult);

interface IOrandStorageV2 {
  // Epoch structure for fraud proof
  struct Epoch {
    uint256 epochResult;
    uint256 epochDigest;
  }

  // Get epoch record of given epoch
  function getEpoch(address receiver, uint96 epoch) external view returns (Epoch memory epochRecord);

  // Get epoch record of latest epoch
  function getLatestEpoch(address receiver) external view returns (Epoch memory epochRecord);

  // Get latest epoch's result
  function getLatestResult(address receiver) external view returns (uint256 epochResult);

  // Get otal epoch
  function getTotalEpoch(address receiver) external view returns (uint256 totalEpoch);
}
