// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

contract OroNft is ERC721, Ownable {
  using Strings for uint256;

  uint256 private MAX_SUPPLY = 3000;
  uint256 private GUARANTEED_SUPPLY = 1600;
  uint256 private FCFS_SUPPLY = 1400;
  uint256 private totalMint = 0;
  string private baseURI;
  uint256 private fcfsMintPrice = 0.05 ether;
  uint256 private publicMintPrice = 0.1 ether;
  mapping(address => bool) private isGuaranteed;
  mapping(address => bool) private isFcfs;
  mapping(address => bool) private hasMinted;
  mapping(uint256 => string) private tokenURIs;
  mapping(address => uint256) private tokenIndex;
  uint256 private guaranteeAmount = 0;
  uint256 private fcfsAmount = 0;
  uint256 currentPhase = 0;
  uint256 private constant PHASE_GUARATEED = 1;
  uint256 private constant PHASE_FCFS = 2;
  uint256 private constant PHASE_PUBLIC = 3;
  uint256 private constant LOCK_PHASE = 0;
  uint256 private guaranteedMint = 0;
  uint256 private fcfsMint = 0;
  address private protocolWallet;

  // Events
  event NftMint(address indexed minter, uint256 indexed tokenId);
  event GuaranteeAdd(address indexed wallet, uint256 amount);
  event FcfsAdd(address indexed wallet, uint256 amount);
  event BaseURIUpdate(string newDefaultUri);
  
  constructor(
    string memory _baseURI,
    string memory _name,
    string memory _symbol,
    address _protocolWallet
  ) ERC721(_name, _symbol) {
    baseURI = _baseURI;
    protocolWallet = _protocolWallet;
  }

  /*******************************************************
   * Modifiers
   ********************************************************/
  modifier onlyOnce() {
    require(!hasMinted[msg.sender], 'Already minted');
    _;
  }

  /*******************************************************
   * External functions(Owner)
   ********************************************************/

  function protocolWalletSet(address _newWallet) external onlyOwner {
    protocolWallet = _newWallet;
  }

  function currentPhaseSet(uint256 _phase) external onlyOwner {
    require(_phase >= LOCK_PHASE && _phase <= PHASE_PUBLIC, 'Invalid phase');
    currentPhase = _phase;
  }

  function fcfsMintPricesSet(uint256 _price) external onlyOwner {
    fcfsMintPrice = _price;
  }

  function publicMintPriceSet(uint256 _price) external onlyOwner {
    publicMintPrice = _price;
  }

  function guaranteedSupplySet(uint256 _newGuaranteeSupply) external onlyOwner {
    MAX_SUPPLY = _newGuaranteeSupply + FCFS_SUPPLY;
    GUARANTEED_SUPPLY = _newGuaranteeSupply;
  }

  function fcfsSupplySet(uint256 _newFcfsSupply) external onlyOwner {
    FCFS_SUPPLY = _newFcfsSupply;
    MAX_SUPPLY = GUARANTEED_SUPPLY + _newFcfsSupply;
  }

  function guaranteeAdd(address[] calldata wallets) external onlyOwner {
    require(guaranteeAmount + wallets.length <= GUARANTEED_SUPPLY, 'Cannot add more than allowed Guarantee Supply');
    for (uint256 i = 0; i < wallets.length; i += 1) {
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
    for (uint256 i = 0; i < wallets.length; i += 1) {
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

  function withdraw() external onlyOwner {
    payable(protocolWallet).transfer(address(this).balance);
  }

  /*******************************************************
   * External Mint functions (Users)
   ********************************************************/
  function mintOroNft() external onlyOnce {
    require(currentPhase > 0, 'Cannot mint before the sale starts');
    if (currentPhase == PHASE_GUARATEED) {
      require(isGuaranteed[msg.sender], 'Not in Guarantee');
      require(totalMint + 1 <= GUARANTEED_SUPPLY, 'No Guaranteed NFTs left');
      guaranteedMint += 1;
    }
    if (currentPhase == PHASE_FCFS) {
      require(isFcfs[msg.sender], 'Not in FCFS list');
      require(totalMint + 1 <= GUARANTEED_SUPPLY + FCFS_SUPPLY, 'No FCFS NFTs left');
      fcfsMint += 1;
    }

    require(totalMint + 1 <= MAX_SUPPLY, 'No NFTs left');
    _safeMint(msg.sender, totalMint + 1);
    hasMinted[msg.sender] = true;
    tokenIndex[msg.sender] = totalMint + 1;
    emit NftMint(msg.sender, totalMint + 1);
    totalMint += 1;
  }

  /*******************************************************
   * Token URI functions
   ********************************************************/
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
  function guaranteeMintGet() external view returns (uint256) {
    return guaranteedMint;
  }

  function fcfsMintGet() external view returns (uint256) {
    return fcfsMint;
  }

  function publicMintGet() external view returns (uint256) {
    return totalMint - guaranteedMint - fcfsMint;
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

  function totalMintGet() external view returns (uint256) {
    return totalMint;
  }
}
