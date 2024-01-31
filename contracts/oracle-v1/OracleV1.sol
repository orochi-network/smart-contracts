// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import './interfaces/IOracleAggregatorV1.sol';
import './Operatable.sol';

contract OracleV1 is IOracleAggregatorV1, Ownable, Operatable {
  // Maping unique fingerprint to data
  mapping(bytes32 => bytes) private database;

  // Maping application ID to application metadata
  mapping(uint32 => ApplicationMetadata) private applications;

  event NewApplication(uint32 indexed application, bytes24 indexed name, string indexed description);

  event UpdateApplication(uint32 indexed application, bytes24 indexed name, string indexed description);

  event PublishData(uint32 indexed application, uint64 indexed round, bytes20 indexed identifier, bytes data);

  modifier onlyValidApplication(uint32 appId) {
    if (applications[appId].name == 0) {
      revert InvalidApplication(appId);
    }
    _;
  }

  /**
   * Create new oracle
   */
  constructor(address newOperator) {
    _setOperator(newOperator);
  }

  //=======================[  Owner  ]====================

  /**
   * Set new operator
   * @param newOperator New operator address
   * @return success
   */
  function setOperator(address newOperator) external onlyOwner returns (bool) {
    _setOperator(newOperator);
    return true;
  }

  /**
   * Create new application
   * @param application Application ID
   * @param name Application name
   * @param description Application description
   * @return success
   */
  function newApplication(
    uint32 application,
    bytes24 name,
    string calldata description
  ) external onlyOwner returns (bool) {
    if (applications[application].name != 0) {
      revert ExistedApplication(application);
    }
    if (name == 0) {
      revert InvalidApplicationName(name);
    }
    applications[application] = ApplicationMetadata(name, 0, description);
    emit NewApplication(application, name, description);
    return true;
  }

  /**
   * Update application metadata
   * @param appId Application ID
   * @param name Application name
   * @param description Application description
   * @return success
   */
  function updateApplication(
    uint32 appId,
    bytes24 name,
    string memory description
  ) external onlyOwner onlyValidApplication(appId) returns (bool) {
    if (name == 0) {
      revert InvalidApplicationName(name);
    }
    applications[appId].name = name;
    applications[appId].description = description;
    emit UpdateApplication(appId, name, description);
    return true;
  }

  //=======================[  Interal View  ]====================

  /**
   * Publish data to database
   * @param appId Application ID
   * @param round Round number
   * @param identifier Data identifier
   * @param data Data
   */
  function _readDatabase(uint32 appId, uint64 round, bytes20 identifier) internal view returns (bytes memory data) {
    return database[bytes32(abi.encodePacked(appId, round, identifier))];
  }

  //=======================[  External View  ]====================

  /**
   * Get application metadata
   * @param appId Application ID
   * @return app Application metadata
   */
  function getApplication(uint32 appId) external view returns (ApplicationMetadata memory app) {
    return applications[appId];
  }

  /**
   * Get data of an application
   * @param appId Application ID
   * @param round Round number
   * @param identifier Data identifier
   * @return data Data
   */
  function getData(uint32 appId, uint64 round, bytes20 identifier) external view returns (bytes memory data) {
    return _readDatabase(appId, round, identifier);
  }

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
  ) external view returns (bytes memory data) {
    ApplicationMetadata memory app = applications[appId];
    if (app.round < requireRound) {
      revert InvalidRoundNumber(app.round, requireRound);
    }
    return _readDatabase(appId, app.round, identifier);
  }

  /**
   * Get latest data of an application
   * @param appId Application ID
   * @param identifier Data identifier
   * @return data Data
   */
  function getLatestData(uint32 appId, bytes20 identifier) external view returns (bytes memory data) {
    return _readDatabase(appId, applications[appId].round, identifier);
  }
}
