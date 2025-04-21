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
}
