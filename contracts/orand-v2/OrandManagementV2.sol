// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '../libraries/Bytes.sol';
import './interfaces/IOrandManagementV2.sol';

contract OrandManagementV2 is IOrandManagementV2 {
  // Public key that will be use to
  uint256[2] private publicKey;

  // Event Set New Public Key
  event SetNewPublicKey(address indexed actor, uint256 indexed pkx, uint256 indexed pky);

  // Set public key of Orand at the constructing time
  constructor(uint256[2] memory publickey) {
    _setPublicKey(publickey);
  }

  //=======================[  Internal  ]====================

  // Set new public key by XY to verify ECVRF proof
  function _setPublicKey(uint256[2] memory publickey) internal {
    publicKey = publickey;
    emit SetNewPublicKey(msg.sender, publickey[0], publickey[1]);
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

  // Get address of operator for corresponding public key
  function getOperator() external view returns (address operator) {
    return address(uint160(_getPublicKeyDigest()));
  }
}
