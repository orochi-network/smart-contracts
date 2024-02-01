// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import '../libraries/Bytes.sol';
import './interfaces/IOracleAggregatorV1.sol';
import './Operatable.sol';

contract OracleV1 is IOracleAggregatorV1, Ownable, Operatable {
  using Bytes for bytes;

  // Maping unique fingerprint to data
  mapping(bytes32 => bytes) private database;

  // Maping application ID to application metadata
  mapping(uint32 => ApplicationMetadata) private applications;

  event NewApplication(uint32 indexed application, bytes24 indexed name);

  event UpdateApplication(uint32 indexed application, bytes24 indexed name);

  event PublishData(uint32 indexed application, uint64 indexed round, bytes20 indexed identifier, bytes data);

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
   * @param appData Application packed data
   * @return success
   */
  function newApplication(uint256 appData) external onlyOwner returns (bool) {
    uint32 appId = uint32(appData >> 192);
    bytes24 name = bytes24(uint192(appData));
    if (applications[appId].name != 0) {
      revert ExistedApplication(appId);
    }
    if (name == 0) {
      revert InvalidApplicationName(name);
    }
    applications[appId] = ApplicationMetadata(name, 0);
    emit NewApplication(appId, name);
    return true;
  }

  /**
   * Update application metadata
   * @param appData Application packed data
   * @return success
   */
  function updateApplication(uint256 appData) external onlyOwner returns (bool) {
    // There is 32bit space between them
    uint32 appId = uint32(appData >> 224);
    bytes24 name = bytes24(uint192(appData >> 64));
    if (applications[appId].name == 0) {
      revert InvalidApplication(appId);
    }
    if (name == 0) {
      revert InvalidApplicationName(name);
    }
    applications[appId].name = name;
    emit UpdateApplication(appId, name);
    return true;
  }

  //=======================[  Operator View  ]====================

  /**
   * Publish data to database
   * @param packedData packed data
   * @return success
   */
  function publishData(bytes calldata packedData) external onlyOperator returns (bool) {
    uint256 header = packedData.readUint256(0);
    uint32 appId = uint32(header >> 224);
    bytes20 identifier = bytes20(uint160(header >> 64));
    bytes memory data = packedData.readBytes(24, packedData.length - 24);
    uint64 round = applications[appId].round;
    if (applications[appId].name == 0) {
      revert InvalidApplication(appId);
    }
    round += 1;
    database[bytes32(abi.encodePacked(appId, round, identifier))] = data;
    applications[appId].round = round;
    emit PublishData(appId, round, identifier, data);
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
    if (round == 0) {
      revert UndefinedRound(round);
    }
    return database[bytes32(abi.encodePacked(appId, round, identifier))];
  }

  //=======================[  External View  ]====================

  /**
   * Get round of a given application
   * @param appId Application ID
   * @return round
   */
  function getRound(uint32 appId) external view returns (uint64 round) {
    return applications[appId].round;
  }

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
   * Get data of an application that lower or equal to target round
   * @param appId Application ID
   * @param targetRound Round number
   * @param identifier Data identifier
   * @return data Data
   */
  function getDataLte(uint32 appId, uint64 targetRound, bytes20 identifier) external view returns (bytes memory data) {
    ApplicationMetadata memory app = applications[appId];
    if (app.round <= targetRound) {
      revert InvalidRoundNumber(app.round, targetRound);
    }
    return _readDatabase(appId, app.round, identifier);
  }

  /**
   * Get data of an application that greater or equal to target round
   * @param appId Application ID
   * @param targetRound Round number
   * @param identifier Data identifier
   * @return data Data
   */
  function getDataGte(uint32 appId, uint64 targetRound, bytes20 identifier) external view returns (bytes memory data) {
    ApplicationMetadata memory app = applications[appId];
    if (app.round >= targetRound) {
      revert InvalidRoundNumber(app.round, targetRound);
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
