// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import './interfaces/IOrandStorageV2.sol';
import '../libraries/Bytes.sol';

contract OrandStorageV2 is IOrandStorageV2 {
  using Bytes for bytes;

  // Event: New Epoch
  event NewEpoch(address indexed receiverAddress, uint96 indexed receiverEpoch, uint256 indexed randomness);

  // Event: New Era, starting a new era allow new public key to be used
  event NewEra(address indexed receiverAddress);

  // Storage of recent epoch's result
  // Map epoch ++ receiver  -> alpha
  mapping(uint256 => Epoch) private epochStorage;

  // Map receiver -> total epoch
  mapping(address => uint256) private epochMax;

  //=======================[  Internal  ]====================

  // Set the sueable to false, it can be a gensesis or sued
  function _markAsUnableToSue(address receiver, uint96 epoch) internal {
    epochStorage[_packing(epoch, receiver)].epochDigest = 0;
  }

  // Add validity epoch
  function _addEpoch(address receiver, uint96 epoch, uint256 epochResult, uint256 epochDigest) internal {
    if (epoch == epochMax[receiver]) {
      // Add epoch to storage
      // epoch != 0 => able to sue == true
      epochStorage[_packing(epoch, receiver)] = Epoch({
        epochResult: epochResult,
        epochDigest: epoch != 0 ? epochDigest : 0
      });
      emit NewEpoch(receiver, epoch, epochResult);
      // If add new epoch we increase the epoch max 1
      epochMax[receiver] += 1;
      return;
    }
    revert UnableToAddEpoch(receiver, epoch, epochResult);
  }

  // Reset epoch to zero for given receiver
  function _newEra(address receiver) internal {
    epochMax[receiver] = 0;
    emit NewEra(receiver);
  }

  //=======================[  Internal pure ]====================

  // Packing adderss and uint96 to a single bytes32
  // 96 bits a ++ 160 bits b
  function _packing(uint96 a, address b) internal pure returns (uint256 packed) {
    assembly {
      packed := or(shl(160, a), b)
    }
  }

  //=======================[  Internal View  ]====================

  // Get epoch record of given epoch
  function _getEpoch(address receiver, uint96 epoch) internal view returns (Epoch memory epochRecord) {
    return epochStorage[_packing(epoch, receiver)];
  }

  // Get epoch record of latest epoch
  function _getLatestEpoch(address receiver) internal view returns (Epoch memory epochRecord) {
    return epochStorage[_packing(uint96(epochMax[receiver]) - 1, receiver)];
  }

  // Get latest alpha
  function _getLatestResult(address receiver) internal view returns (uint256 epochResult) {
    return epochStorage[_packing(uint96(epochMax[receiver]) - 1, receiver)].epochResult;
  }

  // Get total epoch
  function _getTotalEpoch(address receiver) internal view returns (uint256 totalEpoch) {
    return epochMax[receiver];
  }

  //=======================[  External View  ]====================

  // Get epoch record of given epoch
  function getEpoch(address receiver, uint96 epoch) external view returns (Epoch memory epochRecord) {
    return _getEpoch(receiver, epoch);
  }

  // Get epoch record of latest epoch
  function getLatestEpoch(address receiver) external view returns (Epoch memory epochRecord) {
    return _getLatestEpoch(receiver);
  }

  // Get latest alpha
  function getLatestResult(address receiver) external view returns (uint256 epochResult) {
    return _getLatestResult(receiver);
  }

  // Get otal epoch
  function getTotalEpoch(address receiver) external view returns (uint256 totalEpoch) {
    return _getTotalEpoch(receiver);
  }
}
