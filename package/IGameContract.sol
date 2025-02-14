// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IGameContract {
  // init once time error
  error OnlyAbleToInitOnce();

  // Events
  event QuestCompleteDaily(address indexed user, bytes32 indexed questName);
  event QuestCompleteSocial(address indexed user, bytes32 indexed questName);
  event QuestCompleteGame(address indexed user, bytes32 indexed questName);

  /**
   * Initialize when create this game contract, once time use
   * @param newGameContractOwner address - Address owner of this game contract
   */
  function initialize(address newGameContractOwner) external;

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
   * Submit a transaction to store action, quest Daily to chain
   * @param questName bytes32 - Hash value generated from a quest name (string)
   * Emits event QuestCompleteDaily with User address and hash value
   */
  function questSubmitDaily(bytes32 questName) external;

  /**
   * Submit a transaction to store action, quest Social to chain
   * @param questName bytes32 - Hash value generated from a quest name (string)
   * Emits event QuestCompleteSocial with User address and hash value
   */
  function questSubmitSocial(bytes32 questName) external;

  /**
   * Submit a transaction to store action, quest Game to chain
   * @param questName bytes32 - Hash value generated from a quest name (string)
   * Emits event QuestCompleteGame with User address and hash value
   */
  function questSubmitGame(bytes32 questName) external;

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
