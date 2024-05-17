// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

// An ambition is hiding in the bush
contract TestNFT is ERC721 {
  constructor() ERC721('TestBigO', 'TestO') {}
}
