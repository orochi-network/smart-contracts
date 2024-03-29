// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

error InvalidProvider();

interface IOrandConsumerV2 {
  // Consume the verifiable randomness from Orand provider
  // Return false if you want to stop batching
  function consumeRandomness(uint256 randomness) external returns (bool);
}
