// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

error InvalidOperator(address sender, address operator);

contract Operatable {
  address private operator;

  event SetOperator(address indexed odlOperator, address indexed newOperator);

  modifier onlyOperator() {
    if (msg.sender != operator) {
      revert InvalidOperator(msg.sender, operator);
    }
    _;
  }

  function _getOperator() internal view returns (address) {
    return operator;
  }

  function _setOperator(address newOperator) internal {
    emit SetOperator(operator, newOperator);
    operator = newOperator;
  }

  function getOperator() external view returns (address) {
    return _getOperator();
  }
}
