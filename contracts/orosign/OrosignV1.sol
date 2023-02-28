// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.4 <0.9.0;
pragma abicoder v2;

import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '../interfaces/IOrosignV1.sol';
import '../libraries/Bytes.sol';
import '../libraries/Permissioned.sol';

/**
 * Orosign V1
 * Multi Signature Wallet based on off-chain ECDSA Proof
 */
contract OrosignV1 is IOrosignV1, Permissioned {
  // Address lib providing safe {call} and {delegatecall}
  using Address for address;

  // Byte manipulation
  using Bytes for bytes;

  // Verifiy digital signature
  using ECDSA for bytes;
  using ECDSA for bytes32;

  // Permission constants
  // View permission only
  uint256 private constant PERMISSION_OBSERVER = 1;
  // Allowed to sign ECDSA proof
  uint256 private constant PERMISSION_SIGN = 2;
  // Permission to execute transaction
  uint256 private constant PERMISSION_EXECUTE = 4;
  // Allowed to propose a new transfer
  uint256 private constant PERMISSION_CREATE = 8;

  // Secure timeout
  uint256 private constant SECURED_TIMEOUT = 3 days;

  // Chain Id
  uint256 private chainId;

  // Quick transaction nonce
  uint256 private nonce = 0;

  // Total number of signer
  uint256 private totalSigner = 0;

  // Required threshold for a proposal to be passed
  uint256 private threshold;

  // Execute transaction event
  event ExecutedTransaction(address indexed target, uint256 indexed value, bytes indexed data);

  // This contract able to receive fund
  receive() external payable {}

  // Init method which can be called once
  function init(
    uint256 inputChainId,
    address[] memory userList,
    uint256[] memory roleList,
    uint256 votingThreshold
  ) external override returns (bool) {
    uint256 countingSigner = 0;
    uint256 totalExecutor = 0;
    uint256 totalCreator = 0;
    // These values can be set once
    chainId = inputChainId;
    // We should able to init
    _init(userList, roleList);

    for (uint256 i = 0; i < userList.length; i += 1) {
      // Equal to isPermission(userList[i], PERMISSION_SIGN)
      if ((roleList[i] & PERMISSION_SIGN) == PERMISSION_SIGN) {
        countingSigner += 1;
      }
      if ((roleList[i] & PERMISSION_EXECUTE) == PERMISSION_EXECUTE) {
        totalExecutor += 1;
      }
      if ((roleList[i] & PERMISSION_CREATE) == PERMISSION_CREATE) {
        totalCreator += 1;
      }
    }
    // Threshold <= totalSigner
    // Theshold > 0
    if (0 == votingThreshold || votingThreshold > countingSigner) {
      revert InvalidThreshold(votingThreshold, countingSigner);
    }

    // totalSigner > 0
    // totalExecutor > 0
    // totalCreator > 0
    if (0 == countingSigner || 0 == totalExecutor || 0 == totalCreator) {
      revert InvalidPermission(countingSigner, totalExecutor, totalCreator);
    }

    threshold = votingThreshold;
    totalSigner = countingSigner;
    return true;
  }

  /*******************************************************
   * User section
   ********************************************************/

  // Transfer role to new user
  function transferRole(address newUser) external onlyUser returns (bool) {
    // New user will be activated after SECURED_TIMEOUT
    // We prevent them to vote and transfer permission to the other
    // and vote again
    _transferRole(newUser, SECURED_TIMEOUT + 1 hours);
    return true;
  }

  /*******************************************************
   * Executor section
   ********************************************************/

  // Transfer with signed ECDSA proofs instead of on-chain voting
  function executeTransaction(
    bytes memory creatorSignature,
    bytes[] memory signatureList,
    bytes memory message
  ) external onlyAllow(PERMISSION_EXECUTE) returns (bool) {
    uint256 totalSigned = 0;
    address creatorAddress = message.toEthSignedMessageHash().recover(creatorSignature);
    address[] memory signedAddresses = new address[](signatureList.length);

    // If there is NO creator proof revert
    if (!_isPermission(creatorAddress, PERMISSION_CREATE)) {
      revert ProofNoCreator();
    }

    // Couting total signed proof
    for (uint256 i = 0; i < signatureList.length; i += 1) {
      address recoveredSigner = message.toEthSignedMessageHash().recover(signatureList[i]);
      // Each signer only able to be counted once
      if (_isPermission(recoveredSigner, PERMISSION_SIGN) && _isNotInclude(signedAddresses, recoveredSigner)) {
        signedAddresses[totalSigned] = recoveredSigner;
        totalSigned += 1;
      }
    }

    // Number of votes weren't passed the threshold
    if (totalSigned < threshold) {
      revert ThresholdNotPassed(totalSigned, threshold);
    }
    // Decode packed data from packed transaction
    PackedTransaction memory packedTransaction = _decodePackedTransaction(message);

    // Chain Id should be the same
    if (packedTransaction.chainId != chainId) {
      revert ProofChainIdMismatch(packedTransaction.chainId, chainId);
    }
    // Nonce should be equal
    if (packedTransaction.nonce != nonce) {
      revert ProofInvalidNonce(packedTransaction.nonce, nonce);
    }
    // ECDSA proofs should not expired
    if (packedTransaction.currentBlockTime > packedTransaction.votingDeadline) {
      revert ProofExpired(packedTransaction.votingDeadline, packedTransaction.currentBlockTime);
    }

    // Increasing nonce
    nonce = packedTransaction.nonce + 1;

    // If contract then use CALL otherwise do normal transfer
    if (packedTransaction.target.code.length > 0) {
      packedTransaction.target.functionCallWithValue(packedTransaction.data, packedTransaction.value);
    } else {
      payable(address(packedTransaction.target)).transfer(packedTransaction.value);
    }
    emit ExecutedTransaction(packedTransaction.target, packedTransaction.value, packedTransaction.data);
    return true;
  }

  /*******************************************************
   * Pure section
   ********************************************************/

  // Check if an address is already in the given list
  function _isNotInclude(address[] memory addressList, address checkAddress) private pure returns (bool) {
    for (uint256 i = 0; i < addressList.length; i += 1) {
      if (addressList[i] == checkAddress) {
        return false;
      }
    }
    return true;
  }

  /*******************************************************
   * Internal View section
   ********************************************************/

  // Decode data from packed transaction
  function _decodePackedTransaction(
    bytes memory txData
  ) internal view returns (PackedTransaction memory decodedTransaction) {
    uint256 packagedNonce = txData.readUint256(0);
    decodedTransaction = PackedTransaction({
      // Packed nonce
      // ChainId 64 bits ++ votingDeadline 64 bits ++ Nonce 128 bits
      chainId: uint64(packagedNonce >> 192),
      votingDeadline: uint64(packagedNonce >> 128),
      nonce: uint128(packagedNonce),
      // This value isn't actuall existing in the proof
      currentBlockTime: uint96(block.timestamp),
      // Transaction detail
      target: txData.readAddress(32),
      value: txData.readUint256(52),
      data: txData.readBytes(84, txData.length - 84)
    });
    return decodedTransaction;
  }

  // Get packed transaction to create raw ECDSA proof
  function _encodePackedTransaction(
    uint256 inputChainId,
    uint256 timeout,
    address target,
    uint256 value,
    bytes memory data
  ) internal view returns (bytes memory) {
    if (timeout > SECURED_TIMEOUT) {
      revert InsecuredTimeout(timeout);
    }
    return
      abi.encodePacked(uint64(inputChainId), uint64(block.timestamp + timeout), uint128(nonce), target, value, data);
  }

  /*******************************************************
   * External View section
   ********************************************************/

  // Decode data from packed transaction
  function decodePackedTransaction(
    bytes memory txData
  ) external view returns (PackedTransaction memory decodedTransaction) {
    return _decodePackedTransaction(txData);
  }

  // Get packed transaction to create raw ECDSA proof
  function encodePackedTransaction(
    uint256 inputChainId,
    uint256 timeout,
    address target,
    uint256 value,
    bytes memory data
  ) external view returns (bytes memory) {
    return _encodePackedTransaction(inputChainId, timeout, target, value, data);
  }

  // Get packed transaction to create raw ECDSA proof
  function quickEncodePackedTransaction(
    address target,
    uint256 value,
    bytes memory data
  ) external view returns (bytes memory) {
    return _encodePackedTransaction(chainId, SECURED_TIMEOUT / 3, target, value, data);
  }

  // Get multisig metadata
  function getMetadata() external view returns (OrosignV1Metadata memory result) {
    result = OrosignV1Metadata({
      chainId: chainId,
      nonce: nonce,
      totalSigner: totalSigner,
      threshold: threshold,
      securedTimeout: SECURED_TIMEOUT,
      blockTimestamp: block.timestamp
    });
    return result;
  }
}
