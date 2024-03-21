// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

// Stop sender to process further
error InvalidUserActivePermission(address userAddress, uint256 permission);
// Only allow registered users
error OnlyUserAllowed();
// Prevent contract to be reinit
error OnlyAbleToInitOnce();
// Data length mismatch between two arrays
error RecordLengthMismatch();
// Invalid address
error InvalidAddress();
// Invalid address
error InvalidReceiver(address userAddress);
// Invalid user or role list
error InvalidUserOrRoleList();
// Invalid role
error InlvaidRole(uint256 role);
// Duplicated user or wrong user list ordering
error UserDuplicatedOrWrongOrder(address addedAddress, address userAddress);

contract Permissioned {
  // Permission constants
  uint256 internal constant PERMISSION_NONE = 0;

  // Role record
  struct RoleRecord {
    uint256 index;
    uint128 role;
    uint128 activeTime;
  }

  // Multi user data
  mapping(address => RoleRecord) private role;

  // User list
  mapping(uint256 => address) private user;

  // Total number of users
  uint256 private totalUser;

  // Transfer role to new user event
  event TransferRole(address indexed preUser, address indexed newUser, uint128 indexed role);

  // Only allow active users who have given role trigger smart contract
  modifier onlyActivePermission(uint256 permissions) {
    if (!_isActivePermission(msg.sender, permissions)) {
      revert InvalidUserActivePermission(msg.sender, permissions);
    }
    _;
  }

  // Only allow listed users to trigger smart contract
  modifier onlyActiveUser() {
    if (!_isActiveUser(msg.sender)) {
      revert OnlyUserAllowed();
    }
    _;
  }

  /*******************************************************
   * Internal section
   ********************************************************/

  // Init method which can be called once
  function _init(address[] memory userList, uint256[] memory roleList) internal {
    address addedUser = address(0);
    // Make sure that we only init this once
    if (totalUser > 0) {
      revert OnlyAbleToInitOnce();
    }
    if (userList.length == 0) {
      revert InvalidUserOrRoleList();
    }
    // Data length should match
    if (userList.length != roleList.length) {
      revert RecordLengthMismatch();
    }
    // Create new role record
    RoleRecord memory newRoleRecord;
    newRoleRecord.activeTime = 0;
    for (uint256 i = 0; i < userList.length; i += 1) {
      // Role should not be composed of 1,2,4,8
      // PERMISSION_OBSERVE| PERMISSION_SIGN| PERMISSION_EXECUTE | PERMISSION_CREAT == 15
      if (roleList[i] > 15 || roleList[i] == PERMISSION_NONE) {
        revert InlvaidRole(roleList[i]);
      }
      // User address must not be a zero address
      if (address(0) == userList[i]) {
        revert InvalidAddress();
      }
      // User address must be unique
      if (userList[i] <= addedUser) {
        revert UserDuplicatedOrWrongOrder(addedUser, userList[i]);
      }
      addedUser = userList[i];
      // Store user's address -> user list
      user[i] = userList[i];
      // Mapping user address -> role
      newRoleRecord.index = i;
      newRoleRecord.role = uint128(roleList[i]);
      role[userList[i]] = newRoleRecord;
      emit TransferRole(address(0), userList[i], newRoleRecord.role);
    }
    totalUser = userList.length;
  }

  // Transfer role from msg.sender -> new user
  function _transferRole(address toUser, uint256 lockDuration) internal {
    // Receiver shouldn't be a zero address
    if (toUser == address(0)) {
      revert InvalidAddress();
    }
    // New user should not has any permissions
    if (_isUser(toUser)) {
      revert InvalidReceiver(toUser);
    }
    // Role owner
    address fromUser = msg.sender;
    // Get role of current user
    RoleRecord memory currentRole = role[fromUser];
    // Delete role record of current user
    delete role[fromUser];
    // Set lock duration for new user
    currentRole.activeTime = uint128(block.timestamp + lockDuration);
    // Assign current role -> new user
    role[toUser] = currentRole;
    // Replace old user in user list
    user[currentRole.index] = toUser;
    emit TransferRole(fromUser, toUser, currentRole.role);
  }

  /*******************************************************
   * Internal View section
   ********************************************************/

  // Packing address and uint96 to a single bytes32
  // 96 bits a ++ 160 bits b
  function _packing(uint96 a, address b) internal pure returns (bytes32 packed) {
    assembly {
      packed := or(shl(160, a), b)
    }
  }

  // Check if permission is a superset of required permission
  function _isSuperset(uint256 permission, uint256 requiredPermission) internal pure returns (bool) {
    return (permission & requiredPermission) == requiredPermission;
  }

  // Read role record of an user
  function _getRole(address checkAddress) internal view returns (RoleRecord memory roleRecord) {
    return role[checkAddress];
  }

  // Do this account has required permission?
  function _hasPermission(address checkAddress, uint256 requiredPermission) internal view returns (bool) {
    return _isSuperset(_getRole(checkAddress).role, requiredPermission);
  }

  // Is an user?
  function _isUser(address checkAddress) internal view returns (bool) {
    return _getRole(checkAddress).role > PERMISSION_NONE;
  }

  // Is an active user?
  function _isActiveUser(address checkAddress) internal view returns (bool) {
    RoleRecord memory roleRecord = _getRole(checkAddress);
    return roleRecord.role > PERMISSION_NONE && block.timestamp > roleRecord.activeTime;
  }

  // Check a subset of required permission was granted to user
  function _isActivePermission(address checkAddress, uint256 requiredPermission) internal view returns (bool) {
    return _isActiveUser(checkAddress) && _hasPermission(checkAddress, requiredPermission);
  }

  /*******************************************************
   * External View section
   ********************************************************/

  // Read role record of an user
  function getRole(address checkAddress) external view returns (RoleRecord memory roleRecord) {
    return _getRole(checkAddress);
  }

  // Is active user?
  function isActiveUser(address checkAddress) external view returns (bool) {
    return _isActiveUser(checkAddress);
  }

  // Check a subset of required permission was granted to user
  function isActivePermission(address checkAddress, uint256 requiredPermission) external view returns (bool) {
    return _isActivePermission(checkAddress, requiredPermission);
  }

  // Get list of users include its permission
  function getAllUser() external view returns (uint256[] memory allUser) {
    allUser = new uint256[](totalUser);
    for (uint256 i = 0; i < totalUser; i += 1) {
      address currentUser = user[i];
      allUser[i] = uint256(_packing(uint96(role[currentUser].role), currentUser));
    }
  }

  // Get total number of users
  function getTotalUser() external view returns (uint256) {
    return totalUser;
  }
}
