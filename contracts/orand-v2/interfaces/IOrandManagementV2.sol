// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

interface IOrandManagementV2 {
  // Get public key
  function getPublicKey() external view returns (uint256[2] memory pubKey);

  // Get digest of corresponding public key
  function getPublicKeyDigest() external view returns (bytes32 operator);
}
