// Root file: contracts/libraries/Permissioned.sol
pragma solidity >=0.8.4 <0.9.0;

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

contract Permissioned {
  // Permission constants
  uint256 internal constant PERMISSION_NONE = 0;

  // User record
  struct UserRecord {
    uint96 role;
    address userAddress;
    uint256 activeTime;
  }

  // User list
  mapping(uint256 => UserRecord) private user;

  // Maping user to Id
  mapping(address => uint256) private reversedUserMap;

  // Total number of users
  uint256 private totalUser;

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
  function _init(address[] memory userList, uint256[] memory roleList) internal {
    // Make sure that we only init this once
    if (totalUser > 0) {
      revert OnlyAbleToInitOnce();
    }
    // Data length should match
    if (userList.length != roleList.length) {
      revert RecordLengthMismatch();
    }
    for (uint256 i = 0; i < userList.length; i += 1) {
      user[i] = UserRecord({ role: uint96(roleList[i]), activeTime: 0, userAddress: userList[i] });
      reversedUserMap[userList[i]] = i;
      emit TransferRole(address(0), userList[i], roleList[i]);
    }
    totalUser = userList.length;
  }

  // Transfer role to new user
  function _transferRole(address newUser, uint256 lockDuration) internal {
    // Receiver shouldn't be a zero address
    if (newUser == address(0)) {
      revert InvalidAddress();
    }
    uint256 userId = reversedUserMap[msg.sender];
    UserRecord memory currentUser = user[userId];
    // Remove user
    currentUser.activeTime = block.timestamp + lockDuration;
    currentUser.userAddress = msg.sender;
    user[userId] = currentUser;
    emit TransferRole(msg.sender, newUser, currentUser.role);
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

  // Get user by address
  function _getUser(address checkAddress) internal view returns (UserRecord memory userRecord) {
    return user[reversedUserMap[checkAddress]];
  }

  // Is an address a user
  function _isUser(address checkAddress) internal view returns (bool) {
    return _getUser(checkAddress).role > PERMISSION_NONE && block.timestamp > _getUser(checkAddress).activeTime;
  }

  // Check a permission is granted to user
  function _isPermission(address checkAddress, uint256 requiredPermission) internal view returns (bool) {
    return _isUser(checkAddress) && ((_getUser(checkAddress).role & requiredPermission) == requiredPermission);
  }

  /*******************************************************
   * View section
   ********************************************************/

  // Get user by address
  function getUser(address checkAddress) external view returns (UserRecord memory userRecord) {
    return _getUser(checkAddress);
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
  function getAllUser() external view returns (uint256[] memory allUser) {
    allUser = new uint256[](totalUser);
    for (uint256 i = 0; i < totalUser; i += 1) {
      UserRecord memory currentUser = user[i];
      allUser[i] = uint256(_packing(uint96(currentUser.role), currentUser.userAddress));
    }
  }

  // Get total number of user
  function getTotalUser() external view returns (uint256) {
    return totalUser;
  }
}
