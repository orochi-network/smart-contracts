// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import '../libraries/Bytes.sol';
import './interfaces/IOracleAggregatorV1.sol';
import './Operatable.sol';
import 'hardhat/console.sol';

contract OracleV1 is IOracleAggregatorV1, Ownable, Operatable {
  using Bytes for bytes;

  // Maping unique fingerprint to data
  mapping(bytes32 => bytes32) private database;

  // Maping application ID to application metadata
  mapping(uint32 => ApplicationMetadata) private applications;

  event NewApplication(uint32 indexed application, bytes24 indexed name);

  event UpdateApplication(uint32 indexed application, bytes24 indexed name);

  event PublishData(uint32 indexed application, uint64 indexed round, bytes20 indexed identifier, bytes32 data);

  event Request(address indexed actor, uint256 indexed identifier, bytes indexed data);

  event FulFill(address indexed actor, uint256 indexed identifier, bytes indexed data);

  /**
   * Create new oracle
   */
  constructor(address[] memory operatorList) {
    for (uint256 i = 0; i < operatorList.length; i += 1) {
      _addOperator(operatorList[i]);
    }
  }

  //=======================[  External  ]====================

  /**
   * Emit event when a new request is created
   * @param identifier Data identifier
   * @param data Data
   */
  function request(uint256 identifier, bytes calldata data) external returns (bool) {
    emit Request(msg.sender, identifier, data);
    return true;
  }

  /**
   * Fulfill request
   * @param identifier Data identifier
   * @param data Data
   */
  function fulfill(uint256 identifier, bytes calldata data) external returns (bool) {
    emit FulFill(msg.sender, identifier, data);
    return true;
  }

  //=======================[  Owner  ]====================

  /**
   * Set new operator
   * @param newOperator New operator address
   * @return success
   */
  function addOperator(address newOperator) external onlyOwner returns (bool) {
    return _addOperator(newOperator);
  }

  /**
   * Remove old operator
   * @param oldOperator New operator address
   * @return success
   */
  function removeOperator(address oldOperator) external onlyOwner returns (bool) {
    return _removeOperator(oldOperator);
  }

  /**
   * Create new application
   * @param appData Application packed data
   * @return success
   */
  function newApplication(uint256 appData) external onlyOwner returns (bool) {
    uint32 appId = uint32(appData >> 128);
    bytes16 name = bytes16(uint128(appData));
    if (applications[appId].name != 0) {
      revert ExistedApplication(appId);
    }
    if (name == 0) {
      revert InvalidApplicationName(name);
    }
    applications[appId] = ApplicationMetadata(name, 0, 0);
    emit NewApplication(appId, name);
    return true;
  }

  /**
   * Update application metadata
   * @param appData Application packed data
   * @return success
   */
  function updateApplication(uint256 appData) external onlyOwner returns (bool) {
    uint32 appId = uint32(appData >> 128);
    bytes16 name = bytes16(uint128(appData));
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
  function publishData(uint256 metadata, bytes memory packedData) external onlyOperator returns (bool) {
    // Decode appId and chunksize
    uint32 appId = uint32(metadata >> 224);
    uint256 chunksize = uint256(uint224(metadata));
    bytes20 identifier;
    bytes32 data;
    ApplicationMetadata memory app = applications[appId];
    if (packedData.length % chunksize != 0) {
      revert InvalidDataLength(packedData.length);
    }
    if (app.name == 0) {
      revert InvalidApplication(appId);
    }
    app.round += 1;
    for (uint256 i = 0; i < packedData.length; i += chunksize) {
      identifier = bytes20(uint160(packedData.readUintUnsafe(i, 160)));
      data = bytes32(uint256(packedData.readUint256(i + 20)));
      if (!_publish(appId, app.round, identifier, data)) {
        revert UnableToPublishData(packedData.readBytes(i, chunksize));
      }
    }
    applications[appId].round = app.round;
    applications[appId].lastUpdate = uint64(block.timestamp);
    return true;
  }

  //=======================[  Interal  ]====================

  function _publish(uint32 appId, uint64 round, bytes20 identifier, bytes32 data) internal returns (bool) {
    // After 255 round, we will reuse the same slot, it saving a lot of gas
    database[bytes32(abi.encodePacked(appId, uint8(round), identifier))] = data;
    emit PublishData(appId, round, identifier, data);
    return true;
  }

  //=======================[  Interal View  ]====================

  /**
   * Get unique key for data lookup
   * @param appId Application ID
   * @param round Round number
   * @param identifier Data identifier
   * @param dataKey Data
   */
  function _getUniqueLookupKey(uint32 appId, uint64 round, bytes20 identifier) internal pure returns (bytes32 dataKey) {
    return bytes32(abi.encodePacked(appId, uint8(round), identifier));
  }

  /**
   * Publish data to database
   * @param appId Application ID
   * @param round Round number
   * @param identifier Data identifier
   * @param data Data
   */
  function _readDatabase(uint32 appId, uint64 round, bytes20 identifier) internal view returns (bytes32 data) {
    // Can't get 0 round and round in the past
    if (round == 0 || round + 255 < applications[appId].round) {
      revert UndefinedRound(round);
    }
    return database[_getUniqueLookupKey(appId, round, identifier)];
  }

  //=======================[  External View  ]====================

  /**
   * Get round of a given application
   * @param appId Application ID
   * @return round
   */
  function getRound(uint32 appId) external view returns (uint256 round) {
    return uint256(applications[appId].round);
  }

  /**
   * Get last update timestamp of a given application
   * @param appId Application ID
   * @return lastUpdate
   */
  function getLastUpdate(uint32 appId) external view returns (uint256 lastUpdate) {
    return uint256(applications[appId].lastUpdate);
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
  function getData(uint32 appId, uint64 round, bytes20 identifier) external view returns (bytes32 data) {
    return _readDatabase(appId, round, identifier);
  }

  /**
   * Get data of an application that lower or equal to target round
   * @param appId Application ID
   * @param targetRound Round number
   * @param identifier Data identifier
   * @return data Data
   */
  function getDataLte(uint32 appId, uint64 targetRound, bytes20 identifier) external view returns (bytes32 data) {
    ApplicationMetadata memory app = applications[appId];
    if (app.round <= targetRound) {
      revert InvalidRoundNumber(app.round, targetRound);
    }
    return _readDatabase(appId, app.round, identifier);
  }

  /**
   * Get data of an application that greater or equal to target round
   * Use this if you wan transaction to be happend after crertain round in the future
   * @param appId Application ID
   * @param targetRound Round number
   * @param identifier Data identifier
   * @return data Data
   */
  function getDataGte(uint32 appId, uint64 targetRound, bytes20 identifier) external view returns (bytes32 data) {
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
  function getLatestData(uint32 appId, bytes20 identifier) external view returns (bytes32 data) {
    return _readDatabase(appId, applications[appId].round, identifier);
  }
}
