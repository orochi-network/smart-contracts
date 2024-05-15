// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

interface IOrandStorageV3 {
  // Get a given epoch result for a given receiver
  function getEpochResult(address receiver, uint96 epoch) external view returns (uint256 result);

  // Get total number of epochs for a given receiver
  function getTotalEpoch(address receiver) external view returns (uint96 epoch);

  // Get current epoch of a given receiver
  function getCurrentEpoch(address receiver) external view returns (uint96 epoch);

  // Get current epoch of a given receiver
  function getCurrentEpochResult(address receiver) external view returns (uint256 result);
}
