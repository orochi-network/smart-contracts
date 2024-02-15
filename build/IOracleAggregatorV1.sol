// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

error ExistedApplication(uint32 appId);
error InvalidApplication(uint32 appId);
error InvalidApplicationName(bytes24 appName);
error InvalidRoundNumber(uint64 round, uint64 requiredRound);
error UndefinedRound(uint64 round);
error InvalidDataLength(uint256 length);
error UnableToPublishData(bytes data);

interface IOracleAggregatorV1 {
  struct ApplicationMetadata {
    bytes16 name;
    uint64 lastUpdate;
    uint64 round;
  }

  /**
   * Get round of a given application
   * @param appId Application ID
   * @return round
   */
  function getRound(uint32 appId) external view returns (uint256 round);

  /**
   * Get last update timestamp of a given application
   * @param appId Application ID
   * @return lastUpdate
   */
  function getLastUpdate(uint32 appId) external view returns (uint256 lastUpdate);

  /**
   * Get application metadata
   * @param appId Application ID
   * @return app Application metadata
   */
  function getApplication(uint32 appId) external view returns (ApplicationMetadata memory app);

  /**
   * Get data of an application
   * @param appId Application ID
   * @param round Round number
   * @param identifier Data identifier
   * @return data Data
   */
  function getData(uint32 appId, uint64 round, bytes20 identifier) external view returns (bytes32 data);

  /**
   * Get data of an application that lower or equal to target round
   * @param appId Application ID
   * @param targetRound Round number
   * @param identifier Data identifier
   * @return data Data
   */
  function getDataLte(uint32 appId, uint64 targetRound, bytes20 identifier) external view returns (bytes32 data);

  /**
   * Get data of an application that greater or equal to target round
   * Use this if you wan transaction to be happend after crertain round in the future
   * @param appId Application ID
   * @param targetRound Round number
   * @param identifier Data identifier
   * @return data Data
   */
  function getDataGte(uint32 appId, uint64 targetRound, bytes20 identifier) external view returns (bytes32 data);

  /**
   * Get latest data of an application
   * @param appId Application ID
   * @param identifier Data identifier
   * @return data Data
   */
  function getLatestData(uint32 appId, bytes20 identifier) external view returns (bytes32 data);
}
