// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

error AccessDenied();

contract XOroV2 is ERC1155, Ownable {
  uint8 public constant TOKEN_ID = 1;

  modifier accessDenied() {
    revert AccessDenied();
    _;
  }

  constructor() ERC1155('https://metadata.orochi.network/x-oro-v2/{id}.json') {}

  function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, TOKEN_ID, amount, '');
  }

  function batchMint(uint256[] calldata packedData) public onlyOwner {
    for (uint i = 0; i < packedData.length; i += 1) {
      (uint96 amount, address beneficiary) = _unpack(packedData[i]);
      mint(beneficiary, amount);
    }
  }

  function balance(address account) public view virtual returns (uint256) {
    return super.balanceOf(account, TOKEN_ID);
  }

  function safeTransferFrom(
    address from,
    address to,
    uint256 id,
    uint256 amount,
    bytes memory data
  ) public override accessDenied {}

  function safeBatchTransferFrom(
    address from,
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) public override accessDenied {}

  function setApprovalForAll(address operator, bool approved) public virtual override accessDenied {}

  function _unpack(uint256 value) internal pure returns (uint96, address) {
    return (uint96(value >> 160), address(uint160(value)));
  }
}
