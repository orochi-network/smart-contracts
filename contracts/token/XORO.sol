// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '../libraries/Operatable.sol';

contract XORO is ERC20, Ownable, Operatable {
  // Error: Access denied
  error AccessDenied();
  // Disable token transfer
  modifier accessDenied() {
    revert AccessDenied();
    _;
  }

  // Constructor
  constructor(string memory name_, string memory symbol_, address[] memory operatorList) ERC20(name_, symbol_) {
    for (uint256 i = 0; i < operatorList.length; i += 1) {
      _addOperator(operatorList[i]);
    }
  }

  //====================[  Internal  ]====================

  // Unpack data to get token amount and wallet address
  function _unpack(uint256 value) internal pure returns (uint96, address) {
    return (uint96(value >> 160), address(uint160(value)));
  }

  //====================[  Owner  ]====================

  // Add operator
  function addOperator(address newOperator) external onlyOwner returns (bool) {
    return _addOperator(newOperator);
  }

  // Remove operator
  function removeOperator(address oldOperator) external onlyOwner returns (bool) {
    return _removeOperator(oldOperator);
  }

  //====================[  Operator  ]====================

  // Mint token in packed data
  function batchMint(uint256[] calldata packedData) external onlyOperator {
    for (uint i = 0; i < packedData.length; i += 1) {
      (uint96 amount, address to) = _unpack(packedData[i]);
      _mint(to, amount);
    }
  }

  // Burn token in packed data
  function batchBurn(uint256[] calldata packedData) external onlyOperator {
    for (uint i = 0; i < packedData.length; i += 1) {
      (uint96 amount, address from) = _unpack(packedData[i]);
      _burn(from, amount);
    }
  }

  //====================[  Public  ]====================

  //  Disable transfer
  function transfer(address to, uint256 amount) public override accessDenied returns (bool) {}

  //  Disable approve
  function approve(address to, uint256 amount) public override accessDenied returns (bool) {}

  //  Disable transferFrom
  function transferFrom(address from, address to, uint256 amount) public override accessDenied returns (bool) {}

  //  Disable increaseAllowance
  function increaseAllowance(address from, uint256 amount) public override accessDenied returns (bool) {}

  //  Disable decreaseAllowance
  function decreaseAllowance(address from, uint256 amount) public override accessDenied returns (bool) {}

  // Decimals for this token is 0
  function decimals() public view virtual override returns (uint8) {
    return 0;
  }
}
