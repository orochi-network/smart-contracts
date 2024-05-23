// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

error ExistedApplication(uint32 appId);
error InvalidApplication(uint32 appId);
error InvalidApplicationName(bytes24 appName);
error InvalidRoundNumber(uint64 round, uint64 requiredRound);
error UndefinedRound(uint64 round);
error InvalidDataLength(uint256 length);
error UnableToPublishData(bytes data);
error DeactivatedUser(address user);

interface IOrocleAggregatorV2 {
  /**
   * Emit event when a new request is created
   * @param identifier Data identifier
   * @param data Data
   */
  function request(uint256 identifier, bytes calldata data) external returns (bool);

  /**
   * Fulfill request
   * @param identifier Data identifier
   * @param data Data
   */
  function fulfill(uint256 identifier, bytes calldata data) external returns (bool);

  /**
   * Check if user is deactivated
   * @param user User address
   * @return status
   */
  function isDeactivated(address user) external view returns (bool);

  /**
   * Get round of a given application
   * @param appId Application ID
   * @return round
   */
  function getMetadata(uint32 appId, bytes20 identifier) external view returns (uint64 round, uint64 lastUpdate);

  /**
   * Get data of an application
   * @param appId Application ID
   * @param round Round number
   * @param identifier Data identifier
   * @return data Data
   */
  function getData(uint32 appId, uint64 round, bytes20 identifier) external view returns (bytes32 data);

  /**
   * Get latest data of an application
   * @param appId Application ID
   * @param identifier Data identifier
   * @return data
   */
  function getLatestData(uint32 appId, bytes20 identifier) external view returns (bytes32 data);

  /**
   * Get latest data of an application
   * @param appId Application ID
   * @param identifier Data identifier
   * @return round lastUpdate data
   */
  function getLatestRound(
    uint32 appId,
    bytes20 identifier
  ) external view returns (uint64 round, uint64 lastUpdate, bytes32 data);
}
