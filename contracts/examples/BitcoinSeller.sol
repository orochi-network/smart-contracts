// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import '../oracle-v1/ConsumerAssetPrice.sol';

contract BitcoinSeller is ConsumerAssetPrice {
  constructor(address provider) ConsumerAssetPrice(provider) {}

  function estimate(uint256 amount) external view returns (uint256 total) {
    total = _getPrice('BTC') * amount;
  }

  function ethOverBtc() external view returns (uint256 price) {
    price = _getPriceOfPair('ETH', 'BTC');
  }
}
