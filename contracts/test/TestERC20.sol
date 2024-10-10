// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract TestERC20 is ERC20, Ownable {
  // Constructor
  constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {}

  //====================[  Internal  ]====================

  // Unpack data to get token amount and wallet address
  function _unpack(uint256 value) internal pure returns (uint96, address) {
    return (uint96(value >> 160), address(uint160(value)));
  }

  //====================[  Owner  ]====================

  // Mint token in packed data
  function batchMint(uint256[] calldata packedData) external onlyOwner returns (uint256) {
    for (uint i = 0; i < packedData.length; i += 1) {
      (uint96 amount, address to) = _unpack(packedData[i]);
      _mint(to, amount);
    }
    return packedData.length;
  }

  // Burn token in packed data
  function batchBurn(uint256[] calldata packedData) external onlyOwner returns (uint256) {
    for (uint i = 0; i < packedData.length; i += 1) {
      (uint96 amount, address from) = _unpack(packedData[i]);
      _burn(from, amount);
    }
    return packedData.length;
  }
}
