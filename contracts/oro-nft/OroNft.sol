// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract OroNft is ERC721, Ownable {
  uint256 private MAX_SUPPLY = 3000;
  uint256 private GUARANTEED_SUPPLY = 1600;
  uint256 private FCFS_SUPPLY = 1400;
  uint256 private nextTokenId = 1;
  string private defaultURI;

  uint256 private guaranteedStartTime;
  uint256 private guaranteedEndTime;
  uint256 private fcfsStartTime;
  uint256 private fcfsEndTime;
  uint256 private publicStartTime;

  uint256 private fcfsMintPrice = 0.05 ether;
  uint256 private publicMintPrice = 0.1 ether;

  mapping(address => bool) private isGuaranteed;
  mapping(address => bool) private hasMinted;
  mapping(uint256 => string) private tokenURIs;
  mapping(address => uint256) private tokenIndex;
  uint256 private guaranteeAmount = 0;

  event Minted(address indexed minter, uint256 tokenId);
  event SalePhaseChanged(string newPhase);
  event GuaranteeUpdated(address indexed wallet, uint256 amount);
  event DefaultURIUpdated(string newDefaultUri);

  constructor(
    string memory _defaultURI,
    uint256 _guaranteedStartTime,
    uint256 _guaranteedEndTime,
    uint256 _fcfsStartTime,
    uint256 _fcfsEndTime,
    uint256 _publicStartTime
  ) ERC721('OroNft', 'ORO') {
    defaultURI = _defaultURI;
    guaranteedStartTime = _guaranteedStartTime;
    guaranteedEndTime = _guaranteedEndTime;
    fcfsStartTime = _fcfsStartTime;
    fcfsEndTime = _fcfsEndTime;
    publicStartTime = _publicStartTime;
  }

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

  function setSalePhaseTimes(
    uint256 _guaranteedStartTime,
    uint256 _guaranteedEndTime,
    uint256 _fcfsStartTime,
    uint256 _fcfsEndTime,
    uint256 _publicStartTime
  ) external onlyOwner {
    require(_guaranteedStartTime < _guaranteedEndTime, "Guarantee start time must be before end time");
    require(_guaranteedEndTime < _fcfsStartTime, "Guarantee phase must end before FCFS phase starts");
    require(_fcfsStartTime < _fcfsEndTime, "FCFS start time must be before end time");
    require(_fcfsEndTime < _publicStartTime, "FCFS phase must end before Public phase starts");
    
    guaranteedStartTime = _guaranteedStartTime;
    guaranteedEndTime = _guaranteedEndTime;
    fcfsStartTime = _fcfsStartTime;
    fcfsEndTime = _fcfsEndTime;
    publicStartTime = _publicStartTime;
  }

  function setFcfsMintPrice(uint256 _price) external onlyOwner {
    fcfsMintPrice = _price;
  }

  function setPublicMintPrice(uint256 _price) external onlyOwner {
    publicMintPrice = _price;
  }

  function setGuaranteedSupply(uint256 _newGuaranteeSupply) external onlyOwner {
    require(block.timestamp <= guaranteedEndTime, 'Cannot change Guaranteed supply after the phase ends');
    require(_newGuaranteeSupply > GUARANTEED_SUPPLY, 'New Guaranteed supply must be greater than the current supply');
    MAX_SUPPLY = _newGuaranteeSupply + FCFS_SUPPLY;
    GUARANTEED_SUPPLY = _newGuaranteeSupply;
  }

  function setFcfsSupply(uint256 _newFcfsSupply) external onlyOwner {
    FCFS_SUPPLY = _newFcfsSupply;
    MAX_SUPPLY = GUARANTEED_SUPPLY + _newFcfsSupply;
  }

  function addGuarantee(address[] calldata wallets) external onlyOwner {
    require(guaranteeAmount + wallets.length <= GUARANTEED_SUPPLY, 'Cannot add more than allowed Guarantee Supply');
    for (uint256 i = 0; i < wallets.length; i++) {
      if (!isGuaranteed[wallets[i]]) {
        isGuaranteed[wallets[i]] = true;
        guaranteeAmount += 1;
        emit GuaranteeUpdated(wallets[i], guaranteeAmount);
      }
    }
  }

  function removeGuarantee(address wallet) external onlyOwner {
    require(isGuaranteed[wallet], 'Address is not in Guarantee');
    isGuaranteed[wallet] = false;
    guaranteeAmount -= 1;
  }

  function guaranteedMint() external isGuaranteedPhase onlyOnce {
    require(isGuaranteed[msg.sender], 'Not in Guarantee');
    require(nextTokenId <= GUARANTEED_SUPPLY, 'No Guaranteed NFTs left');
    _safeMint(msg.sender, nextTokenId);
    hasMinted[msg.sender] = true;
    tokenIndex[msg.sender] = nextTokenId;
    emit Minted(msg.sender, nextTokenId);
    nextTokenId += 1;
  }

  function fcfsMint() external payable isFcfsPhase onlyOnce {
    require(nextTokenId <= GUARANTEED_SUPPLY + FCFS_SUPPLY, 'No FCFS NFTs left');
    require(msg.value >= fcfsMintPrice, 'Insufficient ETH');
    _safeMint(msg.sender, nextTokenId);
    hasMinted[msg.sender] = true;
    tokenIndex[msg.sender] = nextTokenId;
    emit Minted(msg.sender, nextTokenId);
    nextTokenId += 1;
  }

  function publicMint() external payable isPublicPhase onlyOnce {
    require(nextTokenId <= MAX_SUPPLY, 'No NFTs left');
    require(msg.value >= publicMintPrice, 'Insufficient ETH');
    _safeMint(msg.sender, nextTokenId);
    hasMinted[msg.sender] = true;
    tokenIndex[msg.sender] = nextTokenId;
    emit Minted(msg.sender, nextTokenId);
    nextTokenId += 1;
  }

  function setDefaultURI(string memory _newDefaultURI) external onlyOwner {
    defaultURI = _newDefaultURI;
    emit DefaultURIUpdated(_newDefaultURI);
  }

  function setTokenURI(uint256 tokenId, string memory uri) external onlyOwner {
    require(_exists(tokenId), 'Token does not exist');
    tokenURIs[tokenId] = uri;
  }

  function tokenURI(uint256 tokenId) public view override returns (string memory) {
    require(_exists(tokenId), 'Token does not exist');
    return bytes(tokenURIs[tokenId]).length > 0 ? tokenURIs[tokenId] : defaultURI;
  }

  function withdraw() external onlyOwner {
    payable(owner()).transfer(address(this).balance);
  }

  function getGuaranteedStartTime() external view returns (uint256) {
    return guaranteedStartTime;
  }

  function getGuaranteedEndTime() external view returns (uint256) {
    return guaranteedEndTime;
  }

  function getFcfsStartTime() external view returns (uint256) {
    return fcfsStartTime;
  }

  function getFcfsEndTime() external view returns (uint256) {
    return fcfsEndTime;
  }

  function getPublicStartTime() external view returns (uint256) {
    return publicStartTime;
  }

  function getFcfsMintPrice() external view returns (uint256) {
    return fcfsMintPrice;
  }

  function getPublicMintPrice() external view returns (uint256) {
    return publicMintPrice;
  }

  function getMaxSupply() external view returns (uint256) {
    return MAX_SUPPLY;
  }

  function getGuaranteedSupply() external view returns (uint256) {
    return GUARANTEED_SUPPLY;
  }

  function getFcfsSupply() external view returns (uint256) {
    return FCFS_SUPPLY;
  }

  function getTokenIndex(address owner) external view returns (uint256) {
    return tokenIndex[owner];
  }

  function getGuaranteeAmount() external view returns (uint256) {
    return guaranteeAmount;
  }
}
