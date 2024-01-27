// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// Error
error InvalidECDSAProofLength(uint256 proofLength);
error InvalidProofSigner(address proofSigner);

interface IOrandECDSAV2 {
  // Struct Orand ECDSA proof
  struct OrandECDSAProof {
    address signer;
    address receiverAddress;
    uint96 receiverEpoch;
    uint256 ecvrfProofDigest;
  }

  // Get signer address from a valid proof
  function decomposeProof(bytes memory proof) external pure returns (OrandECDSAProof memory ecdsaProof);

  // Get operator
  function getOperator() external view returns (address operatorAddress);
}
