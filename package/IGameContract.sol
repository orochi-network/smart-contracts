// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IGameContract {
    // Invalid User error
    error InvalidUser();

    // init once time error
    error OnlyAbleToInitOnce();


    // Events
    event QuestCompleteDaily(address indexed user, bytes32 indexed questName);
    event QuestCompleteSocial(address indexed user, bytes32 indexed questName);
    event QuestCompleteGame(address indexed user, bytes32 indexed questName);
    event SignerListAdd(uint256 indexed totalAddedUser, uint256 indexed timestamp);
    event SignerListRemove(uint256 indexed totalAddedUser, uint256 indexed timestamp);
    event Initialize(address indexed owner, uint256 indexed timestamp);


    /**
    * Initialize when create this game contract, once time use
    * @param newGameContractOwner address - Address owner of this game contract
    * Emits event Initialize with owner address and block timestamp
    */
    function initialize(address newGameContractOwner) external;

    /**
    * Add new User to list, only owner contract can transact this function
    * @param signerListToAdd address[] - List of User addresses to add
    * Emits event SignerListAdd with total User and block timestamp
    */
    function signerListAdd(address[] memory signerListToAdd) external;

    /**
    * Remove old User from list, only owner contract can transact this function
    * @param listSignerToRemove address[] - List of User addresses to remove
    * Emits event SignerListRemove with total User and block timestamp
    */
    function signerListRemove(address[] memory listSignerToRemove) external;

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
    * @param signerListToCheck address[] - List of addresses to check
    * @return bool[] - Returns an array of booleans corresponding to each address status
    */
    function signerListCheck(address[] memory signerListToCheck) external view returns (bool[] memory);

    /**
    * Check status of a specific address
    * @param signerToCheck address - The address to check
    * @return bool - Returns the status of the given address
    */
    function signerCheck(address signerToCheck) external view returns (bool);

    /**
    * Show the total number of users added
    * @return uint256 - The total number of users added to the list
    */
    function signerTotal() external view returns (uint256);
}
