// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import './interfaces/IOracleAggregatorV1.sol';

error OutOfRange();

contract AssetPrice is Ownable {
  IOracleAggregatorV1 private oracle;

  event SetOracle(address indexed oldOracle, address indexed newOracle);

  constructor(address oracleAddress) {
    _setOracle(oracleAddress);
  }

  function _setOracle(address newOracle) internal {
    emit SetOracle(address(oracle), newOracle);
    oracle = IOracleAggregatorV1(newOracle);
  }

  function _readUint256(bytes memory input, uint256 offset) internal pure returns (uint256 result) {
    if (offset + 32 > input.length) {
      revert OutOfRange();
    }
    assembly {
      result := mload(add(add(input, 0x20), offset))
    }
  }

  /**
   * Get price of an asset
   * @dev Token price will use decimal of the base token
   * Example: BTC/USDT = 50,000 USDT, decimal of USDT is 6 => price = 50,000 * 10^6
   * @param identifier Asset identifier (e.g. BTC/USDT)
   * @return price Price
   */
  function _getPrice(bytes20 identifier) internal view returns (uint256) {
    bytes memory data = oracle.getLatestData(1, identifier);
    return _readUint256(data, 0);
  }

  function setOracle(address newOracle) external onlyOwner returns (bool) {
    _setOracle(newOracle);
    return true;
  }
}
