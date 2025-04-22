// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '../libraries/Bytes.sol';
import './interfaces/IOrandECDSAV2.sol';

contract OrandECDSAV2 is IOrandECDSAV2 {
  // Event: Set New Operator
  event SetNewOperator(address indexed oldOperator, address indexed newOperator);

  // Orand operator address
  address private operator;

  // Byte manipulation
  using Bytes for bytes;

  // Verify digital signature
  using ECDSA for bytes;
  using ECDSA for bytes32;

  // Set operator at constructing time
  constructor(address operatorAddress) {
    _setOperator(operatorAddress);
  }

  //=======================[  Internal  ]====================

  // Set proof operator
  function _setOperator(address operatorAddress) internal {
    emit SetNewOperator(operator, operatorAddress);
    operator = operatorAddress;
  }

  //=======================[  Internal View  ]====================

  // Get operator address
  function _getOperator() internal view returns (address operatorAddress) {
    return operator;
  }

  // Verify proof of operator
  // 0 - 65: secp256k1 Signature
  // 65 - 77: Epoch
  // 77 - 97: Receiver address
  // 97 - 129: Y result of VRF
  function _decodeFraudProof(bytes memory fraudProof) internal pure returns (OrandECDSAProof memory ecdsaProof) {
    if (fraudProof.length != 129) {
      revert InvalidECDSAProofLength(fraudProof.length);
    }
    bytes memory signature = fraudProof.readBytes(0, 65);
    bytes memory message = fraudProof.readBytes(65, fraudProof.length - 65);
    uint256 proofUint = message.readUint256(0);
    ecdsaProof.receiverEpoch = uint96(proofUint >> 160);
    ecdsaProof.receiverAddress = address(uint160(proofUint));
    ecdsaProof.ecvrfProofDigest = message.readUint256(32);
    ecdsaProof.signer = message.toEthSignedMessageHash().recover(signature);
    return ecdsaProof;
  }

  //=======================[  External View  ]====================

  // Decompose a valid proof
  function decomposeProof(bytes memory proof) external pure returns (OrandECDSAProof memory ecdsaProof) {
    return _decodeFraudProof(proof);
  }

  // Get operator
  function getOperator() external view returns (address operatorAddress) {
    return _getOperator();
  }
}
