// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import { ECDSA } from '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '../libraries/Operatable.sol';
import '../libraries/Bytes.sol';
import './OrochiNetworkToken.sol';

// All possible errors in the contract
error InvalidAddress(address inputAddress);
error ExceedDailyLimit(uint128 dailyLimit);
error InvalidProofLength(uint256 proofLength);
error InvalidProofSignature(address signer);
error InvalidUserNonce(address user, uint96 nonce);
error InvalidRecipient(address recipient, address proofRecipient);
error InactivatedCampaign(uint64 startTime, uint64 endTime);
error UnableToMint(address recipient, uint128 amount);
error InvalidTransactionTimestamp(uint64 timestamp);

/**
 * @title ONProver Contract
 */
contract ONProver is Ownable, Operatable, ReentrancyGuard {
  struct DailyClaim {
    // Total amount of tokens claimed today
    uint128 claimed;
    // Number of individual claims today
    uint128 userCount;
  }

  struct Configuration {
    // Maximum number of tokens that can be claimed per day
    uint128 maxDailyLimit;
    // Start time of campaign
    uint64 timeStart;
    // End time of campaign
    uint64 timeEnd;
    // Token contract
    OrochiNetworkToken tokenContract;
  }

  struct Transaction {
    // Receiver address of the transaction
    address to;
    // Nonce value of the transaction
    uint96 nonce;
    // Timestamp of the transaction
    // NOTE: don't use Date.now() on client side, use block.timestamp instead.
    uint64 timestamp;
    // Value of the transaction
    uint128 value;
  }

  // Mapping to track if a signature has been redeemed
  mapping(address => uint96) private userNonce;

  // Mapping to track daily claim
  mapping(uint256 => DailyClaim) private dailyClaimStorage;

  // Mapping to track total claim for each address
  mapping(address => uint256) private totalClaimed;

  // Configuration for the ONProver token
  Configuration private config;

  // Byte manipulation
  using Bytes for bytes;

  // Verifiy digital signature
  using ECDSA for bytes;
  using ECDSA for bytes32;

  /*******************************************************
   * Events
   ********************************************************/

  /**
   * Emitted when a user claims token
   * @param to Address receiving the token
   * @param amount Amount of token claimed
   */
  event TokenClaim(address indexed to, uint256 indexed amount);

  /**
   * Emitted when a user claims tokens via daily claim
   * @param to Address receiving the token
   * @param amount Amount of token claimed in daily claim
   * @param day Day since the start of the campaign
   */
  event TokenClaimDaily(address indexed to, uint256 indexed amount, uint256 day);

  /**
   * Update configuration start time
   * @param timeStart  Start time of the campaign in seconds since epoch
   */
  event UpdateConfigTimeStart(uint64 timeStart);

  /**
   * Update configuration end time
   * @param timeEnd End time of the campaign in seconds since epoch
   */
  event UpdateConfigTimeEnd(uint64 timeEnd);

  /**
   * Update configuration max daily limit
   * @param maxDailyLimit Max daily limit of token in one day
   */
  event UpdateConfigMaxDailyLimit(uint128 maxDailyLimit);

  /**
   * Update configuration token contract
   * @param tokenContract New token contract address
   */
  event UpdateConfigTokenContract(address tokenContract);

  /*******************************************************
   * Constructor
   ********************************************************/

  /**
   * Deploy and initialize the Orochi Network Token contract
   * @param listOperator List of operator will be add
   */
  constructor(Configuration memory cfg, address[] memory listOperator) {
    for (uint256 i = 0; i < listOperator.length; i += 1) {
      if (listOperator[i] == address(0)) {
        revert InvalidAddress(listOperator[i]);
      }
      _addOperator(listOperator[i]);
    }
    config = cfg;
  }

  /*******************************************************
   * Modifiers
   ********************************************************/

  modifier onlyActivatedCampaign() {
    if (block.timestamp >= config.timeStart && block.timestamp <= config.timeEnd) {
      revert InactivatedCampaign(config.timeStart, config.timeEnd);
    }
    _;
  }

  /*******************************************************
   * External Owner
   ********************************************************/

  /**
   * Add new operator to operator list
   * @param operatorNew New operator
   */
  function addOperator(address operatorNew) external onlyOwner returns (bool) {
    return _addOperator(operatorNew);
  }

  /**
   * Remove an operator from operator list
   * @param operatorOld Old operator
   */
  function removeOperator(address operatorOld) external onlyOwner returns (bool) {
    return _removeOperator(operatorOld);
  }

  /**
   * Set configuration for the campaign
   * @param cfg Configuration to set
   */
  function setConfiguration(Configuration memory cfg) external onlyOwner returns (bool) {
    if (cfg.timeStart != 0) {
      config.timeStart = cfg.timeStart;
      emit UpdateConfigTimeStart(cfg.timeStart);
    }
    if (cfg.timeEnd != 0) {
      config.timeEnd = cfg.timeEnd;
      emit UpdateConfigTimeEnd(cfg.timeEnd);
    }
    if (cfg.maxDailyLimit != 0) {
      config.maxDailyLimit = cfg.maxDailyLimit;
      emit UpdateConfigMaxDailyLimit(cfg.maxDailyLimit);
    }
    if (address(cfg.tokenContract) != address(0)) {
      config.tokenContract = cfg.tokenContract;
      emit UpdateConfigTokenContract(address(cfg.tokenContract));
    }
    return true;
  }

  /*******************************************************
   * External User Functions (requires signature)
   ********************************************************/

  /**
   * Claim tokens for a campaign using proof
   * @param proof Proof from operator
   */
  function claim(bytes memory proof) external onlyActivatedCampaign nonReentrant {
    Transaction memory transaction = _claim(proof);
    totalClaimed[msg.sender] += transaction.value;

    // If the timestamp is not zero, it means this claim is for daily token claim.
    if (transaction.timestamp > 0) {
      uint256 today = _getCurrentDay();
      dailyClaimStorage[today].userCount += 1;
      dailyClaimStorage[today].claimed += transaction.value;
      if (dailyClaimStorage[today].claimed > config.maxDailyLimit) {
        revert ExceedDailyLimit(config.maxDailyLimit);
      }
      // Check if the timestamp is within the valid range (24 hours) from now.
      if (transaction.timestamp < (config.timeStart + (today + 1) * 86400)) {
        revert InvalidTransactionTimestamp(transaction.timestamp);
      }
      emit TokenClaimDaily(msg.sender, transaction.value, today);
    } else {
      emit TokenClaim(msg.sender, transaction.value);
    }
  }

  /*******************************************************
   * Private Section
   ********************************************************/

  /**
   * Decompose the proof into its components.
   * @param proof Input proof
   * @return signature ECDSA signature 65 bytes
   * @return messageHash Hash of the transaction
   * @return transaction Transaction details
   */
  function _decomposeProof(
    bytes memory proof
  ) private pure returns (bytes memory signature, bytes32 messageHash, Transaction memory transaction) {
    // Proof format: |65 bytes signature|20 bytes address|12 bytes nonce|8 bytes timestamp|16 bytes value|
    // Total: 121 bytes
    if (proof.length != 121) {
      revert InvalidProofLength(proof.length);
    }
    signature = proof.readBytes(0, 65);
    bytes memory rawTx = proof.readBytes(65, 48);
    messageHash = keccak256(rawTx);
    transaction = Transaction({
      // 20 bytes
      to: rawTx.readAddress(0),
      // 12 bytes
      nonce: uint96(rawTx.readUintUnsafe(20, 96)),
      // 8 bytes
      timestamp: uint64(rawTx.readUintUnsafe(32, 64)),
      // 16 bytes
      value: uint128(proof.readUintUnsafe(40, 128))
    });
  }

  /**
   * Claim token from token contract
   * @param proof ECDSA signature and transaction details
   * @return transaction Transaction details
   */
  function _claim(bytes memory proof) private returns (Transaction memory) {
    (bytes memory signature, bytes32 messageHash, Transaction memory transaction) = _decomposeProof(proof);

    // Make sure the nonce is valid
    if (transaction.nonce != userNonce[msg.sender]) {
      revert InvalidUserNonce(msg.sender, transaction.nonce);
    }

    // Make sure the sender is the recipient of the token
    if (msg.sender != transaction.to) {
      revert InvalidRecipient(msg.sender, transaction.to);
    }

    address signer = messageHash.recover(signature);

    // Make sure the signature is valid for the message hash
    if (!_isOperator(signer)) {
      revert InvalidProofSignature(signer);
    }

    //Check mint proccess recipient
    if (!config.tokenContract.mint(transaction.to, transaction.value)) {
      revert UnableToMint(transaction.to, transaction.value);
    }

    userNonce[msg.sender] += 1;
    return transaction;
  }

  /**
   * Get current day since start
   */
  function _getCurrentDay() private view returns (uint256) {
    return (block.timestamp - config.timeStart) / 86400;
  }

  /*******************************************************
   * External View
   ********************************************************/

  /**
   * Get total claimed token by user
   */
  function getTotalClaim(address userAddress) external view returns (uint256) {
    return totalClaimed[userAddress];
  }

  /**
   * Get current day since start
   */
  function getCurrentDay() external view returns (uint256) {
    return _getCurrentDay();
  }

  /**
   * Get metric for today
   */
  function getMetricToday() external view returns (DailyClaim memory) {
    return dailyClaimStorage[_getCurrentDay()];
  }

  /**
   * Get metric for a specific day
   * @param day The day to get the metric for
   * @return The daily claim metrics for that day
   */
  function getMetricByDate(uint256 day) external view returns (DailyClaim memory) {
    return dailyClaimStorage[day];
  }

  /**
   * Get configuration settings
   * @return The configuration settings
   */
  function getConfig() external view returns (Configuration memory) {
    return config;
  }

  /**
   * Get nonce for a specific user
   * @param user The address of the user
   */
  function getUserNonce(address user) external view returns (uint256) {
    return userNonce[user];
  }
}
