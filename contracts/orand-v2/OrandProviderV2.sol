// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '@openzeppelin/contracts/access/Ownable.sol';
import './interfaces/IOrandProviderV2.sol';
import './interfaces/IOrandECVRFV2.sol';
import './interfaces/IOrandConsumerV2.sol';
import './OrandStorageV2.sol';
import './OrandManagementV2.sol';
import './OrandECDSAV2.sol';

contract OrandProviderV2 is IOrandProviderV2, Ownable, OrandStorageV2, OrandManagementV2, OrandECDSAV2 {
  // ECVRF verifier smart contract
  IOrandECVRFV2 ecvrf;

  // We allow max batching is 1000
  uint256 private maxBatching;

  // Event: Set New ECVRF Verifier
  event SetNewECVRFVerifier(address indexed actor, address indexed ecvrfAddress);

  // Event: Set the limit for batching randomness
  event SetBatchingLimit(address indexed actor, uint256 indexed maxBatching);

  // Provider V2 construct method
  constructor(
    uint256[2] memory publicKey,
    address operator,
    address ecvrfAddress,
    uint256 maxBatchingLimit
  ) OrandManagementV2(publicKey) OrandECDSAV2(operator) {
    ecvrf = IOrandECVRFV2(ecvrfAddress);
    maxBatching = maxBatchingLimit;
  }

  //=======================[  Owner  ]====================

  // Update new ECVRF verifier
  function setMaxBatching(uint256 maxBatchingLimit) external onlyOwner returns (bool) {
    maxBatching = maxBatchingLimit;
    emit SetBatchingLimit(msg.sender, maxBatchingLimit);
    return true;
  }

  // Update new ECVRF verifier
  function setNewECVRFVerifier(address ecvrfAddress) external onlyOwner returns (bool) {
    ecvrf = IOrandECVRFV2(ecvrfAddress);
    emit SetNewECVRFVerifier(msg.sender, ecvrfAddress);
    return true;
  }

  // Set new public key to verify proof
  function setPublicKey(uint256[2] memory pk) external onlyOwner returns (bool) {
    _setPublicKey(pk);
    return true;
  }

  //=======================[  External  ]====================

  // Publish new epoch with ECDSA Proof and Fraud Proof
  function publish(address receiver, ECVRFProof calldata ecvrfProof) external returns (bool) {
    uint256 currentEpochResult = _getCurrentEpochResult(receiver);

    // Current alpha must be the result of previous epoch
    if (currentEpochResult > 0 && ecvrfProof.alpha != currentEpochResult) {
      revert InvalidAlphaValue(currentEpochResult, ecvrfProof.alpha);
    }

    // y = keccak256(gamma.x, gamma.y)
    // uint256 y = uint256(keccak256(abi.encodePacked(ecvrfProof.gamma)));
    uint256 result = ecvrf.verifyStructECVRFProof(_getPublicKey(), ecvrfProof);

    // Add epoch to the epoch chain of Orand ECVRF
    _addEpoch(receiver, result);

    // Check for the existing smart contract and forward randomness to receiver
    if (receiver.code.length > 0) {
      for (uint256 i = 0; i < maxBatching; i += 1) {
        if (!IOrandConsumerV2(receiver).consumeRandomness(result)) {
          break;
        }
        result = uint256(keccak256(abi.encodePacked(result)));
      }
    }

    return true;
  }

  //=======================[  External View  ]====================

  // Verify a ECVRF proof epoch is valid or not
  function verifyEpoch(
    address receiver,
    ECVRFProof calldata ecvrfProof
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
    inputAlpha = ecvrfProof.alpha;
    isEpochLinked = currentEpochResult == ecvrfProof.alpha;

    // y = keccak256(gamma.x, gamma.y)
    // uint256 y = uint256(keccak256(abi.encodePacked(ecvrfProof.gamma)));
    verifiedEpochResult = ecvrf.verifyStructECVRFProof(_getPublicKey(), ecvrfProof);
  }

  // Get address of ECVRF verifier
  function getECVRFVerifier() external view returns (address ecvrfVerifier) {
    return address(ecvrf);
  }
}
