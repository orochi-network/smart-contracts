// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import './interfaces/IOroNft.sol';

contract OroNft is IOroNft, ERC721, Ownable {
  using Strings for uint256;

  uint256 private MAX_SUPPLY = 3000;
  uint256 private GUARANTEED_SUPPLY = 1600;
  uint256 private FCFS_SUPPLY = 1400;
  uint256 private nextTokenId = 1;
  string private baseURI;
  uint256 private guaranteedStartTime;
  uint256 private guaranteedEndTime;
  uint256 private fcfsStartTime;
  uint256 private fcfsEndTime;
  uint256 private publicStartTime;
  uint256 private fcfsMintPrice = 0.05 ether;
  uint256 private publicMintPrice = 0.1 ether;
  mapping(address => bool) private isGuaranteed;
  mapping(address => bool) private isFcfs;
  mapping(address => bool) private hasMinted;
  mapping(uint256 => string) private tokenURIs;
  mapping(address => uint256) private tokenIndex;
  uint256 private guaranteeAmount = 0;
  uint256 private fcfsAmount = 0;

  constructor(
    string memory _baseURI,
    uint256 _guaranteedStartTime,
    uint256 _guaranteedEndTime,
    uint256 _fcfsStartTime,
    uint256 _fcfsEndTime,
    uint256 _publicStartTime,
    string memory _name,
    string memory _symbol
  ) ERC721(_name, _symbol) {
    require(_guaranteedStartTime >= block.timestamp, 'Guaranteed start must not be less than current time');
    require(_guaranteedEndTime >= block.timestamp, 'Guaranteed end must not be less than current time');
    require(_fcfsStartTime >= block.timestamp, 'FCFS start must not be less than current time');
    require(_fcfsEndTime >= block.timestamp, 'FCFS end must not be less than current time');
    require(_publicStartTime >= block.timestamp, 'Public start must not be less than current time');

    baseURI = _baseURI;
    guaranteedStartTime = _guaranteedStartTime;
    guaranteedEndTime = _guaranteedEndTime;
    fcfsStartTime = _fcfsStartTime;
    fcfsEndTime = _fcfsEndTime;
    publicStartTime = _publicStartTime;
  }

  /*******************************************************
   * Modifiers
   ********************************************************/
  modifier onlyOnce() {
    require(!hasMinted[msg.sender], 'Already minted');
    _;
  }

  modifier isGuaranteedPhase() {
    require(block.timestamp >= guaranteedStartTime && block.timestamp <= guaranteedEndTime, 'Not in Guaranteed Phase');
    _;
  }

  modifier isFcfsPhase() {
    require(block.timestamp >= fcfsStartTime && block.timestamp <= fcfsEndTime, 'Not in FCFS Phase');
    _;
  }

  modifier isPublicPhase() {
    require(block.timestamp >= publicStartTime, 'Not in Public Phase');
    _;
  }

  /*******************************************************
   * External functions(Owner)
   ********************************************************/
  function salePhaseSetTimes(
    uint256 _guaranteedStartTime,
    uint256 _guaranteedEndTime,
    uint256 _fcfsStartTime,
    uint256 _fcfsEndTime,
    uint256 _publicStartTime
  ) external onlyOwner {
    // Check ordering among phases (basic logic remains)
    require(_guaranteedStartTime < _guaranteedEndTime, 'guaranteedStart < guaranteedEnd required');
    require(_guaranteedEndTime < _fcfsStartTime, 'guaranteedEnd < fcfsStart required');
    require(_fcfsStartTime < _fcfsEndTime, 'fcfsStart < fcfsEnd required');
    require(_fcfsEndTime < _publicStartTime, 'fcfsEnd < publicStart required');

    uint256 currentTime = block.timestamp;

    // Guaranteed Phase restrictions
    // If we are currently in guaranteed phase or have passed guaranteedStart, cannot change guaranteedStart
    if (currentTime >= guaranteedStartTime) {
      require(
        _guaranteedStartTime == guaranteedStartTime,
        'Cannot modify guaranteedStart because Guaranteed has begun'
      );
    }
    // If we have passed guaranteedEndTime, cannot change either guaranteedStart or guaranteedEnd
    if (currentTime > guaranteedEndTime) {
      require(
        _guaranteedStartTime == guaranteedStartTime && _guaranteedEndTime == guaranteedEndTime,
        'Cannot modify Guaranteed times after Guaranteed phase finished'
      );
    }

    // FCFS Phase restrictions
    // If we are currently in FCFS or we have passed fcfsStart, cannot change fcfsStart
    if (currentTime >= fcfsStartTime) {
      require(_fcfsStartTime == fcfsStartTime, 'Cannot modify fcfsStart because FCFS has begun');
    }
    // If we have passed fcfsEndTime, cannot change FCFS start or end
    if (currentTime > fcfsEndTime) {
      require(
        _fcfsStartTime == fcfsStartTime && _fcfsEndTime == fcfsEndTime,
        'Cannot modify FCFS times after FCFS phase finished'
      );
    }

    // Public Phase restrictions
    // If we are currently in or past public start, cannot change publicStart
    if (currentTime >= publicStartTime) {
      require(_publicStartTime == publicStartTime, 'Cannot modify publicStart because Public has begun');
    }

    // Finally, if all checks are passed, update storage
    guaranteedStartTime = _guaranteedStartTime;
    guaranteedEndTime = _guaranteedEndTime;
    fcfsStartTime = _fcfsStartTime;
    fcfsEndTime = _fcfsEndTime;
    publicStartTime = _publicStartTime;
  }

  function fcfsMintPricesSet(uint256 _price) external onlyOwner {
    fcfsMintPrice = _price;
  }

  function publicMintPriceSet(uint256 _price) external onlyOwner {
    publicMintPrice = _price;
  }

  function guaranteedSupplySet(uint256 _newGuaranteeSupply) external onlyOwner {
    require(block.timestamp <= guaranteedEndTime, 'Cannot change Guaranteed supply after the phase ends');
    if (block.timestamp > guaranteedStartTime && block.timestamp < guaranteedEndTime) {
      require(_newGuaranteeSupply >= nextTokenId - 1, 'New Guaranteed supply must be greater than the current supply');
    }
    require(_newGuaranteeSupply > GUARANTEED_SUPPLY, 'New Guaranteed supply must be greater than the current supply');
    MAX_SUPPLY = _newGuaranteeSupply + FCFS_SUPPLY;
    GUARANTEED_SUPPLY = _newGuaranteeSupply;
  }

  function fcfsSupplySet(uint256 _newFcfsSupply) external onlyOwner {
    FCFS_SUPPLY = _newFcfsSupply;
    MAX_SUPPLY = GUARANTEED_SUPPLY + _newFcfsSupply;
  }

  function guaranteeAdd(address[] calldata wallets) external onlyOwner {
    require(guaranteeAmount + wallets.length <= GUARANTEED_SUPPLY, 'Cannot add more than allowed Guarantee Supply');
    for (uint256 i = 0; i < wallets.length; i++) {
      if (!isGuaranteed[wallets[i]]) {
        isGuaranteed[wallets[i]] = true;
        guaranteeAmount += 1;
        emit GuaranteeAdd(wallets[i], guaranteeAmount);
      }
    }
  }

  function guaranteeRemove(address wallet) external onlyOwner {
    require(isGuaranteed[wallet], 'Address is not in Guarantee');
    isGuaranteed[wallet] = false;
    guaranteeAmount -= 1;
  }

  function fcfsAdd(address[] calldata wallets) external onlyOwner {
    for (uint256 i = 0; i < wallets.length; i++) {
      if (!isFcfs[wallets[i]]) {
        isFcfs[wallets[i]] = true;
        fcfsAmount += 1;
        emit FcfsAdd(wallets[i], fcfsAmount);
      }
    }
  }

  function fcfsRemove(address wallet) external onlyOwner {
    require(isFcfs[wallet], 'Address is not in FCFS list');
    isFcfs[wallet] = false;
    fcfsAmount -= 1;
  }

  // Some user might send ETH to the contract by mistake
  function withdraw() external onlyOwner {
    payable(owner()).transfer(address(this).balance);
  }

  /*******************************************************
   * External Mint functions (Users)
   ********************************************************/
  function guaranteedMint() external isGuaranteedPhase onlyOnce {
    require(isGuaranteed[msg.sender], 'Not in Guarantee');
    require(nextTokenId <= GUARANTEED_SUPPLY, 'No Guaranteed NFTs left');
    _safeMint(msg.sender, nextTokenId);
    hasMinted[msg.sender] = true;
    tokenIndex[msg.sender] = nextTokenId;
    emit NftMint(msg.sender, nextTokenId);
    nextTokenId += 1;
  }

  function fcfsMint() external payable isFcfsPhase onlyOnce {
    require(isFcfs[msg.sender], 'Not in FCFS list');
    require(nextTokenId <= GUARANTEED_SUPPLY + FCFS_SUPPLY, 'No FCFS NFTs left');
    require(msg.value >= fcfsMintPrice, 'Insufficient ETH');
    _safeMint(msg.sender, nextTokenId);
    hasMinted[msg.sender] = true;
    tokenIndex[msg.sender] = nextTokenId;
    emit NftMint(msg.sender, nextTokenId);
    nextTokenId += 1;
  }

  function publicMint() external payable isPublicPhase onlyOnce {
    require(nextTokenId <= MAX_SUPPLY, 'No NFTs left');
    require(msg.value >= publicMintPrice, 'Insufficient ETH');
    _safeMint(msg.sender, nextTokenId);
    hasMinted[msg.sender] = true;
    tokenIndex[msg.sender] = nextTokenId;
    emit NftMint(msg.sender, nextTokenId);
    nextTokenId += 1;
  }

  /*******************************************************
   * Token URI functions
   ********************************************************/
  function tokenURISet(uint256 tokenId, string memory uri) external onlyOwner {
    tokenURIs[tokenId] = uri;
  }

  function baseURISet(string memory _newBaseURI) external onlyOwner {
    baseURI = _newBaseURI;
    emit BaseURIUpdate(_newBaseURI);
  }

  function tokenURI(uint256 tokenId) public view override returns (string memory) {
    require(_exists(tokenId), 'Token does not exist');
    if (bytes(tokenURIs[tokenId]).length > 0) {
      return tokenURIs[tokenId];
    }
    return string.concat(baseURI, '/', tokenId.toString());
  }

  /*******************************************************
   * External view section
   ********************************************************/
  function guaranteedStartTimeGet() external view returns (uint256) {
    return guaranteedStartTime;
  }

  function guaranteedEndTimeGet() external view returns (uint256) {
    return guaranteedEndTime;
  }

  function fcfsStartTimeGet() external view returns (uint256) {
    return fcfsStartTime;
  }

  function fcfsEndTimeGet() external view returns (uint256) {
    return fcfsEndTime;
  }

  function publicStartTimeGet() external view returns (uint256) {
    return publicStartTime;
  }

  function fcfsMintPriceGet() external view returns (uint256) {
    return fcfsMintPrice;
  }

  function publicMintPriceGet() external view returns (uint256) {
    return publicMintPrice;
  }

  function maxSupplyGet() external view returns (uint256) {
    return MAX_SUPPLY;
  }

  function guaranteedSupplyGet() external view returns (uint256) {
    return GUARANTEED_SUPPLY;
  }

  function fcfsSupplyGet() external view returns (uint256) {
    return FCFS_SUPPLY;
  }

  function tokenIndexGet(address owner) external view returns (uint256) {
    return tokenIndex[owner];
  }

  function guaranteeAmountGet() external view returns (uint256) {
    return guaranteeAmount;
  }

  function fcfsAmountGet() external view returns (uint256) {
    return fcfsAmount;
  }
}
