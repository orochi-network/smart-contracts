// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

contract TestMulticast {
  mapping(string => uint256) private _storage;

  function set(string calldata key, uint256 val) public {
    _storage[key] = val;
  }

  function get(string calldata key) external view returns (uint256) {
    return _storage[key];
  }
}
