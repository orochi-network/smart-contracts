// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '@openzeppelin/contracts/access/Ownable.sol';
import './interfaces/IOrandProviderV2.sol';
import './interfaces/IOrandECVRFV2.sol';
import './interfaces/IOrandConsumerV2.sol';
import './OrandStorageV2.sol';
import './OrandManagementV2.sol';
import './OrandECDSAV2.sol';
import '../orocle-v1/interfaces/IOrocleAggregatorV1.sol';

contract OrandProviderV2 is IOrandProviderV2, Ownable, OrandStorageV2, OrandManagementV2, OrandECDSAV2 {
  // ECVRF verifier smart contract
  IOrandECVRFV2 ecvrf;

  // Orocle V1
  IOrocleAggregatorV1 oracle;

  // We allow max batching is 1000
  uint256 private maxBatching;

  // Event: Set New ECVRF Verifier
  event SetNewECVRFVerifier(address indexed actor, address indexed ecvrfAddress);

  // Event: Set the limit for batching randomness
  event SetBatchingLimit(address indexed actor, uint256 indexed maxBatching);

  // Event: set new oracle
  event SetNewOracle(address indexed actor, address indexed newOracle);

  // Provider V2 construct method
  constructor(
    uint256[2] memory publicKey,
    address operator,
    address ecvrfAddress,
    address oracleAddress,
    uint256 maxBatchingLimit
  ) OrandManagementV2(publicKey) OrandECDSAV2(operator) {
    ecvrf = IOrandECVRFV2(ecvrfAddress);
    oracle = IOrocleAggregatorV1(oracleAddress);
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
  function setNewOracle(address oracleAddress) external onlyOwner returns (bool) {
    oracle = IOrocleAggregatorV1(oracleAddress);
    emit SetNewOracle(msg.sender, oracleAddress);
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

  // Start new genesis for receiver
  function genesis(bytes memory fraudProof, ECVRFProof calldata ecvrfProof) external returns (bool) {
    OrandECDSAProof memory ecdsaProof = _decodeFraudProof(fraudProof);
    uint256 currentEpochResult = _getCurrentEpochResult(ecdsaProof.receiverAddress);

    // Invalid genesis epoch
    if (currentEpochResult != 0 || ecdsaProof.receiverEpoch != 0) {
      revert InvalidGenesisEpoch(currentEpochResult);
    }

    // ECVRF proof digest must match
    if (
      ecdsaProof.ecvrfProofDigest !=
      uint256(
        keccak256(
          abi.encodePacked(
            _getPublicKey(),
            ecvrfProof.gamma,
            ecvrfProof.c,
            ecvrfProof.s,
            ecvrfProof.alpha,
            ecvrfProof.uWitness,
            ecvrfProof.cGammaWitness,
            ecvrfProof.sHashWitness,
            ecvrfProof.zInv
          )
        )
      )
    ) {
      revert InvalidECVRFProofDigest();
    }

    // y = keccak256(gamma.x, gamma.y)
    // uint256 y = uint256(keccak256(abi.encodePacked(ecvrfProof.gamma)));
    uint256 result = ecvrf.verifyStructECVRFProof(_getPublicKey(), ecvrfProof);

    // Add epoch to the epoch chain of Orand ECVRF
    _addEpoch(ecdsaProof.receiverAddress, result);

    return true;
  }

  // Publish new epoch with Fraud Proof
  function publishFraudProof(bytes memory fraudProof, ECVRFProof calldata ecvrfProof) external returns (bool) {
    OrandECDSAProof memory ecdsaProof = _decodeFraudProof(fraudProof);
    uint256 currentEpochResult = _getCurrentEpochResult(ecdsaProof.receiverAddress);

    // Current alpha must be the result of previous epoch
    if (ecdsaProof.signer != _getOperator()) {
      revert InvalidProofSigner(ecdsaProof.signer);
    }

    // Current alpha must be the result of previous epoch
    if (ecvrfProof.alpha != currentEpochResult) {
      revert InvalidAlphaValue(currentEpochResult, ecvrfProof.alpha);
    }

    // ECVRF proof digest must match
    if (
      ecdsaProof.ecvrfProofDigest !=
      uint256(
        keccak256(
          abi.encodePacked(
            _getPublicKey(),
            ecvrfProof.gamma,
            ecvrfProof.c,
            ecvrfProof.s,
            ecvrfProof.alpha,
            ecvrfProof.uWitness,
            ecvrfProof.cGammaWitness,
            ecvrfProof.sHashWitness,
            ecvrfProof.zInv
          )
        )
      )
    ) {
      revert InvalidECVRFProofDigest();
    }

    // y = keccak256(gamma.x, gamma.y)
    uint256 result = uint256(keccak256(abi.encodePacked(ecvrfProof.gamma)));

    // Add epoch to the epoch chain of Orand ECVRF
    _addEpoch(ecdsaProof.receiverAddress, result);

    // Check for the existing smart contract and forward randomness to receiver
    if (ecdsaProof.receiverAddress.code.length > 0) {
      for (uint256 i = 0; i < maxBatching; i += 1) {
        if (!IOrandConsumerV2(ecdsaProof.receiverAddress).consumeRandomness(result)) {
          oracle.request(0, abi.encodePacked(ecdsaProof.receiverAddress));
          break;
        }
        result = uint256(keccak256(abi.encodePacked(result)));
      }
    }

    return true;
  }

  // Publish new epoch with ECDSA Proof and Fraud Proof
  function publish(address receiver, ECVRFProof calldata ecvrfProof) external returns (bool) {
    uint256 currentEpochResult = _getCurrentEpochResult(receiver);

    // Current alpha must be the result of previous epoch
    if (ecvrfProof.alpha != currentEpochResult) {
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
          oracle.request(0, abi.encodePacked(receiver));
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
    )
  {
    ecdsaProof = _decodeFraudProof(fraudProof);

    isValidDualProof =
      ecdsaProof.ecvrfProofDigest ==
      uint256(
        keccak256(
          abi.encodePacked(
            _getPublicKey(),
            ecvrfProof.gamma,
            ecvrfProof.c,
            ecvrfProof.s,
            ecvrfProof.alpha,
            ecvrfProof.uWitness,
            ecvrfProof.cGammaWitness,
            ecvrfProof.sHashWitness,
            ecvrfProof.zInv
          )
        )
      );

    currentEpochNumber = _getCurrentEpoch(ecdsaProof.receiverAddress);
    currentEpochResult = _getCurrentEpochResult(ecdsaProof.receiverAddress);
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
