export const AbiOrosignMasterV1 = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "multisigImplementation",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "operatorAddress",
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
    "inputs": [
      {
        "internalType": "address",
        "name": "operatorAddress",
        "type": "address"
      }
    ],
    "name": "InvalidOperator",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "actor",
        "type": "address"
      }
    ],
    "name": "OnlyOperatorAllowed",
    "type": "error"
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
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "newWallet",
        "type": "address"
      }
    ],
    "name": "UnableToInitNewWallet",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOperatorAddress",
        "type": "address"
      }
    ],
    "name": "AddOperator",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint96",
        "name": "salt",
        "type": "uint96"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "walletAddress",
        "type": "address"
      }
    ],
    "name": "CreateNewWallet",
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
        "name": "oldOperatorAddress",
        "type": "address"
      }
    ],
    "name": "RemoveOperator",
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
    "inputs": [
      {
        "internalType": "address",
        "name": "newOperator",
        "type": "address"
      }
    ],
    "name": "addOperator",
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
        "internalType": "uint96",
        "name": "salt",
        "type": "uint96"
      },
      {
        "internalType": "address[]",
        "name": "userList",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "roleList",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256",
        "name": "votingThreshold",
        "type": "uint256"
      }
    ],
    "name": "createWallet",
    "outputs": [
      {
        "internalType": "address",
        "name": "newWalletAdress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMetadata",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "sChainId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "sImplementation",
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
        "name": "walletAddress",
        "type": "address"
      }
    ],
    "name": "isContractExist",
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
    "name": "isMultiSigExist",
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
    "inputs": [
      {
        "internalType": "address",
        "name": "oldOperator",
        "type": "address"
      }
    ],
    "name": "removeOperator",
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
  }
];