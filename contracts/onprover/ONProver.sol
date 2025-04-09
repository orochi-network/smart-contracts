// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import { ECDSA } from '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

/**
 * @title ONProver Token
 * @author ONProver Project
 */
contract ONProver is ERC20, Ownable, ReentrancyGuard {
  // Timestamp marking the start time of the current daily claim period
  uint64 private dailyCheckpoint;

  // Duration of the daily claim period (default is 24 hours)
  uint64 private dailyRestartInterval = 86400;

  // Maximum amount of tokens that can be claimed per day
  uint256 private dailyTokenLimit;

  // Total amount of tokens claimed during the current daily period
  uint256 private dailyTokenClaimed;

  // Number of individual claims made today
  uint64 private dailyUserClaimCount;

  // Address of the authorized prover who can sign claims
  address private prover;

  // Mapping to track if a signature has been redeemed
  mapping(bytes32 => bool) private redeemedOnceTime;

  /*******************************************************
   * Events
   ********************************************************/

  /**
   * Emitted when a user claims tokens
   * @param signature Hash of the claim signature
   * @param to Address receiving the tokens
   * @param amount Amount of tokens claimed
   */
  event TokenClaim(bytes32 indexed signature, address indexed to, uint256 indexed amount);

  /**
   * Emitted when a user claims tokens via daily claim
   * @param signature Hash of the claim signature
   * @param to Address receiving the tokens
   * @param amount Amount of tokens claimed in daily claim
   */
  event TokenClaimDaily(bytes32 indexed signature, address indexed to, uint256 indexed amount);

  /**
   * Emitted when a new prover is set
   * @param oldSigner Address of the old prover
   * @param newSigner Address of the new prover
   */
  event ProverSet(address indexed oldSigner, address indexed newSigner);

  /**
   * Emitted when the daily token limit is updated
   * @param oldLimit Previous daily token limit
   * @param newLimit New daily token limit
   */
  event DailyTokenLimitSet(uint256 indexed oldLimit, uint256 indexed newLimit);

  /**
   * Emitted when the daily checkpoint is updated
   * @param oldTime Previous checkpoint timestamp
   * @param newTime New checkpoint timestamp
   */
  event DailyCheckpointSet(uint64 indexed oldTime, uint64 indexed newTime);

  /**
   * Emitted when the daily pool is reset
   * @param claimCount Number of claims before reset
   * @param oldTime Previous checkpoint timestamp
   * @param newTime New checkpoint timestamp after reset
   */
  event DailyPoolReset(uint64 indexed claimCount, uint256 indexed oldTime, uint256 indexed newTime);

  /**
   * Emitted when the daily restart time is updated
   * @param oldTime Previous dailyRestartInterval value
   * @param newTime New dailyRestartInterval value
   */
  event DailyTimeSet(uint64 indexed oldTime, uint64 indexed newTime);

  /*******************************************************
   * Constructor
   ********************************************************/

  /**
   * Deploy and initialize the ON token contract
   * @param name Token name
   * @param symbol Token symbol
   * @param initProver Authorized prover address
   */
  constructor(string memory name, string memory symbol, address initProver) ERC20(name, symbol) {
    dailyCheckpoint = uint64(block.timestamp);

    prover = initProver;
  }

  /*******************************************************
   * Modifiers
   ********************************************************/

  /**
   * Ensure a signature has not been redeemed before
   * @param signature Signature to verify
   */
  modifier onlyRedeemedOnceTime(bytes memory signature) {
    require(!_isRedeemed(signature), 'Signature already redeemed');
    _;
  }

  /*******************************************************
   * External Owner Functions
   ********************************************************/

  /**
   * Mint tokens to a specific address
   * @param to Address to receive minted tokens
   * @param amount Amount of tokens to mint
   */
  function mint(address to, uint256 amount) external onlyOwner {
    _mint(to, amount);
  }

  /**
   * Set a new prover address
   * @param newProver Address of the new prover
   */
  function setProver(address newProver) external onlyOwner {
    address oldProver = prover;

    prover = newProver;

    emit ProverSet(oldProver, newProver);
  }

  /**
   * Set the maximum daily claim limit
   * @param newLimit New daily token limit
   */
  function setDailyTokenLimit(uint256 newLimit) external onlyOwner {
    uint256 oldLimit = dailyTokenLimit;

    dailyTokenLimit = newLimit;

    emit DailyTokenLimitSet(oldLimit, newLimit);
  }

  /**
   * Manually set a new daily checkpoint
   * @param newTime New checkpoint timestamp
   */
  function setDailyCheckpoint(uint64 newTime) external onlyOwner {
    require(newTime < block.timestamp, 'new checkpoint must be in the past');

    uint64 oldTime = dailyCheckpoint;

    dailyCheckpoint = newTime;

    emit DailyCheckpointSet(oldTime, newTime);
  }

  /**
   * Set a new daily reset duration
   * @param newTime New time in seconds for daily reset
   */
  function setTimeRestartDaily(uint64 newTime) external onlyOwner {
    uint64 oldTime = dailyRestartInterval;

    dailyRestartInterval = newTime;

    emit DailyTimeSet(oldTime, newTime);
  }

  /*******************************************************
   * External User Functions (requires signature)
   ********************************************************/

  /**
   * Claim tokens using a valid signature
   * @param signature Signed message authorizing claim
   * @param amount Amount of tokens to claim
   * @param salt Unique random salt for claim
   */
  function claim(
    bytes memory signature,
    uint256 amount,
    uint96 salt
  ) external nonReentrant onlyRedeemedOnceTime(signature) {
    // Recover the signer address from the signature
    address signer = ECDSA.recover(
      ECDSA.toEthSignedMessageHash(keccak256(abi.encode(msg.sender, amount, salt))),
      signature
    );
    require(_isValidSigner(signer), 'Invalid signature');

    // Transfer tokens to the user
    _transfer(address(this), msg.sender, amount);

    // Mark the signature as used
    _setRedeemedOnceTime(signature);

    emit TokenClaim(keccak256(signature), msg.sender, amount);
  }

  /**
   * Claim tokens daily with limit enforcement
   * @param signature Signed message authorizing claim
   * @param amount Amount of tokens to claim
   * @param salt Unique random salt for claim
   */
  function claimDaily(
    bytes memory signature,
    uint256 amount,
    uint96 salt
  ) external nonReentrant onlyRedeemedOnceTime(signature) {
    // Reset daily pool if time has passed
    if (block.timestamp - dailyCheckpoint >= dailyRestartInterval) {
      _restartDailyPool();
    }

    require(dailyTokenClaimed < dailyTokenLimit, 'Limit per day reached');

    // Recover the signer address
    address signer = ECDSA.recover(
      ECDSA.toEthSignedMessageHash(keccak256(abi.encode(msg.sender, amount, salt, dailyCheckpoint))),
      signature
    );
    require(_isValidSigner(signer), 'Invalid signature');

    // Calculate how much can be transferred
    uint256 transferable = amount;

    if (dailyTokenClaimed + amount > dailyTokenLimit) {
      transferable = dailyTokenLimit - dailyTokenClaimed;
    }

    // Transfer tokens to the user
    _transfer(address(this), msg.sender, transferable);

    // Mark the signature as used
    _setRedeemedOnceTime(signature);

    // Update claimed amount and count
    dailyTokenClaimed += transferable;
    dailyUserClaimCount += 1;

    emit TokenClaimDaily(keccak256(signature), msg.sender, amount);
  }

  /**
   * @notice Owner can send existing tokens from the contract.
   * @param to Address to receive the tokens
   * @param amount Amount of tokens to transfer
   */
  function withdraw(address to, uint256 amount) external onlyOwner {
    require(to != address(0), 'Invalid recipient');
    require(balanceOf(address(this)) >= amount, 'Insufficient contract balance');

    _transfer(address(this), to, amount);
  }

  /*******************************************************
   * Private Section
   ********************************************************/

  /**
   * Restart the daily pool
   */
  function _restartDailyPool() private {
    uint64 oldTime = dailyCheckpoint;
    uint64 nowTime = uint64(block.timestamp);

    uint64 passed = nowTime - oldTime;
    uint64 intervals = passed / dailyRestartInterval;

    dailyCheckpoint = oldTime + intervals * dailyRestartInterval;

    // Reset claim
    dailyTokenClaimed = 0;
    emit DailyCheckpointSet(oldTime, dailyCheckpoint);
    emit DailyPoolReset(dailyUserClaimCount, oldTime, dailyCheckpoint);

    dailyUserClaimCount = 0;
  }

  /*******************************************************
   * Internal Functions
   ********************************************************/

  /**
   * Mark a signature as redeemed
   * @param signature Signature to mark
   */
  function _setRedeemedOnceTime(bytes memory signature) internal {
    redeemedOnceTime[keccak256(signature)] = true;
  }

  /*******************************************************
   * External View Functions
   ********************************************************/

  /**
   * Get the current daily token limit
   */
  function dailyTokenLimitGet() external view returns (uint256) {
    return dailyTokenLimit;
  }

  /**
   * Get the current daily checkpoint timestamp
   */
  function dailyCheckpointGet() external view returns (uint64) {
    return dailyCheckpoint;
  }

  /**
   * Get the total number of tokens claimed today
   */
  function dailyTokenClaimedGet() external view returns (uint256) {
    return dailyTokenClaimed;
  }

  /**
   * Get the duration set for daily reset
   */
  function timeRestartDailyGet() external view returns (uint64) {
    return dailyRestartInterval;
  }

  /**
   * Get the number of claims made today
   */
  function dailyUserClaimCountGet() external view returns (uint64) {
    return dailyUserClaimCount;
  }

  /**
   * Get the address of the prover
   */
  function proverGet() external view returns (address) {
    return prover;
  }
  /**
   * Get the status of a signature
   * @param signature Signature to check
   */
  function getRedeemState(bytes memory signature) external view returns (bool) {
    return _isRedeemed(signature);
  }
  /*******************************************************
   * Internal View Functions
   ********************************************************/

  /**
   * Check if a signer is valid
   * @param signer Address of the signer
   */
  function _isValidSigner(address signer) internal view returns (bool) {
    return signer == prover;
  }

  /**
   * Check if a signature has already been redeemed
   * @param signature Signature to check
   */
  function _isRedeemed(bytes memory signature) internal view returns (bool) {
    return redeemedOnceTime[keccak256(signature)];
  }
}
