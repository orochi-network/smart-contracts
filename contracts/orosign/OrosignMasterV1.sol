// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.4 <0.9.0;
pragma abicoder v2;

import '@openzeppelin/contracts/proxy/Clones.sol';
import '../libraries/Permissioned.sol';
import '../interfaces/IOrosignV1.sol';

// It required to pay for fee in native token
error FeeIsRequired(uint256 inputAmount, uint256 requireAmount);
// Unable to init new wallet
error UnableToInitNewWallet(address newWallet);

/**
 * Orosign Master V1
 */
contract OrosignMasterV1 is Permissioned {
  // Allow master to clone other multi signature contract
  using Clones for address;

  // Permission to manage fund
  uint256 internal constant PERMISSION_TRANSFER = 1;
  // Permission to operate the Orosign Master V1
  uint256 internal constant PERMISSION_OPERATOR = 2;

  // Secured timeout
  uint256 internal constant SECURED_TIMEOUT = 3 days;

  // Wallet implementation
  address private _implementation;

  // Price in native token
  uint256 private _walletFee;

  // Chain id
  uint256 private _chainId;

  // Create new wallet
  event CreateNewWallet(address indexed walletAddress, uint256 indexed salt, uint256 indexed threshold);

  // Upgrade implementation
  event UpgradeImplementation(address indexed oldImplementation, address indexed upgradeImplementation);

  // Request small fee to create new wallet, we prevent people spaming wallet
  modifier requireFee() {
    if (msg.value < _walletFee) {
      revert FeeIsRequired(msg.value, _walletFee);
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
    _implementation = implementation_;
    _walletFee = fee_;
    // We use input chainId instead of EIP-1344
    _chainId = chainId_;
    _init(users_, roles_);
    emit UpgradeImplementation(address(0), implementation_);
  }

  /*******************************************************
   * User section
   ********************************************************/
  // Transfer existing role to a new user
  function transferRole(address newUser) external onlyUser {
    // New user will be activated after SECURED_TIMEOUT + 1 hours
    _transferRole(newUser, SECURED_TIMEOUT + 1 hours);
  }

  /*******************************************************
   * Transfer section
   ********************************************************/
  // Withdraw all of the balance to the fee collector
  function withdraw(address payable receiver) external onlyAllow(PERMISSION_TRANSFER) {
    receiver.transfer(address(this).balance);
  }

  /*******************************************************
   * Operator section
   ********************************************************/
  // Upgrade new implementation
  function upgradeImplementation(address newImplementation) external onlyAllow(PERMISSION_OPERATOR) {
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
  ) external payable requireFee returns (address) {
    address newWallet = _implementation.cloneDeterministic(_getUniqueSalt(msg.sender, salt));
    emit CreateNewWallet(newWallet, salt, threshold_);
    if (!IOrosignV1(newWallet).init(_chainId, users_, roles_, threshold_)) {
      revert UnableToInitNewWallet(newWallet);
    }
    return newWallet;
  }

  /*******************************************************
   * Private section
   ********************************************************/
  function _getUniqueSalt(address creatorAddress, uint256 salt) private pure returns (bytes32 packedSalt) {
    assembly {
      packedSalt := xor(shl(160, salt), creatorAddress)
    }
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

  // Check a Multi Signature Wallet existing by creator & salt
  function isMultiSigExistByCreator(address creatorAddress, uint256 salt) public view returns (bool) {
    return predictWalletAddress(creatorAddress, salt).code.length > 0;
  }

  // Check a Multi Signature Wallet is existed
  function isMultiSigExist(address walletAddress) public view returns (bool) {
    return walletAddress.code.length > 0;
  }

  // Calculate deterministic address
  function predictWalletAddress(address creatorAddress, uint256 salt) public view returns (address) {
    return _implementation.predictDeterministicAddress(_getUniqueSalt(creatorAddress, salt));
  }
}
