// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '../libraries/Operatable.sol';

contract XOroV2 is ERC1155, Ownable, Operatable {
  // Error: Access denied
  error AccessDenied();
  // Disable token transfer
  modifier accessDenied() {
    revert AccessDenied();
    _;
  }

  // Constructor
  constructor(string memory uri, address[] memory operatorList) ERC1155(uri) {
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

  // Set token metadata uri
  function setURI(string memory uri) external onlyOwner {
    _setURI(uri);
  }

  //====================[  Operator  ]====================

  // Mint token with tokenId and packed data
  function batchMint(uint256 tokenId, uint256[] calldata packedData) external onlyOperator {
    for (uint i = 0; i < packedData.length; i += 1) {
      (uint96 amount, address to) = _unpack(packedData[i]);
      _mint(to, tokenId, amount, '');
    }
  }

  // Burn token with tokenId and packed data
  function batchBurn(uint256 tokenId, uint256[] calldata packedData) external onlyOperator {
    for (uint i = 0; i < packedData.length; i += 1) {
      (uint96 amount, address from) = _unpack(packedData[i]);
      _burn(from, tokenId, amount);
    }
  }

  //====================[  Public  ]====================

  //  Disable safeTransferFrom
  function safeTransferFrom(
    address from,
    address to,
    uint256 id,
    uint256 amount,
    bytes memory data
  ) public override accessDenied {}

  //  Disable safeBatchTransferFrom
  function safeBatchTransferFrom(
    address from,
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) public override accessDenied {}

  // Disable setApprovalForAll
  function setApprovalForAll(address operator, bool approved) public virtual override accessDenied {}
}
