// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import './interfaces/IOrandStorageV2.sol';
import '../libraries/Bytes.sol';

contract OrandStorageV2 is IOrandStorageV2 {
  using Bytes for bytes;

  // Event: New Epoch
  event NewEpoch(address indexed receiverAddress, uint96 indexed receiverEpoch, uint256 indexed randomness);

  // Storage of recent epoch's result
  // Map epoch ++ receiver  -> alpha
  mapping(uint256 => uint256) private epochResult;

  // Map receiver -> total epoch
  mapping(address => uint256) private epochMax;

  //=======================[  Internal  ]====================

  // Add validity epoch
  function _addEpoch(address receiver, uint256 result) internal {
    uint96 epoch = uint96(epochMax[receiver]);
    // Add epoch to storage
    // epoch != 0 => able to sue == true
    epochResult[_packing(epoch, receiver)] = result;
    // If add new epoch we increase the epoch max 1
    epochMax[receiver] = epoch + 1;
    // Emit event to outside of EVM
    emit NewEpoch(receiver, epoch, result);
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

  // Get result of current epoch
  function _getCurrentEpoch(address receiver) internal view returns (uint96 epoch) {
    epoch = uint96(epochMax[receiver]);
    return (epoch > 0) ? epoch - 1 : epoch;
  }

  // Get total number of epoch for a given receiver
  function _getTotalEpoch(address receiver) internal view returns (uint96 epoch) {
    return uint96(epochMax[receiver]);
  }

  // Get result of current epoch
  function _getCurrentEpochResult(address receiver) internal view returns (uint256 result) {
    return epochResult[_packing(_getCurrentEpoch(receiver), receiver)];
  }

  //=======================[  External View  ]====================

  // Get a given epoch result for a given receiver
  function getEpochResult(address receiver, uint96 epoch) external view returns (uint256 result) {
    return epochResult[_packing(epoch, receiver)];
  }

  // Get total number of epochs for a given receiver
  function getTotalEpoch(address receiver) external view returns (uint96 epoch) {
    return _getTotalEpoch(receiver);
  }

  // Get current epoch of a given receiver
  function getCurrentEpoch(address receiver) external view returns (uint96 epoch) {
    return _getCurrentEpoch(receiver);
  }

  // Get current epoch of a given receiver
  function getCurrentEpochResult(address receiver) external view returns (uint256 result) {
    return _getCurrentEpochResult(receiver);
  }
}
