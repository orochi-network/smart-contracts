// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import './IOrandProviderV3.sol';

interface IOrandECVRFV3 {
  // Verify raw proof of ECVRF
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

  // Verify structed proof of ECVRF
  function verifyStructECVRFProof(
    uint256[2] memory pk,
    IOrandProviderV3.ECVRFProof memory ecvrfProof
  ) external view returns (uint256 y);
}
