// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

error ExistedApplication(uint32 appId);
error InvalidApplication(uint32 appId);
error InvalidApplicationName(bytes24 appName);
error InvalidRoundNumber(uint64 round, uint64 requiredRound);

interface IOracleAggregatorV1 {
  struct ApplicationMetadata {
    bytes24 name;
    uint64 round;
    string description;
  }

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
  function getData(uint32 appId, uint64 round, bytes20 identifier) external view returns (bytes memory data);

  /**
   * Get data of an application by condition
   * @param appId Application ID
   * @param requireRound Round number
   * @param identifier Data identifier
   * @return data Data
   */
  function getDataByCondition(
    uint32 appId,
    uint64 requireRound,
    bytes20 identifier
  ) external view returns (bytes memory data);

  /**
   * Get latest data of an application
   * @param appId Application ID
   * @param identifier Data identifier
   * @return data Data
   */
  function getLatestData(uint32 appId, bytes20 identifier) external view returns (bytes memory data);
}
