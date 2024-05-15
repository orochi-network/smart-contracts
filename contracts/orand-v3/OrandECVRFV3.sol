// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '../libraries/VRF.sol';
import './interfaces/IOrandECVRFV3.sol';

contract OrandECVRFV3 is VRF, IOrandECVRFV3 {
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
  ) external view returns (uint256 y) {
    _verifyVRFProof(pk, gamma, c, s, alpha, uWitness, cGammaWitness, sHashWitness, zInv);
    return uint256(keccak256(abi.encode(gamma)));
  }

  // Verify structed proof of ECVRF
  function verifyStructECVRFProof(
    uint256[2] memory pk,
    IOrandProviderV3.ECVRFProof memory ecvrfProof
  ) external view returns (uint256 y) {
    _verifyVRFProof(
      pk,
      ecvrfProof.gamma,
      ecvrfProof.c,
      ecvrfProof.s,
      ecvrfProof.alpha,
      ecvrfProof.uWitness,
      ecvrfProof.cGammaWitness,
      ecvrfProof.sHashWitness,
      ecvrfProof.zInv
    );
    return uint256(keccak256(abi.encode(ecvrfProof.gamma)));
  }
}
