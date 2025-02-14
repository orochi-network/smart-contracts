// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import './UserManagement.sol';
import './interfaces/IGameContract.sol';
import './interfaces/IGameContractFactory.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/proxy/Clones.sol';

contract GameContractFactory is IGameContractFactory, UserManagement, Ownable {
  using Clones for address;

  // Address of template game contract
  address private implementation;

  // Check address is valid
  modifier onlyValidAddress(address validatingAddress) {
    if (validatingAddress == address(0)) {
      revert InvalidAddress();
    }
    _;
  }

  constructor(address _implementation) onlyValidAddress(_implementation) {
    implementation = _implementation;
    emit UpgradeImplementation(msg.sender, address(0), _implementation);
  }

  /*******************************************************
   * Owner section
   ********************************************************/

  // Upgrade new implementation
  function upgradeImplementation(
    address newImplementation
  ) external onlyOwner onlyValidAddress(newImplementation) returns (bool) {
    address oldImplementation = implementation;
    // Overwrite current implementation address
    implementation = newImplementation;
    emit UpgradeImplementation(msg.sender, oldImplementation, newImplementation);
    return true;
  }

  // Add new Users in list
  function userListAdd(address[] memory userListToAdd) external onlyOwner {
    _userListAdd(userListToAdd);
  }

  // Remove new Users in list
  function userListRemove(address[] memory userListToRemove) external onlyOwner {
    _userListRemove(userListToRemove);
  }

  /*******************************************************
   * User section
   ********************************************************/

  // Deploy game contract
  function deployGameContract(address gameContractOwner, uint96 salt) external onlyUser returns (address) {
    address newGameContract = implementation.cloneDeterministic(_packing(salt, msg.sender));

    IGameContract(newGameContract).initialize(gameContractOwner);
    emit GameContractDeploy(newGameContract, gameContractOwner, _packing(salt, msg.sender));
    return newGameContract;
  }

  /*******************************************************
   * Internal pure section
   ********************************************************/

  // packing salt and address to generate unique salt for this address
  function _packing(uint96 a, address b) internal pure returns (bytes32 packed) {
    assembly {
      packed := or(shl(160, a), b)
    }
  }

  /*******************************************************
   * External view section
   ********************************************************/

  // Predict deploy address with this salt
  function predictWalletAddress(uint96 salt, address creatorAddress) external view returns (address predictedAddress) {
    return implementation.predictDeterministicAddress(_packing(salt, creatorAddress));
  }

  // Check if contract existed
  function isGameContractExist(address gameContractAddress) external view returns (bool isExist) {
    return gameContractAddress.code.length > 0;
  }

  // Packing salt and creator address
  function packingSalt(uint96 salt, address creatorAddress) external pure returns (uint256 packedSalt) {
    return uint256(_packing(salt, creatorAddress));
  }

  // Check list user status which have added and which hasn't
  function userListCheck(address[] memory userListToCheck) external view returns (bool[] memory) {
    return _userListCheck(userListToCheck);
  }

  // Check user status
  function userCheck(address userToCheck) external view returns (bool) {
    return _userCheck(userToCheck);
  }

  // Total user has been added
  function userTotal() external view returns (uint256) {
    return _userTotal();
  }
}
