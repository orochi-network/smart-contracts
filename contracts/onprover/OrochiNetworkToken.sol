// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import { ECDSA } from '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '../libraries/Operatable.sol';

/**
 * @title Orochi Network Token
 */
contract OrochiNetworkToken is ERC20, Operatable, Ownable, ReentrancyGuard {
  /*******************************************************
   * Constructor
   ********************************************************/

  /**
   * Deploy and initialize the ONProver contract
   * @param name Token name
   * @param symbol Token symbol
   * @param listOperator List of operator will be add
   */
  constructor(string memory name, string memory symbol, address[] memory listOperator) ERC20(name, symbol) {
    for (uint256 i = 0; i < listOperator.length; i += 1) {
      require(listOperator[i] != address(0), 'Only allow non-zero addresses');
      _addOperator(listOperator[i]);
    }
  }

  /*******************************************************
   * External Owner
   ********************************************************/

  /**
   * Add new operator to operator list
   * @param operatorNew New operator
   */
  function addOperator(address operatorNew) external onlyOwner returns (bool) {
    return _addOperator(operatorNew);
  }

  /**
   * Remove an operator from operator list
   * @param operatorOld Old operator
   */
  function removeOperator(address operatorOld) external onlyOwner returns (bool) {
    return _removeOperator(operatorOld);
  }

  /*******************************************************
   * External Operator
   ********************************************************/

  /**
   * Mint tokens to a specific address
   * @param to Address to receive minted tokens
   * @param amount Amount of tokens to mint
   */
  function mint(address to, uint256 amount) external onlyOperator nonReentrant returns (bool) {
    _mint(to, amount);
    return true;
  }

  /**
   * Burn tokens from a specific address
   * @param from Address to burn tokens from
   * @param amount Amount of tokens to burn
   */
  function burn(address from, uint256 amount) external onlyOperator nonReentrant returns (bool) {
    _burn(from, amount);
    return true;
  }

  /**
   * Batch mint tokens to a specific address
   * @param packedData Array of 160 bytes(address) + 96 bytes(value) elements
   */
  function batchMint(uint256[] calldata packedData) external onlyOperator returns (uint256) {
    for (uint i = 0; i < packedData.length; i += 1) {
      (uint96 amount, address to) = _unpack(packedData[i]);
      _mint(to, amount);
    }
    return packedData.length;
  }

  // Burn token in packed data
  function batchBurn(uint256[] calldata packedData) external onlyOperator returns (uint256) {
    for (uint i = 0; i < packedData.length; i += 1) {
      (uint96 amount, address from) = _unpack(packedData[i]);
      _burn(from, amount);
    }
    return packedData.length;
  }

  /*******************************************************
   * Internal pure
   ********************************************************/

  /**
   * Unpack data to get token amount and wallet address
   * @param value Packed data containing token amount and wallet address
   */
  function _unpack(uint256 value) internal pure returns (uint96, address) {
    return (uint96(value >> 160), address(uint160(value)));
  }
}
