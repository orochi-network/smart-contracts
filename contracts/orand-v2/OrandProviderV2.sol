// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '@openzeppelin/contracts/access/Ownable.sol';
import './interfaces/IOrandProviderV2.sol';
import './interfaces/IOrandECVRFV2.sol';
import './interfaces/IOrandConsumerV2.sol';
import './OrandStorageV2.sol';
import './OrandManagementV2.sol';

contract OrandProviderV2 is IOrandProviderV2, Ownable, OrandStorageV2, OrandManagementV2 {
  // ECVRF verifier smart contract
  IOrandECVRFV2 ecvrf;

  // Event: Set New ECVRF Verifier
  event SetNewECVRFVerifier(address indexed actor, address indexed ecvrfAddress);

  // Provider V2 construct method
  constructor(bytes memory pk, address ecvrfAddress) OrandManagementV2(pk) {
    ecvrf = IOrandECVRFV2(ecvrfAddress);
  }

  //=======================[  Owner  ]====================

  // Update new ECVRF verifier
  function setNewECVRFVerifier(address ecvrfAddress) external onlyOwner {
    ecvrf = IOrandECVRFV2(ecvrfAddress);
    emit SetNewECVRFVerifier(msg.sender, ecvrfAddress);
  }

  // Set new public key to verify proof
  function setPublicKey(bytes memory pk) external onlyOwner returns (bool) {
    _setPublicKey(pk);
    return true;
  }

  //=======================[  External  ]====================

  // Publish new epoch with ECDSA Proof and Fraud Proof
  function publish(
    address receiver,
    uint256[2] calldata gamma,
    uint256 c,
    uint256 s,
    uint256 alpha,
    address uWitness,
    uint256[2] calldata cGammaWitness,
    uint256[2] calldata sHashWitness,
    uint256 zInv
  ) external returns (bool) {
    uint256 currentEpochResult = _getCurrentEpochResult(receiver);

    // Current alpha must be the result of previous epoch
    if (currentEpochResult != 0 && alpha != currentEpochResult) {
      revert InvalidAlphaValue(currentEpochResult, alpha);
    }

    // y = keccak256(gamma.x, gamma.y)
    // uint256 y = uint256(keccak256(abi.encodePacked(ecvrfProof.gamma)));
    uint256 result = ecvrf.verifyECVRFProof(
      _getPublicKey(),
      gamma,
      c,
      s,
      alpha,
      uWitness,
      cGammaWitness,
      sHashWitness,
      zInv
    );

    // Add epoch to the epoch chain of Orand ECVRF
    _addEpoch(receiver, result);

    // Check for the existing smart contract and forward randomness to receiver
    if (receiver.code.length > 0) {
      if (!IOrandConsumerV2(receiver).consumeRandomness(result)) {
        revert UnableToForwardRandomness(receiver, result);
      }
    }

    return true;
  }

  //=======================[  External View  ]====================

  // Verify a dual proof epoch is valid or not for current era
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
    )
  {
    currentEpochNumber = _getCurrentEpoch(receiver);
    currentEpochResult = _getCurrentEpochResult(receiver);
    inputAlpha = alpha;
    isEpochLinked = currentEpochResult == alpha;

    // y = keccak256(gamma.x, gamma.y)
    // uint256 y = uint256(keccak256(abi.encodePacked(ecvrfProof.gamma)));
    verifiedEpochResult = ecvrf.verifyECVRFProof(
      _getPublicKey(),
      gamma,
      c,
      s,
      alpha,
      uWitness,
      cGammaWitness,
      sHashWitness,
      zInv
    );
  }

  // Get address of ECVRF verifier
  function getECVRFVerifier() external view returns (address ecvrfVerifier) {
    return address(ecvrf);
  }

  // Get address of operator for corresponding public key
  function getOperator() external view returns (address operator) {
    return address(uint160(_getPublicKeyDigest()));
  }
}
