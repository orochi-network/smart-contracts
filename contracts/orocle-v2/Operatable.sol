// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

error InvalidOperator(address sender);

contract Operatable {
  mapping(address => bool) private operator;

  event AddOperator(address indexed newOperator);
  event RemoveOperator(address indexed OldOperator);

  modifier onlyOperator() {
    if (!operator[msg.sender]) {
      revert InvalidOperator(msg.sender);
    }
    _;
  }

  function _addOperator(address newOperator) internal returns (bool) {
    operator[newOperator] = true;
    emit AddOperator(newOperator);
    return true;
  }

  function _removeOperator(address oldOperator) internal returns (bool) {
    operator[oldOperator] = false;
    emit RemoveOperator(oldOperator);
    return true;
  }

  function _isOperator(address checkAddress) internal view returns (bool) {
    return operator[checkAddress];
  }

  function isOperator(address checkAddress) external view returns (bool) {
    return _isOperator(checkAddress);
  }
}
