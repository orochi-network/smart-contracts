// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

error UnableToForwardRandomness(address receiver, uint256 y);
error InvalidAlphaValue(uint256 expectedAlpha, uint256 givenAlpha);

interface IOrandProviderV2 {
  // Verify a ECVRF proof epoch is valid or not
  function verifyEpoch(
    address receiver,
    uint256[2] calldata gamma,
    uint256 c,
    uint256 s,
    uint256 alpha,
    address uWitness,
    uint256[2] calldata cGammaWitness,
    uint256[2] calldata sHashWitness,
    uint256 zInv
  )
    external
    view
    returns (
      uint96 currentEpochNumber,
      bool isEpochLinked,
      uint256 currentEpochResult,
      uint256 inputAlpha,
      uint256 verifiedEpochResult
    );

  // Get address of ECVRF verifier
  function getECVRFVerifier() external view returns (address ecvrfVerifier);
}
