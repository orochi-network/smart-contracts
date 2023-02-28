// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.4 <0.9.0;

contract Permissioned {
  // Top sender to process further
  error AccessDenied();
  // Only allow registered users
  error OnlyUserAllowed();
  // Prevent contract to be reinit
  error OnlyAbleToInitOnce();
  // Data length mismatch between two arrays
  error RecordLengthMismatch();
  // Invalid address
  error InvalidAddress();

  // Permission constants
  uint256 internal constant PERMISSION_NONE = 0;

  // Multi user data
  mapping(address => uint256) private _userRole;

  // Active time of user
  mapping(address => uint256) private _activeTime;

  // User list
  mapping(uint256 => address) private _userList;

  // Reversed map
  mapping(address => uint256) private _reversedUserList;

  // Total number of users
  uint256 private _totalUser;

  // Transfer role to new user event
  event TransferRole(address indexed preUser, address indexed newUser, uint256 indexed role);

  // Only allow users who has given role trigger smart contract
  modifier onlyAllow(uint256 permissions) {
    if (!_isPermission(msg.sender, permissions)) {
      revert AccessDenied();
    }
    _;
  }

  // Only allow listed users to trigger smart contract
  modifier onlyUser() {
    if (!_isUser(msg.sender)) {
      revert OnlyUserAllowed();
    }
    _;
  }

  /*******************************************************
   * Internal section
   ********************************************************/

  // Init method which can be called once
  function _init(address[] memory users_, uint256[] memory roles_) internal {
    // Make sure that we only init this once
    if (_totalUser > 0) {
      revert OnlyAbleToInitOnce();
    }
    // Data length should match
    if (users_.length != roles_.length) {
      revert RecordLengthMismatch();
    }
    for (uint256 i = 0; i < users_.length; i += 1) {
      _userList[i] = users_[i];
      _reversedUserList[users_[i]] = i;
      _userRole[users_[i]] = roles_[i];
      emit TransferRole(address(0), users_[i], roles_[i]);
    }
    _totalUser = users_.length;
  }

  // Transfer role to new user
  function _transferRole(address newUser, uint256 lockDuration) internal {
    // Receiver shouldn't be a zero address
    if (newUser == address(0)) {
      revert InvalidAddress();
    }
    uint256 role = _userRole[msg.sender];
    // Remove user
    _userRole[msg.sender] = PERMISSION_NONE;
    // Assign role for new user
    _userRole[newUser] = role;
    _activeTime[newUser] = block.timestamp + lockDuration;
    // Replace old user in user list
    _userList[_reversedUserList[msg.sender]] = newUser;
    emit TransferRole(msg.sender, newUser, role);
  }

  // Packing adderss and uint96 to a single bytes32
  // 96 bits a ++ 160 bits b
  function _packing(uint96 a, address b) internal pure returns (bytes32 packed) {
    assembly {
      packed := or(shl(160, a), b)
    }
  }

  /*******************************************************
   * Internal View section
   ********************************************************/

  // Is an address a user
  function _isUser(address checkAddress) internal view returns (bool) {
    return _userRole[checkAddress] > PERMISSION_NONE && block.timestamp > _activeTime[checkAddress];
  }

  // Check a permission is granted to user
  function _isPermission(address checkAddress, uint256 requiredPermission) internal view returns (bool) {
    return _isUser(checkAddress) && ((_userRole[checkAddress] & requiredPermission) == requiredPermission);
  }

  /*******************************************************
   * View section
   ********************************************************/

  // Read role of an user
  function getRole(address checkAddress) external view returns (uint256) {
    return _userRole[checkAddress];
  }

  // Get active time of user
  function getActiveTime(address checkAddress) external view returns (uint256) {
    return _activeTime[checkAddress];
  }

  // Is an address a user
  function isUser(address checkAddress) external view returns (bool) {
    return _isUser(checkAddress);
  }

  // Check a permission is granted to user
  function isPermission(address checkAddress, uint256 requiredPermission) external view returns (bool) {
    return _isPermission(checkAddress, requiredPermission);
  }

  // Get list of users include its permission
  function getAllUser() external view returns (uint256[] memory userList) {
    userList = new uint256[](_totalUser);
    for (uint256 i = 0; i < _totalUser; i += 1) {
      address currentUser = _userList[i];
      userList[i] = uint256(_packing(uint96(_userRole[currentUser]), currentUser));
    }
  }

  // Get total number of user
  function getTotalUser() external view returns (uint256) {
    return _totalUser;
  }
}
