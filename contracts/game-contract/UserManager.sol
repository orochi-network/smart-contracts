// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;


contract UserManager  {
    // Invalid User
    error InvalidUser();

    // User list
    mapping(address => bool) private _userMap;

    // User total
    uint256 private _gameContractUserTotal;

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
    * Internal section
    ********************************************************/

    // Add new Users in list
    function _userListAdd(address[] memory userListToAdd) internal {
        for (uint256 i = 0; i < userListToAdd.length; i += 1) {
            if (!_userMap[userListToAdd[i]]) { 
                _userMap[userListToAdd[i]] = true; 
                _gameContractUserTotal += 1;
            }
        }
        emit UserListAdd(msg.sender, _gameContractUserTotal);
    }

    // Remove old Users in list
    function _userListRemove(address[] memory userListToRemove) internal {
        for (uint256 i = 0; i < userListToRemove.length; i += 1) {
            if (_userMap[userListToRemove[i]]) { 
                _userMap[userListToRemove[i]] = false; 
                _gameContractUserTotal -= 1;
            }
        }
        emit UserListRemove(msg.sender, _gameContractUserTotal);
    }

    /*******************************************************
    * Internal view section
    ********************************************************/

    // Check list user status which have added and which hasn't
    function _userListCheck(address[] memory userListToCheck) internal view returns (bool[] memory) {
        bool[] memory statusList = new bool[](userListToCheck.length);
        for (uint256 i = 0; i < userListToCheck.length; i += 1) {
            statusList[i] = _userMap[userListToCheck[i]];
        }
        return statusList; 
    }

    // Check user status 
    function _userCheck(address userToCheck) internal view returns (bool) {
        return _userMap[userToCheck];
    }

    // Total user has been added
    function _userTotal() internal view returns (uint256) {
        return _gameContractUserTotal;
    }
}
