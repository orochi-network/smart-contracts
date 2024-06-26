// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract XOroV2 is ERC1155, Ownable {
  uint8 public constant TOKEN_ID = 1;
  constructor() ERC1155('https://api.example.com/metadata/{id}.json') {}

  function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, TOKEN_ID, amount, '');
  }

  function balance(address account) public view virtual returns (uint256) {
    return super.balanceOf(account, TOKEN_ID);
  }

  function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) public override {
    require(false, 'Transfer not allowed');
    return super.safeTransferFrom(from, to, id, amount, data);
  }

  function safeBatchTransferFrom(
    address from,
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) public override {
    require(false, 'Transfer not allowed');
    return super.safeBatchTransferFrom(from, to, ids, amounts, data);
  }

  function setApprovalForAll(address operator, bool approved) public virtual override {
    require(false, 'Transfer not allowed');
    return super.setApprovalForAll(operator, approved);
  }
}
