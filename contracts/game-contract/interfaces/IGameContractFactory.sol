// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IGameContractFactory {
  // Errors
  error InvalidAddress();
  error UnableToInitNewContract();

  // Events
  event GameContractDeploy(address indexed contractAddress, address indexed ownerAddress, bytes32 indexed salt);

  event UpgradeImplementation(
    address indexed actor,
    address indexed oldImplementation,
    address indexed upgradeImplementation
  );

  /**
   * Change contract address to clone
   * @param newImplementation address - New implementation to clone
   * Emits event UpgradeImplementation with actor, oldImplementation and upgradeImplementation
   */
  function upgradeImplementation(address newImplementation) external returns (bool);

  /**
   * Add new User to list, only owner contract can transact this function
   * @param userListToAdd address[] - List of User addresses to add
   * Emits event UserListAdd with total User and block timestamp
   */
  function userListAdd(address[] memory userListToAdd) external;

  /**
   * Remove old User from list, only owner contract can transact this function
   * @param userListToRemove address[] - List of User addresses to remove
   * Emits event UserListRemove with total User and block timestamp
   */
  function userListRemove(address[] memory userListToRemove) external;

  /**
   * Use to deploy game contract
   * @param gameContractOwner address - Owner address of game contract deployed
   * @param salt uint92 - Salt to set up deploy smart contract address
   * Emits event GameContractDeploy with owner address and game contract address
   */
  function deployGameContract(address gameContractOwner, uint96 salt) external returns (address);

  /**
   * Use to deploy game contract
   * @param gameContractAddress address - Address of game contract deployed you want to check
   * @return bool - Returns true if contract existed
   */
  function isGameContractExist(address gameContractAddress) external view returns (bool);

  /**
   * Use to predict address before deploy
   * @param creatorAddress address - Address of deployer game contract
   * @param salt uint92 - Salt to set up deploy smart contract address
   * @return bool[] - Returns an array of booleans corresponding to each address status
   */
  function predictWalletAddress(uint96 salt, address creatorAddress) external view returns (address);

  /**
   * Use to generate salt form address and uint92
   * @param creatorAddress address - Address of deployer game contract
   * @param salt uint92 - Salt to set up deploy smart contract address
   * @return uint256  - Return a salt combine from address and uint92
   */
  function packingSalt(uint96 salt, address creatorAddress) external pure returns (uint256);

  /**
   * Check status of each address in the list
   * @param userListToCheck address[] - List of addresses to check
   * @return bool[] - Returns an array of booleans corresponding to each address status
   */
  function userListCheck(address[] memory userListToCheck) external view returns (bool[] memory);

  /**
   * Check status of a specific address
   * @param userToCheck address - The address to check
   * @return bool - Returns the status of the given address
   */
  function userCheck(address userToCheck) external view returns (bool);

  /**
   * Show the total number of users added
   * @return uint256 - The total number of users added to the list
   */
  function userTotal() external view returns (uint256);
}
