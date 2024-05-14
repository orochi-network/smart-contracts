// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '../libraries/Ownable.sol';
import '../libraries/ReentrancyGuard.sol';
import '../orand-v3/interfaces/IOrandProviderV3.sol';
import '../orand-v3/interfaces/IOrandECVRFV3.sol';
import '../orand-v3/interfaces/IOrandConsumerV3.sol';
import '../orand-v3/OrandStorageV3.sol';
import '../orand-v3/OrandManagementV3.sol';
import '../orand-v3/OrandECDSAV3.sol';
import '../orocle-v1/interfaces/IOrocleAggregatorV1.sol';

contract OrandProviderTest is
  Initializable,
  Ownable,
  ReentrancyGuard,
  OrandStorageV3,
  OrandManagementV3,
  OrandECDSAV3,
  IOrandProviderV3
{
  // ECVRF verifier smart contract
  IOrandECVRFV3 private ecvrf;

  // Orocle V1
  IOrocleAggregatorV1 private oracle;

  // We allow max batching is 1000
  uint256 private maxBatching;

  // Event: Set New ECVRF Verifier
  event SetNewECVRFVerifier(address indexed actor, address indexed ecvrfAddress);

  // Event: Set the limit for batching randomness
  event SetBatchingLimit(address indexed actor, uint256 indexed maxBatching);

  // Event: set new oracle
  event SetNewOracle(address indexed actor, address indexed newOracle);

  // Provider V3 construct method

  function initialize(
    uint256[2] memory publicKey,
    address operator,
    address ecvrfAddress,
    address oracleAddress,
    uint256 maxBatchingLimit
  ) public initializer {
    Ownable._initOwnable();
    ReentrancyGuard._initReentrancyGuard();
    OrandManagementV3._initOrandManagementV3(publicKey);
    OrandECDSAV3._initOrandECDSAV3(operator);
    _setNewECVRFVerifier(ecvrfAddress);
    _setNewOracle(oracleAddress);
    _setMaxBatching(maxBatchingLimit);
  }

  //=======================[  Owner  ]====================

  // Update new ECVRF verifier
  function setMaxBatching(uint256 maxBatchingLimit) external onlyOwner returns (bool) {
    _setMaxBatching(maxBatchingLimit);
    return true;
  }

  // Update new ECVRF verifier
  function setNewOracle(address oracleAddress) external onlyOwner returns (bool) {
    _setNewOracle(oracleAddress);
    return true;
  }

  // Update new ECVRF verifier
  function setNewECVRFVerifier(address ecvrfAddress) external onlyOwner returns (bool) {
    _setNewECVRFVerifier(ecvrfAddress);
    return true;
  }

  // Set new public key to verify proof
  function setPublicKey(uint256[2] memory pk) external onlyOwner returns (bool) {
    _setPublicKey(pk);
    return true;
  }

  //=======================[  Internal  ]====================

  // Update new ECVRF verifier
  function _setMaxBatching(uint256 maxBatchingLimit) internal {
    maxBatching = maxBatchingLimit;
    emit SetBatchingLimit(msg.sender, maxBatchingLimit);
  }

  // Update new ECVRF verifier
  function _setNewOracle(address oracleAddress) internal {
    oracle = IOrocleAggregatorV1(oracleAddress);
    emit SetNewOracle(msg.sender, oracleAddress);
  }

  // Update new ECVRF verifier
  function _setNewECVRFVerifier(address ecvrfAddress) internal {
    ecvrf = IOrandECVRFV3(ecvrfAddress);
    emit SetNewECVRFVerifier(msg.sender, ecvrfAddress);
  }

  // Forward call to receiver
  function _forward(address receiverAddress, uint256 result) internal {
    IOrandConsumerV3 consumerContract = IOrandConsumerV3(receiverAddress);
    bool currentProcessResponse = false;
    if (receiverAddress.code.length > 0) {
      for (uint256 i = 0; i < maxBatching; i += 1) {
        try consumerContract.consumeRandomness(result) returns (bool contractResponse) {
          currentProcessResponse = contractResponse;
        } catch {
          currentProcessResponse = false;
        }
        if (currentProcessResponse) {
          oracle.fulfill(0, abi.encodePacked(receiverAddress));
          break;
        }
        result = uint256(keccak256(abi.encodePacked(result)));
      }
    }
  }

  //=======================[  External  ]====================

  // Start new genesis for receiver
  function genesis(bytes memory fraudProof, ECVRFProof calldata ecvrfProof) external nonReentrant returns (bool) {
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

    // Forward proof to target contract
    _forward(ecdsaProof.receiverAddress, result);

    return true;
  }

  // Publish new epoch with Fraud Proof
  function publishFraudProof(
    bytes memory fraudProof,
    ECVRFProof calldata ecvrfProof
  ) external nonReentrant returns (bool) {
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
    _forward(ecdsaProof.receiverAddress, result);

    return true;
  }

  // Publish new epoch with ECDSA Proof and Fraud Proof
  function publish(address receiverAddress, ECVRFProof calldata ecvrfProof) external nonReentrant returns (bool) {
    uint256 currentEpochResult = _getCurrentEpochResult(receiverAddress);

    // Current alpha must be the result of previous epoch
    if (ecvrfProof.alpha != currentEpochResult) {
      revert InvalidAlphaValue(currentEpochResult, ecvrfProof.alpha);
    }

    // y = keccak256(gamma.x, gamma.y)
    // uint256 y = uint256(keccak256(abi.encodePacked(ecvrfProof.gamma)));
    uint256 result = ecvrf.verifyStructECVRFProof(_getPublicKey(), ecvrfProof);

    // Add epoch to the epoch chain of Orand ECVRF
    _addEpoch(receiverAddress, result);

    // Check for the existing smart contract and forward randomness to receiver
    _forward(receiverAddress, result);

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

  // Get address of Oracle
  function getOracle() external pure returns (address oracleAddress) {
    return address(0);
  }

  // Get maximum batching limit
  function getMaximumBatching() external view returns (uint256 maxBatchingLimit) {
    return maxBatching;
  }
}
