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
  function batchMint(uint256[] calldata packedData) external onlyOperator returns(uint256) {
    for (uint i = 0; i < packedData.length; i += 1) {
      (uint96 amount, address to) = _unpack(packedData[i]);
      _mint(to, amount);
    }
    return packedData.length;
  }

  // Burn token in packed data
  function batchBurn(uint256[] calldata packedData) external onlyOperator returns(uint256) {
    for (uint i = 0; i < packedData.length; i += 1) {
      (uint96 amount, address from) = _unpack(packedData[i]);
      _burn(from, amount);
    }
    return packedData.length;
  }

  //====================[  Disabled  ]====================

  /**
   * @dev See {IERC20-transfer}. This method is disabled
   *
   * Requirements:
   *
   * - `to` cannot be the zero address.
   * - the caller must have a balance of at least `amount`.
   */
  function transfer(address to, uint256 amount) public override accessDenied returns (bool) {}

  /**
   * @dev See {IERC20-approve}. This method is disabled
   *
   * Requirements:
   *
   * - `to` cannot be the zero address.
   * - the caller must have a balance of at least `amount`.
   */
  function approve(address to, uint256 amount) public override accessDenied returns (bool) {}

  /**
   * @dev See {IERC20-transferFrom}. This method is disabled
   *
   * Requirements:
   * - `from` cannot be the zero address.
   * - `to` cannot be the zero address.
   * - the caller must have a balance of at least `amount`.
   */
  function transferFrom(address from, address to, uint256 amount) public override accessDenied returns (bool) {}

  /**
   * @dev See {IERC20-increaseAllowance}. This method is disabled
   *
   * Requirements:
   * - `from` cannot be the zero address.
   * - the caller must have a balance of at least `amount`.
   */
  function increaseAllowance(address from, uint256 amount) public override accessDenied returns (bool) {}

  /**
   * @dev See {IERC20-decreaseAllowance}. This method is disabled
   *
   * Requirements:
   * - `from` cannot be the zero address.
   * - the caller must have a balance of at least `amount`.
   */
  function decreaseAllowance(address from, uint256 amount) public override accessDenied returns (bool) {}

  //====================[  Public View  ]====================

  /**
   * @dev Returns the decimals places of the token.
   */
  function decimals() public pure override returns (uint8) {
    return 0;
  }
}
