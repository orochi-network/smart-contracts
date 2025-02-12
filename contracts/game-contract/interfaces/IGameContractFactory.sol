// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IGameContractFactory {
    // Invalid User error
    error InvalidUser();


    // Events
    event GameContractDeploy(address indexed owner, address indexed contractAddress);
    event UserListAdd(uint256 indexed totalAddedUser, uint256 indexed timestamp);
    event UserListRemove(uint256 indexed totalAddedUser, uint256 indexed timestamp);
    event UpgradeImplementation(address indexed oldImplementation, address indexed upgradeImplementation);

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
    * @param _GameContractOwner address - Owner address of game contract deployed
    * @param salt address - Salt to set up deploy smart contract address
    * Emits event GameContractDeploy with owner address and game contract address
    */
    function deployGameContract(address _GameContractOwner, bytes32 salt) external;

    /**
    * Return all game contract has been deployed by this factory
    * @return address[] - Returns an array of address game contract
    */
    function getContractListDeploy() external view returns (address[] memory);

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
