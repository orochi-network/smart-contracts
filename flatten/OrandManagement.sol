// Dependency file: contracts/libraries/Bytes.sol
// pragma solidity 0.8.19;

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

// Root file: contracts/orand/OrandManagement.sol

pragma solidity ^0.8.0;

// import 'contracts/libraries/Bytes.sol';

contract OrandManagement {
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

  // Set new public key to verify proof
  function _setPublicKey(bytes memory pk) internal {
    uint256 x = pk.readUint256(0);
    uint256 y = pk.readUint256(32);
    publicKey = [x, y];
    emit SetNewPublicKey(msg.sender, x, y);
  }

  //=======================[  Internal view ]====================

  function _getPublicKey() internal view returns (uint256[2] memory pubKey) {
    return publicKey;
  }

  //=======================[  External view  ]====================

  // Get public key
  function getPublicKey() external view returns (uint256[2] memory pubKey) {
    return _getPublicKey();
  }
}
