// Dependency file: @openzeppelin/contracts/utils/Context.sol
// OpenZeppelin Contracts v4.4.1 (utils/Context.sol)

// pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}


// Dependency file: @openzeppelin/contracts/access/Ownable.sol

// OpenZeppelin Contracts (last updated v4.7.0) (access/Ownable.sol)

// pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/utils/Context.sol";

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
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


// Dependency file: contracts/orand/OrandManagement.sol

// pragma solidity ^0.8.0;
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


// Dependency file: contracts/orand/OrandStorage.sol

// pragma solidity ^0.8.0;
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


// Dependency file: @openzeppelin/contracts/utils/math/Math.sol

// OpenZeppelin Contracts (last updated v4.8.0) (utils/math/Math.sol)

// pragma solidity ^0.8.0;

/**
 * @dev Standard math utilities missing in the Solidity language.
 */
library Math {
    enum Rounding {
        Down, // Toward negative infinity
        Up, // Toward infinity
        Zero // Toward zero
    }

    /**
     * @dev Returns the largest of two numbers.
     */
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }

    /**
     * @dev Returns the smallest of two numbers.
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    /**
     * @dev Returns the average of two numbers. The result is rounded towards
     * zero.
     */
    function average(uint256 a, uint256 b) internal pure returns (uint256) {
        // (a + b) / 2 can overflow.
        return (a & b) + (a ^ b) / 2;
    }

    /**
     * @dev Returns the ceiling of the division of two numbers.
     *
     * This differs from standard division with `/` in that it rounds up instead
     * of rounding down.
     */
    function ceilDiv(uint256 a, uint256 b) internal pure returns (uint256) {
        // (a + b - 1) / b can overflow on addition, so we distribute.
        return a == 0 ? 0 : (a - 1) / b + 1;
    }

    /**
     * @notice Calculates floor(x * y / denominator) with full precision. Throws if result overflows a uint256 or denominator == 0
     * @dev Original credit to Remco Bloemen under MIT license (https://xn--2-umb.com/21/muldiv)
     * with further edits by Uniswap Labs also under MIT license.
     */
    function mulDiv(
        uint256 x,
        uint256 y,
        uint256 denominator
    ) internal pure returns (uint256 result) {
        unchecked {
            // 512-bit multiply [prod1 prod0] = x * y. Compute the product mod 2^256 and mod 2^256 - 1, then use
            // use the Chinese Remainder Theorem to reconstruct the 512 bit result. The result is stored in two 256
            // variables such that product = prod1 * 2^256 + prod0.
            uint256 prod0; // Least significant 256 bits of the product
            uint256 prod1; // Most significant 256 bits of the product
            assembly {
                let mm := mulmod(x, y, not(0))
                prod0 := mul(x, y)
                prod1 := sub(sub(mm, prod0), lt(mm, prod0))
            }

            // Handle non-overflow cases, 256 by 256 division.
            if (prod1 == 0) {
                return prod0 / denominator;
            }

            // Make sure the result is less than 2^256. Also prevents denominator == 0.
            require(denominator > prod1);

            ///////////////////////////////////////////////
            // 512 by 256 division.
            ///////////////////////////////////////////////

            // Make division exact by subtracting the remainder from [prod1 prod0].
            uint256 remainder;
            assembly {
                // Compute remainder using mulmod.
                remainder := mulmod(x, y, denominator)

                // Subtract 256 bit number from 512 bit number.
                prod1 := sub(prod1, gt(remainder, prod0))
                prod0 := sub(prod0, remainder)
            }

            // Factor powers of two out of denominator and compute largest power of two divisor of denominator. Always >= 1.
            // See https://cs.stackexchange.com/q/138556/92363.

            // Does not overflow because the denominator cannot be zero at this stage in the function.
            uint256 twos = denominator & (~denominator + 1);
            assembly {
                // Divide denominator by twos.
                denominator := div(denominator, twos)

                // Divide [prod1 prod0] by twos.
                prod0 := div(prod0, twos)

                // Flip twos such that it is 2^256 / twos. If twos is zero, then it becomes one.
                twos := add(div(sub(0, twos), twos), 1)
            }

            // Shift in bits from prod1 into prod0.
            prod0 |= prod1 * twos;

            // Invert denominator mod 2^256. Now that denominator is an odd number, it has an inverse modulo 2^256 such
            // that denominator * inv = 1 mod 2^256. Compute the inverse by starting with a seed that is correct for
            // four bits. That is, denominator * inv = 1 mod 2^4.
            uint256 inverse = (3 * denominator) ^ 2;

            // Use the Newton-Raphson iteration to improve the precision. Thanks to Hensel's lifting lemma, this also works
            // in modular arithmetic, doubling the correct bits in each step.
            inverse *= 2 - denominator * inverse; // inverse mod 2^8
            inverse *= 2 - denominator * inverse; // inverse mod 2^16
            inverse *= 2 - denominator * inverse; // inverse mod 2^32
            inverse *= 2 - denominator * inverse; // inverse mod 2^64
            inverse *= 2 - denominator * inverse; // inverse mod 2^128
            inverse *= 2 - denominator * inverse; // inverse mod 2^256

            // Because the division is now exact we can divide by multiplying with the modular inverse of denominator.
            // This will give us the correct result modulo 2^256. Since the preconditions guarantee that the outcome is
            // less than 2^256, this is the final result. We don't need to compute the high bits of the result and prod1
            // is no longer required.
            result = prod0 * inverse;
            return result;
        }
    }

    /**
     * @notice Calculates x * y / denominator with full precision, following the selected rounding direction.
     */
    function mulDiv(
        uint256 x,
        uint256 y,
        uint256 denominator,
        Rounding rounding
    ) internal pure returns (uint256) {
        uint256 result = mulDiv(x, y, denominator);
        if (rounding == Rounding.Up && mulmod(x, y, denominator) > 0) {
            result += 1;
        }
        return result;
    }

    /**
     * @dev Returns the square root of a number. If the number is not a perfect square, the value is rounded down.
     *
     * Inspired by Henry S. Warren, Jr.'s "Hacker's Delight" (Chapter 11).
     */
    function sqrt(uint256 a) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        // For our first guess, we get the biggest power of 2 which is smaller than the square root of the target.
        //
        // We know that the "msb" (most significant bit) of our target number `a` is a power of 2 such that we have
        // `msb(a) <= a < 2*msb(a)`. This value can be written `msb(a)=2**k` with `k=log2(a)`.
        //
        // This can be rewritten `2**log2(a) <= a < 2**(log2(a) + 1)`
        // → `sqrt(2**k) <= sqrt(a) < sqrt(2**(k+1))`
        // → `2**(k/2) <= sqrt(a) < 2**((k+1)/2) <= 2**(k/2 + 1)`
        //
        // Consequently, `2**(log2(a) / 2)` is a good first approximation of `sqrt(a)` with at least 1 correct bit.
        uint256 result = 1 << (log2(a) >> 1);

        // At this point `result` is an estimation with one bit of precision. We know the true value is a uint128,
        // since it is the square root of a uint256. Newton's method converges quadratically (precision doubles at
        // every iteration). We thus need at most 7 iteration to turn our partial result with one bit of precision
        // into the expected uint128 result.
        unchecked {
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            return min(result, a / result);
        }
    }

    /**
     * @notice Calculates sqrt(a), following the selected rounding direction.
     */
    function sqrt(uint256 a, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = sqrt(a);
            return result + (rounding == Rounding.Up && result * result < a ? 1 : 0);
        }
    }

    /**
     * @dev Return the log in base 2, rounded down, of a positive value.
     * Returns 0 if given 0.
     */
    function log2(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >> 128 > 0) {
                value >>= 128;
                result += 128;
            }
            if (value >> 64 > 0) {
                value >>= 64;
                result += 64;
            }
            if (value >> 32 > 0) {
                value >>= 32;
                result += 32;
            }
            if (value >> 16 > 0) {
                value >>= 16;
                result += 16;
            }
            if (value >> 8 > 0) {
                value >>= 8;
                result += 8;
            }
            if (value >> 4 > 0) {
                value >>= 4;
                result += 4;
            }
            if (value >> 2 > 0) {
                value >>= 2;
                result += 2;
            }
            if (value >> 1 > 0) {
                result += 1;
            }
        }
        return result;
    }

    /**
     * @dev Return the log in base 2, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log2(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log2(value);
            return result + (rounding == Rounding.Up && 1 << result < value ? 1 : 0);
        }
    }

    /**
     * @dev Return the log in base 10, rounded down, of a positive value.
     * Returns 0 if given 0.
     */
    function log10(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >= 10**64) {
                value /= 10**64;
                result += 64;
            }
            if (value >= 10**32) {
                value /= 10**32;
                result += 32;
            }
            if (value >= 10**16) {
                value /= 10**16;
                result += 16;
            }
            if (value >= 10**8) {
                value /= 10**8;
                result += 8;
            }
            if (value >= 10**4) {
                value /= 10**4;
                result += 4;
            }
            if (value >= 10**2) {
                value /= 10**2;
                result += 2;
            }
            if (value >= 10**1) {
                result += 1;
            }
        }
        return result;
    }

    /**
     * @dev Return the log in base 10, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log10(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log10(value);
            return result + (rounding == Rounding.Up && 10**result < value ? 1 : 0);
        }
    }

    /**
     * @dev Return the log in base 256, rounded down, of a positive value.
     * Returns 0 if given 0.
     *
     * Adding one to the result gives the number of pairs of hex symbols needed to represent `value` as a hex string.
     */
    function log256(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >> 128 > 0) {
                value >>= 128;
                result += 16;
            }
            if (value >> 64 > 0) {
                value >>= 64;
                result += 8;
            }
            if (value >> 32 > 0) {
                value >>= 32;
                result += 4;
            }
            if (value >> 16 > 0) {
                value >>= 16;
                result += 2;
            }
            if (value >> 8 > 0) {
                result += 1;
            }
        }
        return result;
    }

    /**
     * @dev Return the log in base 10, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log256(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log256(value);
            return result + (rounding == Rounding.Up && 1 << (result * 8) < value ? 1 : 0);
        }
    }
}


// Dependency file: @openzeppelin/contracts/utils/Strings.sol

// OpenZeppelin Contracts (last updated v4.8.0) (utils/Strings.sol)

// pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @dev String operations.
 */
library Strings {
    bytes16 private constant _SYMBOLS = "0123456789abcdef";
    uint8 private constant _ADDRESS_LENGTH = 20;

    /**
     * @dev Converts a `uint256` to its ASCII `string` decimal representation.
     */
    function toString(uint256 value) internal pure returns (string memory) {
        unchecked {
            uint256 length = Math.log10(value) + 1;
            string memory buffer = new string(length);
            uint256 ptr;
            /// @solidity memory-safe-assembly
            assembly {
                ptr := add(buffer, add(32, length))
            }
            while (true) {
                ptr--;
                /// @solidity memory-safe-assembly
                assembly {
                    mstore8(ptr, byte(mod(value, 10), _SYMBOLS))
                }
                value /= 10;
                if (value == 0) break;
            }
            return buffer;
        }
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation.
     */
    function toHexString(uint256 value) internal pure returns (string memory) {
        unchecked {
            return toHexString(value, Math.log256(value) + 1);
        }
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation with fixed length.
     */
    function toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = _SYMBOLS[value & 0xf];
            value >>= 4;
        }
        require(value == 0, "Strings: hex length insufficient");
        return string(buffer);
    }

    /**
     * @dev Converts an `address` with fixed length of 20 bytes to its not checksummed ASCII `string` hexadecimal representation.
     */
    function toHexString(address addr) internal pure returns (string memory) {
        return toHexString(uint256(uint160(addr)), _ADDRESS_LENGTH);
    }
}


// Dependency file: @openzeppelin/contracts/utils/cryptography/ECDSA.sol

// OpenZeppelin Contracts (last updated v4.8.0) (utils/cryptography/ECDSA.sol)

// pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @dev Elliptic Curve Digital Signature Algorithm (ECDSA) operations.
 *
 * These functions can be used to verify that a message was signed by the holder
 * of the private keys of a given address.
 */
library ECDSA {
    enum RecoverError {
        NoError,
        InvalidSignature,
        InvalidSignatureLength,
        InvalidSignatureS,
        InvalidSignatureV // Deprecated in v4.8
    }

    function _throwError(RecoverError error) private pure {
        if (error == RecoverError.NoError) {
            return; // no error: do nothing
        } else if (error == RecoverError.InvalidSignature) {
            revert("ECDSA: invalid signature");
        } else if (error == RecoverError.InvalidSignatureLength) {
            revert("ECDSA: invalid signature length");
        } else if (error == RecoverError.InvalidSignatureS) {
            revert("ECDSA: invalid signature 's' value");
        }
    }

    /**
     * @dev Returns the address that signed a hashed message (`hash`) with
     * `signature` or error string. This address can then be used for verification purposes.
     *
     * The `ecrecover` EVM opcode allows for malleable (non-unique) signatures:
     * this function rejects them by requiring the `s` value to be in the lower
     * half order, and the `v` value to be either 27 or 28.
     *
     * IMPORTANT: `hash` _must_ be the result of a hash operation for the
     * verification to be secure: it is possible to craft signatures that
     * recover to arbitrary addresses for non-hashed data. A safe way to ensure
     * this is by receiving a hash of the original message (which may otherwise
     * be too long), and then calling {toEthSignedMessageHash} on it.
     *
     * Documentation for signature generation:
     * - with https://web3js.readthedocs.io/en/v1.3.4/web3-eth-accounts.html#sign[Web3.js]
     * - with https://docs.ethers.io/v5/api/signer/#Signer-signMessage[ethers]
     *
     * _Available since v4.3._
     */
    function tryRecover(bytes32 hash, bytes memory signature) internal pure returns (address, RecoverError) {
        if (signature.length == 65) {
            bytes32 r;
            bytes32 s;
            uint8 v;
            // ecrecover takes the signature parameters, and the only way to get them
            // currently is to use assembly.
            /// @solidity memory-safe-assembly
            assembly {
                r := mload(add(signature, 0x20))
                s := mload(add(signature, 0x40))
                v := byte(0, mload(add(signature, 0x60)))
            }
            return tryRecover(hash, v, r, s);
        } else {
            return (address(0), RecoverError.InvalidSignatureLength);
        }
    }

    /**
     * @dev Returns the address that signed a hashed message (`hash`) with
     * `signature`. This address can then be used for verification purposes.
     *
     * The `ecrecover` EVM opcode allows for malleable (non-unique) signatures:
     * this function rejects them by requiring the `s` value to be in the lower
     * half order, and the `v` value to be either 27 or 28.
     *
     * IMPORTANT: `hash` _must_ be the result of a hash operation for the
     * verification to be secure: it is possible to craft signatures that
     * recover to arbitrary addresses for non-hashed data. A safe way to ensure
     * this is by receiving a hash of the original message (which may otherwise
     * be too long), and then calling {toEthSignedMessageHash} on it.
     */
    function recover(bytes32 hash, bytes memory signature) internal pure returns (address) {
        (address recovered, RecoverError error) = tryRecover(hash, signature);
        _throwError(error);
        return recovered;
    }

    /**
     * @dev Overload of {ECDSA-tryRecover} that receives the `r` and `vs` short-signature fields separately.
     *
     * See https://eips.ethereum.org/EIPS/eip-2098[EIP-2098 short signatures]
     *
     * _Available since v4.3._
     */
    function tryRecover(
        bytes32 hash,
        bytes32 r,
        bytes32 vs
    ) internal pure returns (address, RecoverError) {
        bytes32 s = vs & bytes32(0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
        uint8 v = uint8((uint256(vs) >> 255) + 27);
        return tryRecover(hash, v, r, s);
    }

    /**
     * @dev Overload of {ECDSA-recover} that receives the `r and `vs` short-signature fields separately.
     *
     * _Available since v4.2._
     */
    function recover(
        bytes32 hash,
        bytes32 r,
        bytes32 vs
    ) internal pure returns (address) {
        (address recovered, RecoverError error) = tryRecover(hash, r, vs);
        _throwError(error);
        return recovered;
    }

    /**
     * @dev Overload of {ECDSA-tryRecover} that receives the `v`,
     * `r` and `s` signature fields separately.
     *
     * _Available since v4.3._
     */
    function tryRecover(
        bytes32 hash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal pure returns (address, RecoverError) {
        // EIP-2 still allows signature malleability for ecrecover(). Remove this possibility and make the signature
        // unique. Appendix F in the Ethereum Yellow paper (https://ethereum.github.io/yellowpaper/paper.pdf), defines
        // the valid range for s in (301): 0 < s < secp256k1n ÷ 2 + 1, and for v in (302): v ∈ {27, 28}. Most
        // signatures from current libraries generate a unique signature with an s-value in the lower half order.
        //
        // If your library generates malleable signatures, such as s-values in the upper range, calculate a new s-value
        // with 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141 - s1 and flip v from 27 to 28 or
        // vice versa. If your library also generates signatures with 0/1 for v instead 27/28, add 27 to v to accept
        // these malleable signatures as well.
        if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0) {
            return (address(0), RecoverError.InvalidSignatureS);
        }

        // If the signature is valid (and not malleable), return the signer address
        address signer = ecrecover(hash, v, r, s);
        if (signer == address(0)) {
            return (address(0), RecoverError.InvalidSignature);
        }

        return (signer, RecoverError.NoError);
    }

    /**
     * @dev Overload of {ECDSA-recover} that receives the `v`,
     * `r` and `s` signature fields separately.
     */
    function recover(
        bytes32 hash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal pure returns (address) {
        (address recovered, RecoverError error) = tryRecover(hash, v, r, s);
        _throwError(error);
        return recovered;
    }

    /**
     * @dev Returns an Ethereum Signed Message, created from a `hash`. This
     * produces hash corresponding to the one signed with the
     * https://eth.wiki/json-rpc/API#eth_sign[`eth_sign`]
     * JSON-RPC method as part of EIP-191.
     *
     * See {recover}.
     */
    function toEthSignedMessageHash(bytes32 hash) internal pure returns (bytes32) {
        // 32 is the length in bytes of hash,
        // enforced by the type signature above
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    /**
     * @dev Returns an Ethereum Signed Message, created from `s`. This
     * produces hash corresponding to the one signed with the
     * https://eth.wiki/json-rpc/API#eth_sign[`eth_sign`]
     * JSON-RPC method as part of EIP-191.
     *
     * See {recover}.
     */
    function toEthSignedMessageHash(bytes memory s) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n", Strings.toString(s.length), s));
    }

    /**
     * @dev Returns an Ethereum Signed Typed Data, created from a
     * `domainSeparator` and a `structHash`. This produces hash corresponding
     * to the one signed with the
     * https://eips.ethereum.org/EIPS/eip-712[`eth_signTypedData`]
     * JSON-RPC method as part of EIP-712.
     *
     * See {recover}.
     */
    function toTypedDataHash(bytes32 domainSeparator, bytes32 structHash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
    }
}


// Dependency file: contracts/orand/OrandECDSA.sol

// pragma solidity ^0.8.0;
// import '/Users/chiro/GitHub/orosign-contracts/node_modules/@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
// import 'contracts/libraries/Bytes.sol';
// import 'contracts/interfaces/IOrandECDSA.sol';

contract OrandECDSA is IOrandECDSA {
  // Orand operator address
  address private operator;

  // Epoch value
  mapping(address => uint256) private epoch;

  // Byte manipulation
  using Bytes for bytes;

  // Verifiy digital signature
  using ECDSA for bytes;
  using ECDSA for bytes32;

  // Event: Set New Operator
  event SetNewOperator(address indexed oldOperator, address indexed newOperator);

  // Set operator at constructing time
  constructor(address operatorAddress) {
    _setOperator(operatorAddress);
  }

  //=======================[  Internal  ]====================

  // Increasing epoch of receiver address
  function _increaseEpoch(address receiverAddress) internal {
    epoch[receiverAddress] += 1;
  }

  // Set proof operator
  function _setOperator(address operatorAddress) internal {
    emit SetNewOperator(operator, operatorAddress);
    operator = operatorAddress;
  }

  // Get epoch by receiver
  function _setTargetEpoch(OrandECDSAProof memory ecdsaProof) internal {
    epoch[ecdsaProof.receiverAddress] = ecdsaProof.receiverEpoch + 1;
  }

  //=======================[  Internal View  ]====================

  // Get epoch by receiver
  function _getTargetEpoch(address receiverAddress) internal view returns (uint96 targetEpoch) {
    return uint96(epoch[receiverAddress]);
  }

  // Get operator address
  function _getOperator() internal view returns (address operatorAddress) {
    return operator;
  }

  // Verify proof of operator
  function _decodeProof(bytes memory proof) internal pure returns (OrandECDSAProof memory ecdsaProof) {
    bytes memory signature = proof.readBytes(0, 65);
    bytes memory message = proof.readBytes(65, 64);
    uint256 proofUint = message.readUint256(0);
    ecdsaProof.receiverEpoch = uint96(proofUint >> 160);
    ecdsaProof.receiverAddress = address(uint160(proofUint));
    ecdsaProof.y = message.readUint256(32);
    ecdsaProof.signer = message.toEthSignedMessageHash().recover(signature);
    return ecdsaProof;
  }

  //=======================[  External View  ]====================

  // Get signer address from a valid proof
  function checkProofSigner(bytes memory proof) external pure returns (OrandECDSAProof memory ecdsaProof) {
    return _decodeProof(proof);
  }

  // Get operator
  function getOperator() external view returns (address operatorAddress) {
    return _getOperator();
  }

  // Get epoch by receiver address
  function getTargetEpoch(address receiverAddress) external view returns (uint96 targetEpoch) {
    return _getTargetEpoch(receiverAddress);
  }
}


// Dependency file: contracts/interfaces/IOrandPenalty.sol

// pragma solidity ^0.8.0;

error NotEnougCollateral(uint256 balance, uint256 requiredCollateral);
error InvalidCaller(address callerAddress);

interface IOrandPenalty {
  // Deposit collateral for a consumer contract address
  function deposit(address consumerContract) external payable returns (bool isSuccess);

  // Withdraw all native token to receiver address
  function withdraw() external returns (bool isSuccess);

  // Get penalty fee
  function getPenaltyFee() external view returns (uint256 fee);

  // Get colateral balance
  function collateralBalance(address consumerAddress) external view returns (uint256 balance);
}


// Dependency file: contracts/orand/OrandPenalty.sol

// pragma solidity ^0.8.0;

// import 'contracts/interfaces/IOrandPenalty.sol';

contract OrandPenalty is IOrandPenalty {
  // Store collateral information
  mapping(address => uint256) private collateral;

  // Penalty fee
  uint256 private penaltyFee;

  // Transfer event
  event Transfer(address indexed from, address indexed to, uint256 indexed value);

  // Apply penalty
  event ApplyPenalty(address indexed plaintiff, address indexed theAccused, uint256 indexed value);

  // Set penalty
  event SetPenalty(uint256 oldPenaltyFee, uint256 newPenaltyFee);

  // Only consumer able to trigger
  modifier onlyConsumerContract() {
    if (_collateralBalance(msg.sender) == 0) {
      revert InvalidCaller(msg.sender);
    }
    _;
  }

  // Set penalty fee for consumer
  constructor(uint256 initalFee) {
    _setPenalty(initalFee);
  }

  //=======================[  Internal ]====================

  // Transfer collateral to agiven address and recude the collateral record
  function _transferCollateral(address from, address to, uint256 value) internal {
    // Transfer native token to consumer contract
    payable(address(to)).transfer(value);

    // Reduce the collateral of sender with the same amount
    collateral[from] -= value;
  }

  // Apply penalty to the accused
  function _applyPenalty(address theAccused) internal {
    address plaintiff = msg.sender;
    _transferCollateral(theAccused, plaintiff, penaltyFee);
    emit ApplyPenalty(plaintiff, theAccused, penaltyFee);
  }

  // Set the penalty amount
  function _setPenalty(uint256 newPenaltyFee) internal {
    emit SetPenalty(penaltyFee, newPenaltyFee);
    penaltyFee = newPenaltyFee;
  }

  //=======================[  External ]====================

  // Deposit collateral for a consumer contract address
  function deposit(address consumerContract) external payable returns (bool isSuccess) {
    // Increase collateral balance of comsumer
    collateral[consumerContract] += msg.value;
    emit Transfer(consumerContract, address(this), msg.value);
    return true;
  }

  // Withdraw all native token to consumer address
  function withdraw() external onlyConsumerContract returns (bool isSuccess) {
    address receiver = msg.sender;

    // Amount of native token to be withdraw
    uint256 withdrawCollateral = collateral[receiver];

    _transferCollateral(receiver, receiver, withdrawCollateral);

    // Trigger event
    emit Transfer(address(this), receiver, withdrawCollateral);

    return true;
  }

  //=======================[  Internal view ]====================

  // Get penalty fee
  function _getPenaltyFee() internal view returns (uint256 fee) {
    return penaltyFee;
  }

  // Get colateral balance
  function _collateralBalance(address consumerAddress) internal view returns (uint256 balance) {
    return collateral[consumerAddress];
  }

  //=======================[  External view ]====================

  // Get penalty fee
  function getPenaltyFee() external view returns (uint256 fee) {
    return _getPenaltyFee();
  }

  // Get colateral balance
  function collateralBalance(address consumerAddress) external view returns (uint256 balance) {
    return _collateralBalance(consumerAddress);
  }
}


// Dependency file: contracts/interfaces/IOrandECVRF.sol

// pragma solidity ^0.8.0;
// import 'contracts/interfaces/IOrandStorage.sol';

interface IOrandECVRF {
  // Verify proof from provider
  function verifyProof(
    uint256[2] memory pk,
    uint256 alpha,
    IOrandStorage.ECVRFEpochProof memory epoch
  ) external view returns (uint256 output);
}


// Dependency file: contracts/interfaces/IOrandProviderV1.sol

// pragma solidity ^0.8.0;
// import 'contracts/interfaces/IOrandStorage.sol';
// import 'contracts/interfaces/IOrandECDSA.sol';

error UnableToForwardRandomness(address receiver, uint256 epoch, uint256 y);
error UnableToIncreaseEpoch();
error EverythingIsCorrect(IOrandECDSA.OrandECDSAProof ecdsaProof);
error InvalidEpoch();

interface IOrandProviderV1 is IOrandStorage, IOrandECDSA {}


// Dependency file: contracts/interfaces/IOrandConsumerV1.sol

// pragma solidity ^0.8.0;

error InvalidProvider();

interface IOrandConsumerV1 {
  // Consume the verifiable randomness from provider
  function consumeRandomness(uint256 randomness) external returns (bool);
}


// Root file: contracts/orand/OrandProviderV1.sol

pragma solidity ^0.8.0;
// import '/Users/chiro/GitHub/orosign-contracts/node_modules/@openzeppelin/contracts/access/Ownable.sol';
// import 'contracts/orand/OrandManagement.sol';
// import 'contracts/orand/OrandStorage.sol';
// import 'contracts/orand/OrandECDSA.sol';
// import 'contracts/orand/OrandPenalty.sol';
// import 'contracts/interfaces/IOrandECVRF.sol';
// import 'contracts/interfaces/IOrandProviderV1.sol';
// import 'contracts/interfaces/IOrandConsumerV1.sol';

contract OrandProviderV1 is Ownable, IOrandProviderV1, OrandStorage, OrandManagement, OrandECDSA, OrandPenalty {
  // ECVRF verifier smart contract
  IOrandECVRF ecvrf;

  // Event: Set New ECVRF Verifier
  event SetNewECVRFVerifier(address indexed actor, address indexed ecvrfAddress);

  // Provider V1 will support many consumers at once
  constructor(
    bytes memory pk,
    address operatorAddress,
    address ecvrfAddress,
    uint256 penaltyFee
  ) OrandManagement(pk) OrandECDSA(operatorAddress) OrandPenalty(penaltyFee) {
    ecvrf = IOrandECVRF(ecvrfAddress);
  }

  //=======================[  Owner  ]====================

  // Update new ECVRF verifier
  function setNewECVRFVerifier(address ecvrfAddress) external onlyOwner {
    ecvrf = IOrandECVRF(ecvrfAddress);
    emit SetNewECVRFVerifier(msg.sender, ecvrfAddress);
  }

  // Set new operator to submit proof
  function setOperator(address operatorAddress) external onlyOwner returns (bool) {
    _setOperator(operatorAddress);
    return true;
  }

  // Set new public key to verify proof
  function setPublicKey(bytes memory pk) external onlyOwner returns (bool) {
    _setPublicKey(pk);
    return true;
  }

  // Set the penalty amount
  function setPenalty(uint256 newPenaltyFee) external onlyOwner returns (bool) {
    _setPenalty(newPenaltyFee);
    return true;
  }

  // Set the penalty amount
  function switchToValidityProof(bytes memory proof) external onlyOwner returns (bool) {
    OrandECDSAProof memory ecdsaProof = _decodeProof(proof);
    _setEpochResult(ecdsaProof);
    _setTargetEpoch(ecdsaProof);
    return true;
  }

  //=======================[  External  ]====================

  // Publish new epoch with ECDSA + Validity ECVRF proof
  function publishValidityProof(bytes memory proof, ECVRFEpochProof memory newEpoch) external returns (bool) {
    // Output of current epoch
    uint256 y;

    OrandECDSAProof memory ecdsaProof = _decodeProof(proof);

    // Make sure that the old epoch won't be used
    if (_getTargetEpoch(ecdsaProof.receiverAddress) != ecdsaProof.receiverEpoch) {
      revert InvalidProofEpoch(ecdsaProof.receiverEpoch);
    }

    // Proof signer must be the operator
    if (_getOperator() != ecdsaProof.signer) {
      revert InvalidProofSigner(ecdsaProof.signer);
    }

    // Epoch 0 won't check the proof
    if (ecdsaProof.receiverEpoch > 0) {
      y = ecvrf.verifyProof(_getPublicKey(), _getCurrentAlpha(ecdsaProof.receiverAddress), newEpoch);
    } else {
      y = uint256(keccak256(abi.encodePacked(newEpoch.gamma[0], newEpoch.gamma[1])));
    }

    // These two value must be the same
    if (ecdsaProof.y != y) {
      revert MismatchProofResult(y, ecdsaProof.y);
    }

    // Check for the existing smart contract and forward randomness to receiver
    if (ecdsaProof.receiverAddress.code.length > 0) {
      if (!IOrandConsumerV1(ecdsaProof.receiverAddress).consumeRandomness(y)) {
        revert UnableToForwardRandomness(ecdsaProof.receiverAddress, ecdsaProof.receiverEpoch, y);
      }
    }

    // Add epoch to the chain
    _addValidityEpoch(ecdsaProof);

    // Increasing epoch of receiver to prevent replay attack
    _increaseEpoch(ecdsaProof.receiverAddress);
    return true;
  }

  // Publish new with ECDSA + Fraud proof
  function publishFraudProof(bytes memory proof) external returns (bool) {
    // Verify ECDSA proof
    OrandECDSAProof memory ecdsaProof = _decodeProof(proof);

    // Make sure that consumer have enough collateral for fraud proof
    if (_collateralBalance(ecdsaProof.receiverAddress) < _getPenaltyFee()) {
      revert NotEnougCollateral(_collateralBalance(ecdsaProof.receiverAddress), _getPenaltyFee());
    }

    // Check for the existing smart contract and forward randomness to receiver
    if (ecdsaProof.receiverAddress.code.length > 0) {
      if (!IOrandConsumerV1(ecdsaProof.receiverAddress).consumeRandomness(ecdsaProof.y)) {
        revert UnableToForwardRandomness(ecdsaProof.receiverAddress, ecdsaProof.receiverEpoch, ecdsaProof.y);
      }
    }

    // Store fraud proof
    _addFraudEpoch(ecdsaProof);

    return true;
  }

  // Allow user to sure service provider and its alliance
  function sueFraudProof(bytes memory proof, ECVRFEpochProof memory newEpoch) external returns (bool) {
    // Verify ECDSA proof
    OrandECDSAProof memory ecdsaProof = _decodeProof(proof);

    // Zero epoch can't be sue since it's genesis
    if (ecdsaProof.receiverEpoch <= 1) {
      revert InvalidEpoch();
    }

    // Try to verify ECVRF proof
    try
      ecvrf.verifyProof(
        _getPublicKey(),
        _getFraudProofAlpha(ecdsaProof.receiverAddress, ecdsaProof.receiverEpoch - 1),
        newEpoch
      )
    returns (uint256 y) {
      if (y == uint256(keccak256(abi.encodePacked(newEpoch.gamma[0], newEpoch.gamma[1])))) {
        // Everything is good Orochi Network and Orand's consumer are doing the right thing
        revert EverythingIsCorrect(ecdsaProof);
      }
    } catch {
      // If there is an error that mean ECVRF proof is invalid
    }

    // Mark the epoch as sued
    _markAsSued(ecdsaProof);

    // Apply the penalty to the accursed
    _applyPenalty(ecdsaProof.receiverAddress);

    return true;
  }

  //=======================[  External View  ]====================

  // Get address of ECVRF verifier
  function getECVRFVerifier() external view returns (address) {
    return address(ecvrf);
  }

  // Check ECVRF proof
  function checkECVRFProof(uint256 alpha, ECVRFEpochProof memory newEpoch) external view returns (uint256 epochResult) {
    return ecvrf.verifyProof(_getPublicKey(), alpha, newEpoch);
  }
}
