// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IOroNft {
    // Events
    event NftMint(address indexed minter, uint256 indexed tokenId);
    event GuaranteeAdd(address indexed wallet, uint256 amount);
    event FcfsAdd(address indexed wallet, uint256 amount);
    event BaseURIUpdate(string newDefaultUri);

    /**
     * Set sale phase times
     * @param _guaranteedStartTime uint256 - Start time of guaranteed phase
     * @param _guaranteedEndTime uint256 - End time of guaranteed phase
     * @param _fcfsStartTime uint256 - Start time of FCFS phase
     * @param _fcfsEndTime uint256 - End time of FCFS phase
     * @param _publicStartTime uint256 - Start time of public phase
     */
    function salePhaseSetTimes(
        uint256 _guaranteedStartTime,
        uint256 _guaranteedEndTime,
        uint256 _fcfsStartTime,
        uint256 _fcfsEndTime,
        uint256 _publicStartTime
    ) external;

    /**
     * Set FCFS mint price
     * @param _price uint256 - New FCFS mint price
     */
    function fcfsMintPricesSet(uint256 _price) external;

    /**
     * Set public mint price
     * @param _price uint256 - New public mint price
     */
    function publicMintPriceSet(uint256 _price) external;

    /**
     * Set guaranteed supply
     * @param _newGuaranteeSupply uint256 - New guaranteed supply amount
     */
    function guaranteedSupplySet(uint256 _newGuaranteeSupply) external;

    /**
     * Set FCFS supply
     * @param _newFcfsSupply uint256 - New FCFS supply amount
     */
    function fcfsSupplySet(uint256 _newFcfsSupply) external;

    /**
     * Add addresses to the guaranteed mint list
     * @param wallets address[] - List of addresses to be added
     * Emits event GuaranteeAdd for each address
     */
    function guaranteeAdd(address[] calldata wallets) external;

    /**
     * Remove an address from the guaranteed list
     * @param wallet address - Address to be removed
     */
    function guaranteeRemove(address wallet) external;

    /**
     * Add addresses to the FCFS mint list
     * @param wallets address[] - List of addresses to be added
     * Emits event FcfsAdd for each address
     */
    function fcfsAdd(address[] calldata wallets) external;

    /**
     * Remove an address from the FCFS list
     * @param wallet address - Address to be removed
     */
    function fcfsRemove(address wallet) external;

    /**
     * Withdraw ETH from the contract
     */
    function withdraw() external;

    /**
     * Mint NFT in Guaranteed phase
     */
    function guaranteedMint() external;

    /**
     * Mint NFT in FCFS phase
     */
    function fcfsMint() external payable;

    /**
     * Mint NFT in Public phase
     */
    function publicMint() external payable;

    /**
     * Set token URI
     * @param tokenId uint256 - ID of the token
     * @param uri string - New token URI
     */
    function tokenURISet(uint256 tokenId, string memory uri) external;

    /**
     * Update the base URI for token metadata
     * @param _newBaseURI string - The new base URI
     * Emits event BaseURIUpdate with the new URI
     */
    function baseURISet(string memory _newBaseURI) external;


    /**
     * Get guaranteed start time
     * @return uint256 - Guaranteed start time
     */
    function guaranteedStartTimeGet() external view returns (uint256);

    /**
     * Get guaranteed end time
     * @return uint256 - Guaranteed end time
     */
    function guaranteedEndTimeGet() external view returns (uint256);

    /**
     * Get FCFS start time
     * @return uint256 - FCFS start time
     */
    function fcfsStartTimeGet() external view returns (uint256);

    /**
     * Get FCFS end time
     * @return uint256 - FCFS end time
     */
    function fcfsEndTimeGet() external view returns (uint256);

    /**
     * Get public start time
     * @return uint256 - Public start time
     */
    function publicStartTimeGet() external view returns (uint256);

    /**
     * Get FCFS mint price
     * @return uint256 - FCFS mint price
     */
    function fcfsMintPriceGet() external view returns (uint256);

    /**
     * Get public mint price
     * @return uint256 - Public mint price
     */
    function publicMintPriceGet() external view returns (uint256);

    /**
     * Get max supply
     * @return uint256 - Maximum NFT supply
     */
    function maxSupplyGet() external view returns (uint256);

    /**
     * Get guaranteed supply
     * @return uint256 - Guaranteed supply amount
     */
    function guaranteedSupplyGet() external view returns (uint256);

    /**
     * Get FCFS supply
     * @return uint256 - FCFS supply amount
     */
    function fcfsSupplyGet() external view returns (uint256);

    /**
     * Get token index by owner
     * @param owner address - Wallet address
     * @return uint256 - Token index owned by the wallet
     */
    function tokenIndexGet(address owner) external view returns (uint256);

    /**
     * Get guarantee amount
     * @return uint256 - Total guaranteed amount
     */
    function guaranteeAmountGet() external view returns (uint256);

    /**
     * Get FCFS amount
     * @return uint256 - Total FCFS amount
     */
    function fcfsAmountGet() external view returns (uint256);
}