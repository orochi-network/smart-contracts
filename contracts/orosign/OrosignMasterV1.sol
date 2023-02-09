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
  address private _implementation;

  // Price in native token
  uint256 private _walletFee;

  // Chain id
  uint256 private _chainId;

  // Create new wallet
  event CreateNewWallet(uint96 indexed salt, address indexed owner, address indexed walletAddress);

  // Upgrade implementation
  event UpgradeImplementation(address indexed oldImplementation, address indexed upgradeImplementation);

  // Request small fee to create new wallet, we prevent people spaming wallet
  modifier requireFee() {
    if (msg.value != _walletFee) {
      revert InvalidFee(msg.value, _walletFee);
    }
    _;
  }

  // This contract able to receive fund
  receive() external payable {}

  // Pass parameters to parent contract
  constructor(
    uint256 chainId_,
    address[] memory users_,
    uint256[] memory roles_,
    address implementation_,
    uint256 fee_
  ) {
    // We use input chainId instead of EIP-1344
    _chainId = chainId_;
    // We will revert if we're failed to init permissioned
    if (!_init(users_, roles_)) {
      revert UnableToInitOrosignMaster();
    }
    // Set the address of orosign implementation
    _implementation = implementation_;
    // Set wallet fee
    _walletFee = fee_;
    emit UpgradeImplementation(address(0), implementation_);
  }

  /*******************************************************
   * User section
   ********************************************************/
  // Transfer existing role to a new user
  function transferRole(address newUser) external onlyUser returns (bool) {
    // New user will be activated after SECURED_TIMEOUT + 1 hours
    return _transferRole(newUser, SECURED_TIMEOUT + 1 hours);
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
   * Operate section
   ********************************************************/
  // Upgrade new implementation
  function upgradeImplementation(address newImplementation) external onlyAllow(PERMISSION_OPERATE) {
    emit UpgradeImplementation(_implementation, newImplementation);
    _implementation = newImplementation;
  }

  /*******************************************************
   * Public section
   ********************************************************/
  // Create new multisig wallet
  function createWallet(
    uint96 salt,
    address[] memory users_,
    uint256[] memory roles_,
    uint256 threshold_
  ) external payable requireFee returns (address newWalletAdress) {
    newWalletAdress = _implementation.cloneDeterministic(_packing(salt, msg.sender));
    if (newWalletAdress == address(0) || !IOrosignV1(newWalletAdress).init(_chainId, users_, roles_, threshold_)) {
      revert UnableToInitNewWallet(salt, msg.sender, newWalletAdress);
    }
    emit CreateNewWallet(salt, msg.sender, newWalletAdress);
    return newWalletAdress;
  }

  /*******************************************************
   * View section
   ********************************************************/

  // Get chain id of Orosign Master V1
  function getChainId() external view returns (uint256) {
    return _chainId;
  }

  // Get fee to generate a new wallet
  function getFee() external view returns (uint256) {
    return _walletFee;
  }

  // Get implementation address
  function getImplementation() external view returns (address) {
    return _implementation;
  }

  // Calculate deterministic address
  function predictWalletAddress(uint96 salt, address creatorAddress) public view returns (address) {
    return _implementation.predictDeterministicAddress(_packing(salt, creatorAddress));
  }

  // Check a Multi Signature Wallet is existed
  function isMultiSigExist(address walletAddress) public view returns (bool) {
    return walletAddress.code.length > 0;
  }

  // Check a Multi Signature Wallet existing by creator & salt
  function isMultiSigExistByCreator(uint96 salt, address creatorAddress) public view returns (bool) {
    return isMultiSigExist(predictWalletAddress(salt, creatorAddress));
  }

  // Calculate deterministic address
  function packingSalt(uint96 salt, address creatorAddress) external pure returns (uint256) {
    return uint256(_packing(salt, creatorAddress));
  }
}
