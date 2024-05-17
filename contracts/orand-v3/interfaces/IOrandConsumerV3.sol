// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

error InvalidProvider();

/**
* @dev IOrandConsumerV3 must be implemented for all service that use Orand
*/
interface IOrandConsumerV3 {
  /**
  * Consume the verifiable randomness from Orand provider
  * @param randomness Randomness value
  * @return return false if you want to stop batching otherwise return true
  */
  function consumeRandomness(uint256 randomness) external returns (bool);
  /**
  * Check the fulfill status of randomness batching
  * @return true if all requests are fulfilled otherwise return false
  */
  function isFulfilled() external returns (bool);
}
