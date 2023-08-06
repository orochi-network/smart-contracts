// Dependency file: contracts/interfaces/IOrandPenalty.sol
// pragma solidity ^0.8.0;

error NotEnougCollateral(uint256 balance, uint256 requiredCollateral);
error InvalidCaller(address callerAddress);

interface IOrandPenalty {
  // Deposit collateral for a consumer contract address
  function deposit(address consumerContract) external payable returns (bool isSuccess);

  // Withdraw all native token to receiver address
  function withdraw() external returns (bool isSuccess);

  // Get penalty fee
  function getPenaltyFee() external view returns (uint256 fee);

  // Get colateral balance
  function collateralBalance(address consumerAddress) external view returns (uint256 balance);
}


// Dependency file: @openzeppelin/contracts/utils/Context.sol

// OpenZeppelin Contracts v4.4.1 (utils/Context.sol)

// pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}


// Dependency file: @openzeppelin/contracts/access/Ownable.sol

// OpenZeppelin Contracts (last updated v4.7.0) (access/Ownable.sol)

// pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/utils/Context.sol";

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// Dependency file: contracts/interfaces/IOrandConsumerV1.sol

// pragma solidity ^0.8.0;

error InvalidProvider();

interface IOrandConsumerV1 {
  // Consume the verifiable randomness from provider
  function consumeRandomness(uint256 randomness) external returns (bool);
}


// Dependency file: contracts/test/ExampleValidityProofDice.sol

// pragma solidity ^0.8.0;
// import '/Users/chiro/GitHub/orosign-contracts/node_modules/@openzeppelin/contracts/access/Ownable.sol';
// import 'contracts/interfaces/IOrandConsumerV1.sol';

error WrongGuessingValue(uint128 guessing);

// Application should be an implement of IOrandConsumerV1 interface
contract ExampleValidityProofDice is IOrandConsumerV1, Ownable {
  // Set new provider
  event SetProvider(address indexed oldProvider, address indexed newProvider);

  // Fulfill awaiting result
  event Fulfill(uint256 indexed gameId, uint256 guessed, uint256 indexed result);

  // New guess from player
  event NewGuess(address indexed player, uint256 indexed gameId, uint128 indexed guessed);

  // Adjust maximum batching
  event AdjustMaximumBatching(uint256 indexed maximum);

  // Game structure
  struct Game {
    uint128 guessed;
    uint128 result;
  }

  // Provider address
  address private orandProviderV1;

  // Game result storage
  mapping(uint256 => Game) private gameResult;

  // Total game
  uint256 private totalGame;

  // Fulfiled randomness
  uint256 private fulfilled;

  // We batching the radomness in one epoch
  uint256 private maximumBatching;

  // Only allow Orand to submit result
  modifier onlyOrandProviderV1() {
    if (msg.sender != orandProviderV1) {
      revert InvalidProvider();
    }
    _;
  }

  // Constructor
  constructor(address provider, uint256 limitBatching) {
    _setProvider(provider);
    _setBatching(limitBatching);
  }

  //=======================[  Internal  ]====================

  // Set provider
  function _setProvider(address provider) internal {
    emit SetProvider(orandProviderV1, provider);
    orandProviderV1 = provider;
  }

  // Set provider
  function _getProvider() internal view returns (address) {
    return orandProviderV1;
  }

  // Set max batching
  function _setBatching(uint256 maximum) internal {
    maximumBatching = maximum;
    emit AdjustMaximumBatching(maximum);
  }

  //=======================[  Owner  ]====================

  // Set provider
  function setProvider(address provider) external onlyOwner returns (bool) {
    _setProvider(provider);
    return true;
  }

  // Set provider
  function setMaximumBatching(uint256 maximum) external onlyOwner returns (bool) {
    _setBatching(maximum);
    return true;
  }

  //=======================[  OrandProviderV1  ]====================

  // Consume the result of Orand V1 with batching feature
  function consumeRandomness(uint256 randomness) external override onlyOrandProviderV1 returns (bool) {
    uint256 filling = fulfilled;
    uint256 processing = totalGame;

    // We keep batching < maximumBatching
    if (processing - filling > maximumBatching) {
      processing = filling + maximumBatching;
    } else {
      processing = totalGame;
    }

    // Starting batching
    for (; filling < processing; filling += 1) {
      gameResult[filling].result = uint128((randomness % 6) + 1);
      randomness = uint256(keccak256(abi.encodePacked(randomness)));
      emit Fulfill(filling, gameResult[filling].guessed, gameResult[filling].result);
    }

    fulfilled = filling - 1;
    return true;
  }

  //=======================[  External  ]====================

  // Player can guessing any number in range of 1-6
  function guessingDiceNumber(uint128 guessing) external returns (bool) {
    // Player only able to guessing between 1-6 since it's dice number
    if (guessing < 1 || guessing > 6) {
      revert WrongGuessingValue(guessing);
    }
    Game memory currentGame = Game({ guessed: guessing, result: 0 });
    gameResult[totalGame] = currentGame;
    emit NewGuess(msg.sender, totalGame, guessing);
    totalGame += 1;
    return true;
  }

  //=======================[  External View  ]====================

  // Get result from smart contract
  function getResult(uint256 gameId) external view returns (Game memory result) {
    return gameResult[gameId];
  }

  function getStateOfGame() external view returns (uint256 fulfill, uint256 total) {
    return (fulfilled, totalGame);
  }
}


// Root file: contracts/test/ExampleFraudProofDice.sol

pragma solidity ^0.8.0;
// import 'contracts/interfaces/IOrandPenalty.sol';
// import 'contracts/test/ExampleValidityProofDice.sol';

// Fraud proof is the same to
contract ExampleFraudProofDice is ExampleValidityProofDice {
  // Constructor
  constructor(address provider, uint256 limitBatching) ExampleValidityProofDice(provider, limitBatching) {}

  // We MUST allowed this smart contract to receive native token
  receive() external payable {}

  // Withdraw your collateral in OrandProviderV1
  // After withdraw collateral, you won't be able to use fraud proof
  function withdraw() external onlyOwner {
    IOrandPenalty(_getProvider()).withdraw();
    // Transfer everything to the owner
    payable(msg.sender).transfer(address(this).balance);
  }

  // Deposit collateral to enable fraud proof
  function deposit() external payable onlyOwner {
    IOrandPenalty(_getProvider()).deposit{ value: msg.value }(address(this));
  }
}
