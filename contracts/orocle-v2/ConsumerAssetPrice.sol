// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import './interfaces/IOrocleAggregatorV2.sol';

contract ConsumerAssetPrice is Ownable {
  IOrocleAggregatorV2 private oracle;

  event SetOracle(address indexed oldOracle, address indexed newOracle);

  constructor(address oracleAddress) {
    _setOracle(oracleAddress);
  }

  function _setOracle(address newOracle) internal {
    emit SetOracle(address(oracle), newOracle);
    oracle = IOrocleAggregatorV2(newOracle);
  }

  /**
   * Get price of an asset based USD
   * @dev Token price will use 18 decimal for all token
   * @param identifier Asset identifier (e.g. BTC, ETH, USDT)
   * @return price Price
   */
  function _getPrice(bytes20 identifier) internal view returns (uint256) {
    return uint256(oracle.getLatestData(1, identifier));
  }

  /**
   * Get price of a pair
   * @dev Token price will use 18 decimal for all token
   * (e.g. BTC/ETH => srcToken='BTC' dstToken='src')
   * @param srcToken Asset identifier of source
   * @param dstToken Asset identifier of destination
   * @return price Price
   */
  function _getPriceOfPair(bytes20 srcToken, bytes20 dstToken) internal view returns (uint256) {
    return (_getPrice(srcToken) * 10 ** 18) / (_getPrice(dstToken));
  }

  /**
   * Set new oracle
   */
  function setOracle(address newOracle) external onlyOwner returns (bool) {
    _setOracle(newOracle);
    return true;
  }
}
