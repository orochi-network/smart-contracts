// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '../libraries/Bytes.sol';

error InvalidSignature(address signer);
error InvalidNonce(address receiverAddress, uint64 nonce);
error InvalidChain(uint256 chainId);

contract XOROECDSA {
  // Using Bytes for bytes
  using Bytes for bytes;

  // Verify digital signature
  using ECDSA for bytes;
  using ECDSA for bytes32;

  // Storage of recent epoch's result
  mapping(address => uint256) private nonceStorage;

  // Structure of ECDSA proof of XORO
  struct XOROECDSAProof {
    address signer;
    uint96 chainId;
    address beneficiary;
    uint64 nonce;
    uint192 value;
  }

  // Verify proof of operator
  // uint96 chainId;
  // address beneficiary;
  // uint64 nonce;
  // uint192 value;
  function _decodeProof(bytes memory proof) internal pure returns (XOROECDSAProof memory ecdsaProof) {
    bytes memory signature = proof.readBytes(0, 65);
    bytes memory message = proof.readBytes(65, 64);
    uint256 uin256Value = message.readUint256(0);
    ecdsaProof.chainId = uint96(uin256Value >> 160);
    ecdsaProof.beneficiary = address(uint160(uin256Value));
    uin256Value = message.readUint256(32);
    ecdsaProof.nonce = uint64(uin256Value >> 192);
    ecdsaProof.value = uint192(uin256Value);
    ecdsaProof.signer = message.toEthSignedMessageHash().recover(signature);
    return ecdsaProof;
  }

  // Verify nonce
  function _getNonce(address singerAddress) internal view returns (uint256) {
    return nonceStorage[singerAddress];
  }

  // Verify nonce
  function _verifyNonce(address receiverAddress, uint64 nonce) internal view returns (bool) {
    return nonceStorage[receiverAddress] == nonce;
  }

  // Increase nonce
  function _increaseNonce(address receiverAddress) internal {
    nonceStorage[receiverAddress] += 1;
  }

  // Get nonce of a given address
  function getNonce(address receiverAddress) external view returns (uint256) {
    return _getNonce(receiverAddress);
  }
}
