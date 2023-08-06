// Dependency file: contracts/interfaces/IOrandStorage.sol
// pragma solidity ^0.8.0;

error CanotOverwiteEpoch(address receiverAddress, uint256 receiverEpoch, uint256 randomness);

interface IOrandStorage {
  // Tranmission form of ECVRF epoch proof
  struct ECVRFEpochProof {
    uint256 y;
    uint256[2] gamma;
    uint256 c;
    uint256 s;
    address uWitness;
    uint256[2] cGammaWitness;
    uint256[2] sHashWitness;
    uint256 zInv;
  }
}


// Dependency file: contracts/interfaces/IOrandECDSA.sol

// pragma solidity ^0.8.0;

error InvalidProofEpoch(uint96 proofEpoch);
error InvalidProofSigner(address proofSigner);
error MismatchProofResult(uint256 ecvrfY, uint256 ecdsaY);

interface IOrandECDSA {
  // Struct Orand ECDSA proof
  struct OrandECDSAProof {
    address signer;
    uint96 receiverEpoch;
    address receiverAddress;
    uint256 y;
  }
}


// Dependency file: contracts/libraries/Bytes.sol

// pragma solidity 0.8.17;

// Index is out of range
error OutOfRange();

library Bytes {
  // Read address from input bytes buffer
  function readAddress(bytes memory input, uint256 offset) internal pure returns (address result) {
    if (offset + 20 > input.length) {
      revert OutOfRange();
    }
    assembly {
      result := shr(96, mload(add(add(input, 0x20), offset)))
    }
  }

  // Read uint256 from input bytes buffer
  function readUint256(bytes memory input, uint256 offset) internal pure returns (uint256 result) {
    if (offset + 32 > input.length) {
      revert OutOfRange();
    }
    assembly {
      result := mload(add(add(input, 0x20), offset))
    }
  }

  // Read a sub bytes array from input bytes buffer
  function readBytes(bytes memory input, uint256 offset, uint256 length) internal pure returns (bytes memory) {
    if (offset + length > input.length) {
      revert OutOfRange();
    }
    bytes memory result = new bytes(length);
    assembly {
      // Seek offset to the beginning
      let seek := add(add(input, 0x20), offset)

      // Next is size of data
      let resultOffset := add(result, 0x20)

      for {
        let i := 0
      } lt(i, length) {
        i := add(i, 0x20)
      } {
        mstore(add(resultOffset, i), mload(add(seek, i)))
      }
    }
    return result;
  }
}


// Root file: contracts/orand/OrandStorage.sol

pragma solidity ^0.8.0;
// import 'contracts/interfaces/IOrandStorage.sol';
// import 'contracts/interfaces/IOrandECDSA.sol';
// import 'contracts/libraries/Bytes.sol';

contract OrandStorage is IOrandStorage, IOrandECDSA {
  using Bytes for bytes;

  // Event: New Epoch
  event NewEpoch(address indexed receiverAddress, uint256 indexed receiverEpoch, uint256 indexed randomness);

  // Storage of recent epoch's result
  mapping(address => uint256) private currentAlpha;

  // Storage of fault proof
  // 0 - Not set
  // 1 - Sued
  // else - Alpha
  mapping(uint256 => uint256) private fraudProof;

  //=======================[  Internal  ]====================

  // Packing adderss and uint96 to a single bytes32
  // 96 bits a ++ 160 bits b
  function _packing(uint96 a, address b) internal pure returns (uint256 packed) {
    assembly {
      packed := or(shl(160, a), b)
    }
  }

  //=======================[  Internal  ]====================

  // Add validity epoch
  function _setEpochResult(OrandECDSAProof memory ecdsaProof) internal {
    currentAlpha[ecdsaProof.receiverAddress] = ecdsaProof.y;
  }

  // Add validity epoch
  function _addValidityEpoch(OrandECDSAProof memory ecdsaProof) internal returns (bool) {
    emit NewEpoch(ecdsaProof.receiverAddress, ecdsaProof.receiverEpoch, ecdsaProof.y);
    currentAlpha[ecdsaProof.receiverAddress] = ecdsaProof.y;
    return true;
  }

  // Add fraud epoch
  function _addFraudEpoch(OrandECDSAProof memory ecdsaProof) internal returns (bool) {
    uint256 key = _packing(ecdsaProof.receiverEpoch, ecdsaProof.receiverAddress);
    // We won't overwite the epoch that was fulfilled or sued
    if (fraudProof[key] > 0) {
      revert CanotOverwiteEpoch(ecdsaProof.receiverAddress, ecdsaProof.receiverEpoch, ecdsaProof.y);
    }
    fraudProof[key] = ecdsaProof.y;
    emit NewEpoch(ecdsaProof.receiverAddress, ecdsaProof.receiverEpoch, ecdsaProof.y);
    return true;
  }

  // Mark a fraud proof as sued
  function _markAsSued(OrandECDSAProof memory ecdsaProof) internal {
    fraudProof[_packing(ecdsaProof.receiverEpoch, ecdsaProof.receiverAddress)] = 1;
  }

  //=======================[  Internal View  ]====================

  // Get epoch result
  function _getCurrentAlpha(address receiverAddress) internal view returns (uint256 epochAlpha) {
    return currentAlpha[receiverAddress];
  }

  // Get fraud proof
  function _getFraudProofAlpha(address receiverAddress, uint96 epoch) internal view returns (uint256 epochAlpha) {
    return fraudProof[_packing(epoch, receiverAddress)];
  }

  //=======================[  Public View  ]====================
  // Get epoch result
  function getCurrentAlpha(address receiverAddress) external view returns (uint256 epochAlpha) {
    return _getCurrentAlpha(receiverAddress);
  }

  // Get fraud proof
  function getFraudProofAlpha(address receiverAddress, uint96 epoch) external view returns (uint256 epochAlpha) {
    return _getFraudProofAlpha(receiverAddress, epoch);
  }
}
