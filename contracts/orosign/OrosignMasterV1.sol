// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '@openzeppelin/contracts/proxy/Clones.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import './interfaces/IOrosignV1.sol';

// Unable to init new wallet
error UnableToInitNewWallet(uint96 salt, address owner, address newWallet);
// Only operator
error OnlyOperatorAllowed(address actor);
// Invalid operator address
error InvalidOperator(address operatorAddress);
// Invalid Address
error InvalidAddress();

/**
 * Orosign Master V1
 */
contract OrosignMasterV1 is Ownable, ReentrancyGuard {
  // Allow master to clone other multi signature contract
  using Clones for address;

  // Wallet implementation
  address private implementation;

  // Operator list
  mapping(address => bool) private operator;

  // Create new wallet
  event CreateNewWallet(uint96 indexed salt, address indexed owner, address indexed walletAddress);

  // Upgrade implementation
  event UpgradeImplementation(address indexed oldImplementation, address indexed upgradeImplementation);

  // Add Operator
  event AddOperator(address indexed newOperatorAddress);

  // Remove Operator
  event RemoveOperator(address indexed oldOperatorAddress);

  // We only allow operator
  modifier onlyOperator() {
    if (!operator[msg.sender]) {
      revert OnlyOperatorAllowed(msg.sender);
    }
    _;
  }

  // We only allow valid address
  modifier onlyValidAddress(address validatingAddress) {
    if (validatingAddress == address(0)) {
      revert InvalidAddress();
    }
    _;
  }

  // Pass parameters to parent contract
  constructor(
    address multisigImplementation,
    address operatorAddress
  ) onlyValidAddress(multisigImplementation) onlyValidAddress(operatorAddress) {
    // Set the address of orosign implementation
    implementation = multisigImplementation;

    _addOperator(operatorAddress);

    emit UpgradeImplementation(address(0), multisigImplementation);
  }

  /*******************************************************
   * Internal section
   ********************************************************/

  // Add new operator
  function _addOperator(address newOperator) internal {
    operator[newOperator] = true;
    emit AddOperator(newOperator);
  }

  // Remove old operator
  function _removeOperator(address oldOperator) internal {
    if (!operator[oldOperator]) {
      revert InvalidOperator(oldOperator);
    }
    operator[oldOperator] = false;
    emit RemoveOperator(oldOperator);
  }

  /*******************************************************
   * Manager section
   ********************************************************/

  // Add new operator
  function addOperator(address newOperator) external onlyOwner onlyValidAddress(newOperator) returns (bool) {
    _addOperator(newOperator);
    return true;
  }

  // Remove old operator
  function removeOperator(address oldOperator) external onlyOwner returns (bool) {
    _removeOperator(oldOperator);
    return true;
  }

  /*******************************************************
   * Operator section
   ********************************************************/

  // Upgrade new implementation
  function upgradeImplementation(
    address newImplementation
  ) external onlyOperator onlyValidAddress(newImplementation) returns (bool) {
    // Overwrite current implementation address
    implementation = newImplementation;
    emit UpgradeImplementation(implementation, newImplementation);
    return true;
  }

  /*******************************************************
   * External section
   ********************************************************/

  // Create new multisig wallet
  function createWallet(
    uint96 salt,
    address[] memory userList,
    uint256[] memory roleList,
    uint256 votingThreshold
  ) external nonReentrant returns (address newWalletAdress) {
    newWalletAdress = implementation.cloneDeterministic(_packing(salt, msg.sender));
    if (newWalletAdress == address(0) || !IOrosignV1(newWalletAdress).init(userList, roleList, votingThreshold)) {
      revert UnableToInitNewWallet(salt, msg.sender, newWalletAdress);
    }
    emit CreateNewWallet(salt, msg.sender, newWalletAdress);
    return newWalletAdress;
  }

  /*******************************************************
   * Internal View section
   ********************************************************/

  // Packing address and uint96 to a single bytes32
  // 96 bits a ++ 160 bits b
  function _packing(uint96 a, address b) internal pure returns (bytes32 packed) {
    assembly {
      packed := or(shl(160, a), b)
    }
  }

  // Calculate deterministic address
  function _predictWalletAddress(uint96 salt, address creatorAddress) internal view returns (address predictedAddress) {
    return implementation.predictDeterministicAddress(_packing(salt, creatorAddress));
  }

  // Check a smart contract is existed
  function _isContractExist(address walletAddress) internal view returns (bool isExist) {
    return walletAddress.code.length > 0;
  }

  /*******************************************************
   * View section
   ********************************************************/

  // Get metadata of Orosign Master V1
  function getMetadata() external view returns (uint256 sChainId, address sImplementation) {
    sChainId = block.chainid;
    sImplementation = implementation;
  }

  // Calculate deterministic address
  function predictWalletAddress(uint96 salt, address creatorAddress) external view returns (address predictedAddress) {
    return _predictWalletAddress(salt, creatorAddress);
  }

  // Check a smart contract is existed
  function isContractExist(address walletAddress) external view returns (bool isExist) {
    return _isContractExist(walletAddress);
  }

  // Check a Multi Signature Wallet existing by creator and salt
  function isMultiSigExist(uint96 salt, address creatorAddress) external view returns (bool isExist) {
    return _isContractExist(_predictWalletAddress(salt, creatorAddress));
  }

  // Packing salt and creator address
  function packingSalt(uint96 salt, address creatorAddress) external pure returns (uint256 packedSalt) {
    return uint256(_packing(salt, creatorAddress));
  }
}
