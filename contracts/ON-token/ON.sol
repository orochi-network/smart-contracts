// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import { ECDSA } from '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '../orand-v3/interfaces/IOrandConsumerV3.sol';
import '../orocle-v2/interfaces/IOrocleAggregatorV2.sol';

contract ON is ERC20, Ownable, ReentrancyGuard {
  event claimToken(bytes indexed signature, address indexed to, uint256 indexed amount);

  uint64 private startTimeRestart = 0;
  uint256 private limitPerDay = 0;
  uint256 private todayClaimed = 0;
  address private onProverSigner = 0x73100880b1B6F0De121CAc27C418BF77183e3768;

  constructor() ERC20('ON', 'ON') {}

  modifier onlyOrandProvider() {
    require(msg.sender == onProverSigner, 'Invalid provider');
    _;
  }

  function mint(address to, uint256 amount) external onlyOwner {
    _mint(to, amount);
  }

  function _isOnProver(address signer) internal view returns (bool) {
    return signer == onProverSigner;
  }

  function claim(bytes memory signature, address to, uint256 amount) external nonReentrant {
    address signer = ECDSA.recover(ECDSA.toEthSignedMessageHash(keccak256(abi.encode(to, amount))), signature);
    require(_isOnProver(signer), 'Invalid signature');

    transfer(to, amount);
    emit claimToken(signature, to, amount);
  }

  function setOnProverSigner(address newSigner) external onlyOwner {
    onProverSigner = newSigner;
  }

  function setLimitPerDay(uint256 newLimit) external onlyOwner {
    limitPerDay = newLimit;
  }

  function setStartTimeRestart(uint64 newStartTime) external onlyOwner {
    startTimeRestart = newStartTime;
  }

  function dailyClaim(bytes memory signature, address to, uint256 amount) external nonReentrant(uint256) {
    require (todayClaimed == limitPerDay, 'Limit per day reached');
    
    address signer = ECDSA.recover(ECDSA.toEthSignedMessageHash(keccak256(abi.encode(to, amount))), signature);
    require(_isOnProver(signer), 'Invalid signature');

  }
}
