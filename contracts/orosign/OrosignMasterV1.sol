// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.4 <0.9.0;
pragma abicoder v2;

import '@openzeppelin/contracts/proxy/Clones.sol';
import '../libraries/Permissioned.sol';
import '../interfaces/IOrosignV1.sol';

/**
 * Orosign Master V1
 */
contract OrosignMasterV1 is Permissioned {
  // It required to pay for fee in native token
  error InvalidFee(uint256 inputAmount, uint256 requireAmount);
  // Unable to init new wallet
  error UnableToInitNewWallet(uint96 salt, address owner, address newWallet);
  // Unable to init Orosign master
  error UnableToInitOrosignMaster();

  // Allow master to clone other multi signature contract
  using Clones for address;

  // Permission to manage fund
  uint256 private constant PERMISSION_WITHDRAW = 1;
  // Permission to operate the Orosign Master V1
  uint256 private constant PERMISSION_OPERATE = 2;

  // Secured timeout
  uint256 private constant SECURED_TIMEOUT = 3 days;

  // Wallet implementation
  address private implementation;

  // Price in native token
  uint256 private walletFee;

  // Chain id
  uint256 private chainId;

  // Create new wallet
  event CreateNewWallet(uint96 indexed salt, address indexed owner, address indexed walletAddress);

  // Upgrade implementation
  event UpgradeImplementation(address indexed oldImplementation, address indexed upgradeImplementation);

  // Set new fee
  event UpdateFee(uint256 indexed timestamp, uint256 indexed oldFee, uint256 indexed newFee);

  // Request small fee to create new wallet, we prevent people spaming wallet
  modifier requireFee() {
    if (msg.value != walletFee) {
      revert InvalidFee(msg.value, walletFee);
    }
    _;
  }

  // This contract able to receive fund
  receive() external payable {}

  // Pass parameters to parent contract
  constructor(
    uint256 inputChainId,
    address[] memory userList,
    uint256[] memory roleList,
    address multisigImplementation,
    uint256 createWalletFee
  ) {
    // We use input chainId instead of EIP-1344
    chainId = inputChainId;

    // We will revert if we're failed to init permissioned
    _init(userList, roleList);

    // Set the address of orosign implementation
    implementation = multisigImplementation;

    // Set wallet fee
    walletFee = createWalletFee;
    emit UpgradeImplementation(address(0), multisigImplementation);
  }

  /*******************************************************
   * User section
   ********************************************************/

  // Transfer existing role to a new user
  function transferRole(address newUser) external onlyUser returns (bool) {
    // New user will be activated after SECURED_TIMEOUT + 1 hours
    _transferRole(newUser, SECURED_TIMEOUT + 1 hours);
    return true;
  }

  /*******************************************************
   * Withdraw section
   ********************************************************/

  // Withdraw all of the balance to the fee collector
  function withdraw(address payable receiver) external onlyAllow(PERMISSION_WITHDRAW) returns (bool) {
    receiver.transfer(address(this).balance);
    return true;
  }

  /*******************************************************
   * Operator section
   ********************************************************/

  // Upgrade new implementation
  function upgradeImplementation(address newImplementation) external onlyAllow(PERMISSION_OPERATE) returns (bool) {
    emit UpgradeImplementation(implementation, newImplementation);
    implementation = newImplementation;
    return true;
  }

  // Allow operator to set new fee
  function setFee(uint256 newFee) external onlyAllow(PERMISSION_OPERATE) returns (bool) {
    emit UpdateFee(block.timestamp, walletFee, newFee);
    walletFee = newFee;
    return true;
  }

  /*******************************************************
   * Public section
   ********************************************************/

  // Create new multisig wallet
  function createWallet(
    uint96 salt,
    address[] memory userList,
    uint256[] memory roleList,
    uint256 votingThreshold
  ) external payable requireFee returns (address newWalletAdress) {
    newWalletAdress = implementation.cloneDeterministic(_packing(salt, msg.sender));
    if (
      newWalletAdress == address(0) || !IOrosignV1(newWalletAdress).init(chainId, userList, roleList, votingThreshold)
    ) {
      revert UnableToInitNewWallet(salt, msg.sender, newWalletAdress);
    }
    emit CreateNewWallet(salt, msg.sender, newWalletAdress);
    return newWalletAdress;
  }

  // Calculate deterministic address
  function _predictWalletAddress(uint96 salt, address creatorAddress) internal view returns (address) {
    return implementation.predictDeterministicAddress(_packing(salt, creatorAddress));
  }

  // Check a Multi Signature Wallet is existed
  function _isMultiSigExist(address walletAddress) internal view returns (bool) {
    return walletAddress.code.length > 0;
  }

  /*******************************************************
   * View section
   ********************************************************/

  // Get chain id of Orosign Master V1
  function getChainId() external view returns (uint256) {
    return chainId;
  }

  // Get fee to generate a new wallet
  function getFee() external view returns (uint256) {
    return walletFee;
  }

  // Get implementation address
  function getImplementation() external view returns (address) {
    return implementation;
  }

  // Calculate deterministic address
  function predictWalletAddress(uint96 salt, address creatorAddress) external view returns (address) {
    return implementation.predictDeterministicAddress(_packing(salt, creatorAddress));
  }

  // Check a Multi Signature Wallet is existed
  function isMultiSigExist(address walletAddress) external view returns (bool) {
    return walletAddress.code.length > 0;
  }

  // Check a Multi Signature Wallet existing by creator & salt
  function isMultiSigExistByCreator(uint96 salt, address creatorAddress) external view returns (bool) {
    return _isMultiSigExist(_predictWalletAddress(salt, creatorAddress));
  }

  // Calculate deterministic address
  function packingSalt(uint96 salt, address creatorAddress) external pure returns (uint256) {
    return uint256(_packing(salt, creatorAddress));
  }
}
