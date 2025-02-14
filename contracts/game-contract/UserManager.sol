// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract UserManager is Ownable {
    // Invalid User
    error InvalidUser();

    // User list
    mapping(address => bool) private _userMap;

    // User total
    uint256 private _userTotal;

    // Add list Users
    event UserListAdd(address indexed actor, uint256 indexed totalAddedUser);

    // Remove list Users
    event UserListRemove(address indexed actor, uint256 indexed totalAddedUser);

    // We only allow User have been add by owner
    modifier onlyUser() {
        if (!_userMap[msg.sender]) {
            revert InvalidUser();
        }
        _;
    }

    /*******************************************************
    * Owner section
    ********************************************************/

    // Add new Users in list
    function userListAdd(address[] memory userListToAdd) external onlyOwner {
        for (uint256 i = 0; i < userListToAdd.length; i += 1) {
            if (!_userMap[userListToAdd[i]]) { 
                _userMap[userListToAdd[i]] = true; 
                _userTotal += 1;
            }
        }
        emit UserListAdd(msg.sender, _userTotal);
    }

    // Remove old Users in list
    function userListRemove(address[] memory userListToRemove) external onlyOwner {
        for (uint256 i = 0; i < userListToRemove.length; i += 1) {
            if (_userMap[userListToRemove[i]]) { 
                _userMap[userListToRemove[i]] = false; 
                _userTotal -= 1;
            }
        }
        emit UserListRemove(msg.sender, _userTotal);
    }

    /*******************************************************
    * External view section
    ********************************************************/

    // Check list user status which have added and which hasn't
    function userListCheck(address[] memory userListToCheck) external view returns (bool[] memory) {
        bool[] memory statusList = new bool[](userListToCheck.length);
        for (uint256 i = 0; i < userListToCheck.length; i += 1) {
            statusList[i] = _userMap[userListToCheck[i]];
        }
        return statusList; 
    }

    // Check user status 
    function userCheck(address userToCheck) external view returns (bool) {
        return _userMap[userToCheck];
    }

    // Total user has been added
    function userTotal() external view returns (uint256) {
        return _userTotal;
    }
}
