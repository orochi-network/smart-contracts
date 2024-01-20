// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

interface IOrandManagementV2 {
  // Get public key
  function getPublicKey() external view returns (uint256[2] memory pubKey);

  // Get public key digest
  function getPublicKeyDigest() external view returns (uint256 pubKeyDigest);
}
