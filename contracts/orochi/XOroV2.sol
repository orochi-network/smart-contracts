// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '../libraries/Operatable.sol';

error AccessDenied();

contract XOroV2 is ERC1155, Ownable, Operatable {
  modifier accessDenied() {
    revert AccessDenied();
    _;
  }

  constructor(address[] memory operatorList) ERC1155('https://metadata.orochi.network/x-oro-v2/{id}.json') {
    for (uint256 i = 0; i < operatorList.length; i += 1) {
      _addOperator(operatorList[i]);
    }
  }

  //====================[  Internal  ]====================

  function _unpack(uint256 value) internal pure returns (uint96, address) {
    return (uint96(value >> 160), address(uint160(value)));
  }

  //====================[  Owner  ]====================

  function addOperator(address newOperator) external onlyOwner returns (bool) {
    return _addOperator(newOperator);
  }

  function removeOperator(address oldOperator) external onlyOwner returns (bool) {
    return _removeOperator(oldOperator);
  }

  //====================[  Operator  ]====================

  function batchMint(uint256 tokenId, uint256[] calldata packedData) external onlyOperator {
    for (uint i = 0; i < packedData.length; i += 1) {
      (uint96 amount, address to) = _unpack(packedData[i]);
      _mint(to, tokenId, amount, '');
    }
  }

  function batchBurn(uint256 tokenId, uint256[] calldata packedData) external onlyOperator {
    for (uint i = 0; i < packedData.length; i += 1) {
      (uint96 amount, address from) = _unpack(packedData[i]);
      _burn(from, tokenId, amount);
    }
  }

  //====================[  Public  ]====================

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
}
