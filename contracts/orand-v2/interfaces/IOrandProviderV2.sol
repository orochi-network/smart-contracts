// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import './IOrandECDSAV2.sol';

error UnableToForwardRandomness(address receiver, uint256 y);
error InvalidAlphaValue(uint256 expectedAlpha, uint256 givenAlpha);
error InvalidGenesisEpoch(uint256 currentEpoch);
error InvalidECVRFProofDigest();

interface IOrandProviderV2 is IOrandECDSAV2 {
  // ECVRF struct
  struct ECVRFProof {
    uint256[2] gamma;
    uint256 c;
    uint256 s;
    uint256 alpha;
    address uWitness;
    uint256[2] cGammaWitness;
    uint256[2] sHashWitness;
    uint256 zInv;
  }

  // Start new genesis for receiver
  function genesis(bytes memory fraudProof, ECVRFProof calldata ecvrfProof) external returns (bool);

  // Publish new epoch with Fraud Proof
  function publishFraudProof(bytes memory fraudProof, ECVRFProof calldata ecvrfProof) external returns (bool);

  // Publish new epoch with ECDSA Proof and Fraud Proof
  function publish(address receiver, ECVRFProof calldata ecvrfProof) external returns (bool);

  // Verify a ECVRF proof epoch is valid or not
  function verifyEpoch(
    bytes memory fraudProof,
    ECVRFProof calldata ecvrfProof
  )
    external
    view
    returns (
      OrandECDSAProof memory ecdsaProof,
      uint96 currentEpochNumber,
      bool isEpochLinked,
      bool isValidDualProof,
      uint256 currentEpochResult,
      uint256 verifiedEpochResult
    );

  // Get address of ECVRF verifier
  function getECVRFVerifier() external view returns (address ecvrfVerifier);
}
