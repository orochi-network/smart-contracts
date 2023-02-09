// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.4 <0.9.0;

interface IOrosignV1 {
  // Unable to init contract
  error UnableToInitContract();
  // Invalid threshold
  error InvalidThreshold(uint256 threshold, uint256 totalSignature);
  // Invalid permission
  error InvalidPermission(uint256 totalSinger, uint256 totalExecutor, uint256 totalCreator);
  // Voting process was not pass the threshold
  error ThresholdNotPassed(uint256 signed, uint256 threshold);
  // Proof Chain ID mismatch
  error ProofChainIdMismatch(uint256 inputChainId, uint256 requiredChainId);
  // Proof invalid nonce value
  error ProofInvalidNonce(uint256 inputNonce, uint256 requiredNonce);
  // Proof expired
  error ProofExpired(uint256 votingDeadline, uint256 currentTimestamp);
  // There is no creator proof in the signature list
  error ProofNoCreator();
  // Insecure timeout
  error InsecuredTimeout(uint256 duration);

  struct PackedTransaction {
    uint256 chainId;
    uint256 currentBlockTime;
    uint256 votingDeadline;
    uint256 nonce;
    address target;
    uint256 value;
    bytes data;
  }

  struct OrosignV1Metadata {
    uint256 chainId;
    uint256 nonce;
    uint256 totalSigner;
    uint256 threshold;
    uint256 securedTimeout;
    uint256 blockTimestamp;
  }

  function init(
    uint256 chainId_,
    address[] memory users_,
    uint256[] memory roles_,
    uint256 threshold_
  ) external returns (bool);
}
