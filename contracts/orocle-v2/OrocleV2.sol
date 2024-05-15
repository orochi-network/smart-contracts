// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '../libraries/Ownable.sol';
import '../libraries/Bytes.sol';
import '../libraries/Operatable.sol';
import './interfaces/IOrocleAggregatorV2.sol';

contract OrocleV2 is Initializable, IOrocleAggregatorV2, Ownable, Operatable {
  using Bytes for bytes;

  // Maping unique fingerprint to data
  mapping(bytes32 => bytes32) private database;

  // Mapping application ID ++ identifier to application metadata
  mapping(bytes32 => bytes32) private metadata;

  // Deactivated user
  mapping(address => bool) private deactivated;

  // Publish new data
  event PublishData(uint32 indexed application, uint64 indexed round, bytes20 indexed identifier, bytes32 data);

  // Request new data
  event Request(address indexed actor, uint256 indexed identifier, bytes indexed data);

  // Fulfill request
  event FulFill(address indexed actor, uint256 indexed identifier, bytes indexed data);

  // Deactivated user status update
  event Deactivated(address indexed actor, bool indexed status);

  // Only active user
  modifier onlyActive() {
    if (deactivated[msg.sender]) {
      revert DeactivatedUser(msg.sender);
    }
    _;
  }

  /**
   * Create new oracle
   */
  function initialize(address[] memory operatorList) public initializer {
    Ownable._initOwnable();
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

  //=======================[  Operator  ]====================

  // Set deactivated status
  function setDeactivatedStatus(address userAddress, bool status) external onlyOperator returns (bool) {
    _setDeactivateStatus(userAddress, status);
    return true;
  }

  /**
   * Publish data to database
   * @param packedData packed data
   * @return success
   */
  function publishData(uint32 appId, bytes memory packedData) external onlyOperator returns (bool) {
    // Decode appId and chunksize
    bytes20 identifier;
    bytes32 data;
    if (packedData.length % 52 != 0) {
      revert InvalidDataLength(packedData.length);
    }
    for (uint256 i = 0; i < packedData.length; i += 52) {
      identifier = bytes20(uint160(packedData.readUintUnsafe(i, 160)));
      data = bytes32(uint256(packedData.readUint256(i + 20)));
      if (!_publish(appId, identifier, data)) {
        revert UnableToPublishData(packedData.readBytes(i, 52));
      }
    }
    return true;
  }

  // Dedicated function for price
  function publishPrice(bytes memory packedData) external onlyOperator returns (bool) {
    // Decode appId and chunksize
    bytes20 identifier;
    bytes32 data;
    if (packedData.length % 24 != 0) {
      revert InvalidDataLength(packedData.length);
    }
    for (uint256 i = 0; i < packedData.length; i += 24) {
      identifier = bytes20(bytes8(uint64(packedData.readUintUnsafe(i, 64))));
      data = bytes32(uint256(uint128(packedData.readUintUnsafe(i + 8, 128))));
      if (!_publish(1, identifier, data)) {
        revert UnableToPublishData(packedData.readBytes(i, 24));
      }
    }
    return true;
  }

  //=======================[  Interal  ]====================

  // Set deactivated status
  function _setDeactivateStatus(address userAddress, bool status) internal {
    deactivated[userAddress] = status;
    emit Deactivated(userAddress, status);
  }

  // Publish data to Orocle
  function _publish(uint32 appId, bytes20 identifier, bytes32 data) internal returns (bool) {
    (uint64 round, ) = _getMetadata(appId, identifier);
    round += 1;
    // After 255 round, we will reuse the same slot, it saving a lot of gas
    database[_encodeDataKey(appId, round, identifier)] = data;
    emit PublishData(appId, round, identifier, data);
    _setMetadata(appId, identifier, round);
    return true;
  }

  // Set application round
  function _setMetadata(uint32 appId, bytes20 identifier, uint64 round) internal {
    metadata[_encodeRoundKey(appId, identifier)] = _encodeMetadata(round, uint64(block.timestamp));
  }

  //=======================[  Interal View  ]====================

  // Encode data key
  function _encodeDataKey(uint32 appId, uint64 round, bytes20 identifier) internal pure returns (bytes32 dataKey) {
    assembly {
      dataKey := identifier
      dataKey := or(dataKey, shl(160, and(round, 0xff)))
      dataKey := or(dataKey, shl(224, appId))
    }
  }

  // Encode metadata
  function _encodeMetadata(uint64 round, uint64 lastUpdate) internal pure returns (bytes32 dataKey) {
    assembly {
      dataKey := shl(192, round)
      dataKey := or(dataKey, shl(128, lastUpdate))
    }
  }

  // Encode round key
  function _encodeRoundKey(uint32 appId, bytes20 identifier) internal pure returns (bytes32 roundKey) {
    assembly {
      roundKey := identifier
      roundKey := or(roundKey, shl(224, appId))
    }
  }

  // Decode metadata
  function _decodeMetadata(bytes32 metadataRecord) internal pure returns (uint64 round, uint64 lastUpdate) {
    assembly {
      round := shr(192, metadataRecord)
      lastUpdate := shr(128, metadataRecord)
    }
  }

  // Get application round
  function _getMetadata(uint32 appId, bytes20 identifier) internal view returns (uint64 round, uint64 lastUpdate) {
    return _decodeMetadata(metadata[_encodeRoundKey(appId, identifier)]);
  }

  /**
   * Publish data to database
   * @param appId Application ID
   * @param round Round number
   * @param identifier Data identifier
   * @param data Data
   */
  function _readDatabase(uint32 appId, uint64 round, bytes20 identifier) internal view returns (bytes32 data) {
    (uint64 onChainRound, ) = _getMetadata(appId, identifier);
    // Can't get > 255 round in the past
    if (round + 255 < onChainRound || round > onChainRound) {
      revert UndefinedRound(round);
    }
    return database[_encodeDataKey(appId, round, identifier)];
  }

  //=======================[  External View  ]====================

  // Check if user is deactivated
  function isDeactivated(address user) external view returns (bool) {
    return deactivated[user];
  }

  /**
   * Get round of a given application
   * @param appId Application ID
   * @return round
   */
  function getMetadata(uint32 appId, bytes20 identifier) external view returns (uint64 round, uint64 lastUpdate) {
    return _getMetadata(appId, identifier);
  }

  /**
   * Get data of an application
   * @param appId Application ID
   * @param round Round number
   * @param identifier Data identifier
   * @return data Data
   */
  function getData(uint32 appId, uint64 round, bytes20 identifier) external view onlyActive returns (bytes32 data) {
    return _readDatabase(appId, round, identifier);
  }

  /**
   * Get latest data of an application
   * @param appId Application ID
   * @param identifier Data identifier
   * @return data
   */
  function getLatestData(uint32 appId, bytes20 identifier) external view onlyActive returns (bytes32 data) {
    (uint64 round, ) = _getMetadata(appId, identifier);
    data = _readDatabase(appId, round, identifier);
  }

  /**
   * Get latest round and data of an application
   * @param appId Application ID
   * @param identifier Data identifier
   * @return round lastUpdate data
   */
  function getLatestRound(
    uint32 appId,
    bytes20 identifier
  ) external view onlyActive returns (uint64 round, uint64 lastUpdate, bytes32 data) {
    (round, lastUpdate) = _getMetadata(appId, identifier);
    data = _readDatabase(appId, round, identifier);
  }
}
