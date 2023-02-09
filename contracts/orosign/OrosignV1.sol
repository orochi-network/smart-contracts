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
 * Multi Signature Wallet base on off-chain ECDSA Proof
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
  uint256 private _chainId;

  // Quick transaction nonce
  uint256 private _nonce = 0;

  // Total number of signer
  uint256 private _totalSigner = 0;

  // Required threshold for a proposal to be passed
  uint256 private _threshold;

  // Execute transaction event
  event ExecutedTransaction(address indexed target, uint256 indexed value, bytes indexed data);

  // This contract able to receive fund
  receive() external payable {}

  // Init method which can be called once
  function init(
    uint256 chainId_,
    address[] memory users_,
    uint256[] memory roles_,
    uint256 threshold_
  ) external override returns (bool) {
    uint256 totalSigner = 0;
    uint256 totalExecutor = 0;
    uint256 totalCreator = 0;
    // These values can be set once
    _chainId = chainId_;
    // We should able to init
    if (!_init(users_, roles_)) {
      revert UnableToInitContract();
    }
    for (uint256 i = 0; i < users_.length; i += 1) {
      // Equal to isPermission(users_[i], PERMISSION_SIGN)
      if ((roles_[i] & PERMISSION_SIGN) == PERMISSION_SIGN) {
        totalSigner += 1;
      }
      if ((roles_[i] & PERMISSION_EXECUTE) == PERMISSION_EXECUTE) {
        totalExecutor += 1;
      }
      if ((roles_[i] & PERMISSION_CREATE) == PERMISSION_CREATE) {
        totalCreator += 1;
      }
    }
    // Threshold <= totalSigner
    // Theshold > 0
    if (0 == threshold_ || threshold_ > totalSigner) {
      revert InvalidThreshold(threshold_, totalSigner);
    }

    // totalSigner > 0
    // totalExecutor > 0
    // totalCreator > 0
    if (0 == totalSigner || 0 == totalExecutor || 0 == totalCreator) {
      revert InvalidPermission(totalSigner, totalExecutor, totalCreator);
    }

    _threshold = threshold_;
    _totalSigner = totalSigner;
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
    return _transferRole(newUser, SECURED_TIMEOUT + 1 hours);
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
    if (!isPermission(creatorAddress, PERMISSION_CREATE)) {
      revert ProofNoCreator();
    }

    // Couting total signed proof
    for (uint256 i = 0; i < signatureList.length; i += 1) {
      address recoveredSigner = message.toEthSignedMessageHash().recover(signatureList[i]);
      // Each signer only able to be counted once
      if (isPermission(recoveredSigner, PERMISSION_SIGN) && _isNotInclude(signedAddresses, recoveredSigner)) {
        signedAddresses[totalSigned] = recoveredSigner;
        totalSigned += 1;
      }
    }

    // Number of votes weren't passed the threshold
    if (totalSigned < _threshold) {
      revert ThresholdNotPassed(totalSigned, _threshold);
    }
    // Decode packed data from packed transaction
    PackedTransaction memory packedTransaction = decodePackedTransaction(message);

    // Chain Id should be the same
    if (packedTransaction.chainId != _chainId) {
      revert ProofChainIdMismatch(packedTransaction.chainId, _chainId);
    }
    // Nonce should be equal
    if (packedTransaction.nonce != _nonce) {
      revert ProofInvalidNonce(packedTransaction.nonce, _nonce);
    }
    // ECDSA proofs should not expired
    if (packedTransaction.currentBlockTime > packedTransaction.votingDeadline) {
      revert ProofExpired(packedTransaction.votingDeadline, packedTransaction.currentBlockTime);
    }

    // Increasing nonce
    _nonce = packedTransaction.nonce + 1;

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
   * View section
   ********************************************************/
  // Decode data from packed transaction
  function decodePackedTransaction(
    bytes memory txData
  ) public view returns (PackedTransaction memory decodedTransaction) {
    uint256 packagedNonce = txData.readUint256(0);
    decodedTransaction = PackedTransaction({
      // Packed nonce
      // ChainId 64 bits ++ votingDeadline 64 bits ++ Nonce 128 bits
      chainId: (packagedNonce >> 192),
      votingDeadline: (packagedNonce >> 128) & 0xffffffffffffffff,
      nonce: packagedNonce & 0xffffffffffffffffffffffffffffffff,
      // Transaction detail
      target: txData.readAddress(32),
      value: txData.readUint256(52),
      data: txData.readBytes(84, txData.length - 84),
      currentBlockTime: block.timestamp
    });
    return decodedTransaction;
  }

  // Get packed transaction to create raw ECDSA proof
  function encodePackedTransaction(
    uint256 chainId,
    uint256 timeout,
    address target,
    uint256 value,
    bytes memory data
  ) public view returns (bytes memory) {
    if (timeout > SECURED_TIMEOUT) {
      revert InsecuredTimeout(timeout);
    }
    return abi.encodePacked(uint64(chainId), uint64(block.timestamp + timeout), uint128(_nonce), target, value, data);
  }

  // Get packed transaction to create raw ECDSA proof
  function quickEncodePackedTransaction(
    address target,
    uint256 value,
    bytes memory data
  ) external view returns (bytes memory) {
    return encodePackedTransaction(_chainId, 1 days, target, value, data);
  }

  // Get multisig metadata
  function getMetadata() external view returns (OrosignV1Metadata memory result) {
    result = OrosignV1Metadata({
      chainId: _chainId,
      nonce: _nonce,
      totalSigner: _totalSigner,
      threshold: _threshold,
      securedTimeout: SECURED_TIMEOUT,
      blockTimestamp: block.timestamp
    });
    return result;
  }
}
