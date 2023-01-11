// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.4 <0.9.0;
pragma abicoder v2;

import '@openzeppelin/contracts/utils/Address.sol';
import '../interfaces/IOrosignV1.sol';
import '../libraries/Verifier.sol';
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
  using Verifier for bytes;

  // Permission constants
  // View permission only
  uint256 private constant PERMISSION_OBSERVER = 1;
  // Create a new ECDSA proof
  uint256 private constant PERMISSION_CREATE = 2;
  // Allowed to sign ECDSA proof
  uint256 private constant PERMISSION_VOTE = 4;
  // Permission to execute transaction
  uint256 private constant PERMISSION_EXECUTE = 8;

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

  // Receive payment
  event InternalTransaction(address indexed from, address indexed to, uint256 indexed value);

  // Qick transfer event
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
    // We should able to init
    if (_init(users_, roles_) == 0) {
      revert UnableToInitContract();
    }
    if (threshold_ <= 0 || threshold_ > users_.length) {
      revert InvalidThreshold();
    }
    uint256 totalSinger = 0;
    for (uint256 i = 0; i < users_.length; i += 1) {
      if (roles_[i] & PERMISSION_VOTE > 0) {
        totalSinger += 1;
      }
    }
    // These values can be set once
    _chainId = chainId_;
    _threshold = threshold_;
    _totalSigner = totalSinger;
    return true;
  }

  /*******************************************************
   * User section
   ********************************************************/
  // Transfer role to new user
  function transferRole(address newUser) external onlyUser {
    // New user will be activated after SECURED_TIMEOUT
    // We prevent them to vote and transfer permission to the other
    // and vote again
    _transferRole(newUser, SECURED_TIMEOUT + 1 hours);
  }

  /*******************************************************
   * Creator section
   ********************************************************/
  // Transfer with signed ECDSA proofs instead of on-chain voting
  function executeTransaction(
    bytes[] memory signatures,
    bytes memory txData
  ) external onlyAllow(PERMISSION_EXECUTE) returns (bool) {
    uint256 totalSigned = 0;
    address[] memory signedAddresses = new address[](signatures.length);
    for (uint256 i = 0; i < signatures.length; i += 1) {
      address signer = txData.verifySerialized(signatures[i]);
      // Each signer only able to be counted once
      if (isPermissions(signer, PERMISSION_VOTE) && _isNotInclude(signedAddresses, signer)) {
        signedAddresses[totalSigned] = signer;
        totalSigned += 1;
      }
    }
    // Number of votes weren't passed the threshold
    if (totalSigned < _threshold) {
      revert ThresholdNotPassed(totalSigned, _threshold);
    }
    // Decode packed data from packed transaction
    (
      uint256 chainId,
      uint256 votingDeadline,
      uint256 nonce,
      address target,
      uint256 value,
      bytes memory data
    ) = decodePackedTransaction(txData);
    // Chain Id should be the same
    if (chainId != _chainId) {
      revert ProofChainIdMismatch(chainId);
    }
    // Nonce should be equal
    if (nonce != _nonce) {
      revert ProofInvalidNonce(nonce, _nonce);
    }
    // Voting should not be passed
    if (votingDeadline < block.timestamp) {
      revert ProofExpired(votingDeadline, block.timestamp);
    }
    // Increasing nonce
    _nonce = nonce + 1;
    if (target.isContract()) {
      target.functionCallWithValue(data, value);
    } else {
      payable(address(target)).transfer(value);
    }
    emit ExecutedTransaction(target, value, data);
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
  )
    public
    pure
    returns (uint256 chainId, uint256 votingDeadline, uint256 nonce, address target, uint256 value, bytes memory data)
  {
    uint256 packagedNonce = txData.readUint256(0);
    target = txData.readAddress(32);
    value = txData.readUint256(52);
    data = txData.readBytes(84, txData.length - 84);
    //  ChainId ++ votingDeadline ++ Nonce
    chainId = (packagedNonce >> 192);
    votingDeadline = (packagedNonce >> 128) & 0xffffffffffffffff;
    nonce = packagedNonce & 0xffffffffffffffffffffffffffffffff;
  }

  // Get packed transaction to create raw ECDSA proof
  function encodePackedTransaction(
    uint256 chainId,
    uint256 timeout,
    address target,
    uint256 value,
    bytes memory data
  ) external view returns (bytes memory) {
    if (timeout > SECURED_TIMEOUT) {
      revert InsecuredTimeout(timeout);
    }
    return abi.encodePacked(uint64(chainId), uint64(block.timestamp + timeout), uint128(_nonce), target, value, data);
  }

  // Get valid nonce
  function getNonce() external view returns (uint256) {
    return _nonce;
  }

  // Get total number of signers in this Multi Signature
  function getTotalSigner() external view returns (uint256) {
    return _totalSigner;
  }
}
