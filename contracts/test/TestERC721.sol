// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

// An ambition is hiding in the bush
contract TestERC721 is ERC721, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor() ERC721('TestBigO', 'TestO') {}

  function mintNFT(address recipient) public returns (uint256) onlyOwner {
    _tokenIds.increment();
    uint256 newTokenId = _tokenIds.current();
    _mint(recipient, newTokenId);
    return newTokenId;
  }
}
