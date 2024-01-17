// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '../libraries/VRF.sol';
import './interfaces/IOrandECVRFV2.sol';

contract OrandECVRFV2 is VRF, IOrandECVRFV2 {
  // Verify raw session of ECVRF
  function verifyECVRFProof(
    uint256[2] calldata pk,
    uint256[2] calldata gamma,
    uint256 c,
    uint256 s,
    uint256 alpha,
    address uWitness,
    uint256[2] calldata cGammaWitness,
    uint256[2] calldata sHashWitness,
    uint256 zInv
  ) external view returns (uint256 y) {
    _verifyVRFProof(pk, gamma, c, s, alpha, uWitness, cGammaWitness, sHashWitness, zInv);
    return uint256(keccak256(abi.encode(gamma)));
  }

  // Verify submited structure of ECVRF
  function verifyStructECVRFProof(
    IOrandProviderV2.CallDataECVRFProof calldata ecvrfProof
  ) external view override returns (uint256 y) {
    _verifyVRFProof(
      ecvrfProof.pk,
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
