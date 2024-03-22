// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '../libraries/Bytes.sol';
import 'hardhat/console.sol';

error InvalidLength();

contract Multicast {
  // Using Bytes for bytes
  using Bytes for bytes;

  // Multicast result
  struct MulticastResult {
    bool success;
    bytes result;
  }

  // EVM state
  struct EvmState {
    uint256 blockNumber;
    bytes32 previousBlockHash;
    uint256 chainId;
    uint256 gaslimit;
    uint256 timestamp;
  }

  // Cast to the same target
  function cast(address target, bytes[] calldata inputs) public view returns (MulticastResult[] memory returnData) {
    returnData = new MulticastResult[](inputs.length);
    for (uint256 i = 0; i < inputs.length; i += 1) {
      (bool success, bytes memory ret) = target.staticcall(inputs[i]);
      returnData[i] = MulticastResult({ success: success, result: ret });
    }
  }

  // Cast to multi-target
  function multicast(
    address[] calldata targets,
    bytes[] calldata inputs
  ) public view returns (MulticastResult[] memory returnData) {
    if (targets.length != inputs.length) {
      revert InvalidLength();
    }
    returnData = new MulticastResult[](inputs.length);
    for (uint256 i = 0; i < inputs.length; i += 1) {
      (bool success, bytes memory ret) = targets[i].staticcall(inputs[i]);
      returnData[i] = MulticastResult({ success: success, result: ret });
    }
  }

  // Get EVM state
  function state() public view returns (EvmState memory) {
    return
      EvmState({
        blockNumber: block.number,
        previousBlockHash: blockhash(block.number - 1),
        chainId: block.chainid,
        gaslimit: block.gaslimit,
        timestamp: block.timestamp
      });
  }

  // Get digests of multiple contracts
  function contractDigest(address[] calldata addresses) public view returns (bytes32[] memory digests) {
    digests = new bytes32[](addresses.length);
    for (uint256 i = 0; i < addresses.length; i += 1) {
      digests[i] = addresses[i].codehash;
    }
  }

  // Get native balances of multiple addresses
  function nativeBalance(address[] calldata addresses) public view returns (uint256[] memory balances) {
    balances = new uint256[](addresses.length);
    for (uint256 i = 0; i < addresses.length; i += 1) {
      balances[i] = addresses[i].balance;
    }
  }
}
