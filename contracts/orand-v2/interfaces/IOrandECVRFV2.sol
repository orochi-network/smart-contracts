// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;
import './IOrandProviderV2.sol';

interface IOrandECVRFV2 {
  // Verify proof from provider
  function verifyECVRFProof(
    uint256[2] memory pk,
    uint256[2] memory gamma,
    uint256 c,
    uint256 s,
    uint256 alpha,
    address uWitness,
    uint256[2] memory cGammaWitness,
    uint256[2] memory sHashWitness,
    uint256 zInv
  ) external view returns (uint256 y);

  // Verify proof from provider
  function verifyStructECVRFProof(
    IOrandProviderV2.CallDataECVRFProof calldata ecvrfProof
  ) external view returns (uint256 y);
}
