// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '../libraries/Bytes.sol';
import './interfaces/IOrandManagementV2.sol';

contract OrandManagementV2 is IOrandManagementV2 {
  using Bytes for bytes;

  // Public key that will be use to
  uint256[2] private publicKey;

  // Event Set New Public Key
  event SetNewPublicKey(address indexed actor, uint256 indexed pkx, uint256 indexed pky);

  // Set public key of Orand at the constructing time
  constructor(bytes memory pk) {
    _setPublicKey(pk);
  }

  //=======================[  Internal  ]====================

  // Set new public key by XY to verify ECVRF proof
  function _setPublicKeyXY(uint256 x, uint256 y) internal {
    publicKey = [x, y];
    emit SetNewPublicKey(msg.sender, x, y);
  }

  // Set new public key to verify ECVRF proof
  function _setPublicKey(bytes memory pk) internal {
    _setPublicKeyXY(pk.readUint256(0), pk.readUint256(32));
  }

  //=======================[  Internal view ]====================

  // Get public key
  function _getPublicKey() internal view returns (uint256[2] memory pubKey) {
    return publicKey;
  }

  // Get public key digest
  function _getPublicKeyDigest() internal view returns (uint256 pubKeyDigest) {
    return uint256(keccak256(abi.encodePacked(publicKey)));
  }

  //=======================[  External view  ]====================

  // Get public key
  function getPublicKey() external view returns (uint256[2] memory pubKey) {
    return _getPublicKey();
  }

  // Get public key digest
  function getPublicKeyDigest() external view returns (uint256 pubKeyDigest) {
    return _getPublicKeyDigest();
  }
}
