export const AbiGameContractFactory = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_implementation",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "InvalidAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidUser",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UnableToInitNewContract",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "ownerAddress",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "contractAddress",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      }
    ],
    "name": "GameContractDeploy",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldImplementation",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "upgradeImplementation",
        "type": "address"
      }
    ],
    "name": "UpgradeImplementation",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "totalAddedUser",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "UserListAdd",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "totalAddedUser",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "UserListRemove",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "gameContractOwner",
        "type": "address"
      },
      {
        "internalType": "uint96",
        "name": "salt",
        "type": "uint96"
      }
    ],
    "name": "deployGameContract",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "gameContractAddress",
        "type": "address"
      }
    ],
    "name": "getGameContractOwner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "gameContractAddress",
        "type": "address"
      }
    ],
    "name": "isGameContractExist",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isExist",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint96",
        "name": "salt",
        "type": "uint96"
      },
      {
        "internalType": "address",
        "name": "creatorAddress",
        "type": "address"
      }
    ],
    "name": "packingSalt",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "packedSalt",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint96",
        "name": "salt",
        "type": "uint96"
      },
      {
        "internalType": "address",
        "name": "creatorAddress",
        "type": "address"
      }
    ],
    "name": "predictWalletAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "predictedAddress",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newImplementation",
        "type": "address"
      }
    ],
    "name": "upgradeImplementation",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "userToCheck",
        "type": "address"
      }
    ],
    "name": "userCheck",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "userListToAdd",
        "type": "address[]"
      }
    ],
    "name": "userListAdd",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "userListToCheck",
        "type": "address[]"
      }
    ],
    "name": "userListCheck",
    "outputs": [
      {
        "internalType": "bool[]",
        "name": "",
        "type": "bool[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "userListToRemove",
        "type": "address[]"
      }
    ],
    "name": "userListRemove",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "userTotal",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];