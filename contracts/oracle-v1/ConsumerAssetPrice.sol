// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import './interfaces/IOracleAggregatorV1.sol';
import '../libraries/Bytes.sol';

contract ConsumerAssetPrice is Ownable {
  using Bytes for bytes;

  IOracleAggregatorV1 private oracle;

  event SetOracle(address indexed oldOracle, address indexed newOracle);

  constructor(address oracleAddress) {
    _setOracle(oracleAddress);
  }

  function _setOracle(address newOracle) internal {
    emit SetOracle(address(oracle), newOracle);
    oracle = IOracleAggregatorV1(newOracle);
  }

  /**
   * Get price of an asset
   * @dev Token price will use decimal of the base token
   * Example: BTC/USDT = 50,000 USDT, decimal of USDT is 6 => price = 50,000 * 10^6
   * @param identifier Asset identifier (e.g. BTC/USDT)
   * @return price Price
   */
  function _getPrice(bytes20 identifier) internal view returns (uint256) {
    return uint256(oracle.getLatestData(1, identifier));
  }

  function setOracle(address newOracle) external onlyOwner returns (bool) {
    _setOracle(newOracle);
    return true;
  }
}
