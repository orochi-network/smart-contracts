export const AbiONProver = [
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint128",
            "name": "maxDailyLimit",
            "type": "uint128"
          },
          {
            "internalType": "uint64",
            "name": "timeStart",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "timeEnd",
            "type": "uint64"
          },
          {
            "internalType": "contract OrochiNetworkToken",
            "name": "tokenContract",
            "type": "address"
          }
        ],
        "internalType": "struct ONProver.Configuration",
        "name": "cfg",
        "type": "tuple"
      },
      {
        "internalType": "address[]",
        "name": "listOperator",
        "type": "address[]"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "uint128",
        "name": "dailyLimit",
        "type": "uint128"
      }
    ],
    "name": "ExceedDailyLimit",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint64",
        "name": "startTime",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "endTime",
        "type": "uint64"
      }
    ],
    "name": "InactivatedCampaign",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "inputAddress",
        "type": "address"
      }
    ],
    "name": "InvalidAddress",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proofLength",
        "type": "uint256"
      }
    ],
    "name": "InvalidProofLength",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "signer",
        "type": "address"
      }
    ],
    "name": "InvalidProofSignature",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "proofRecipient",
        "type": "address"
      }
    ],
    "name": "InvalidRecipient",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint64",
        "name": "timestamp",
        "type": "uint64"
      }
    ],
    "name": "InvalidTransactionTimestamp",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint96",
        "name": "nonce",
        "type": "uint96"
      }
    ],
    "name": "InvalidUserNonce",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "requiredLen",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxLen",
        "type": "uint256"
      }
    ],
    "name": "OutOfRange",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint128",
        "name": "amount",
        "type": "uint128"
      }
    ],
    "name": "UnableToMint",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOperator",
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
        "name": "OldOperator",
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
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "TokenClaim",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "day",
        "type": "uint256"
      }
    ],
    "name": "TokenClaimDaily",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint128",
        "name": "maxDailyLimit",
        "type": "uint128"
      }
    ],
    "name": "UpdateConfigMaxDailyLimit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "timeEnd",
        "type": "uint64"
      }
    ],
    "name": "UpdateConfigTimeEnd",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "timeStart",
        "type": "uint64"
      }
    ],
    "name": "UpdateConfigTimeStart",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "tokenContract",
        "type": "address"
      }
    ],
    "name": "UpdateConfigTokenContract",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operatorNew",
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
        "internalType": "bytes",
        "name": "proof",
        "type": "bytes"
      }
    ],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getConfig",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint128",
            "name": "maxDailyLimit",
            "type": "uint128"
          },
          {
            "internalType": "uint64",
            "name": "timeStart",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "timeEnd",
            "type": "uint64"
          },
          {
            "internalType": "contract OrochiNetworkToken",
            "name": "tokenContract",
            "type": "address"
          }
        ],
        "internalType": "struct ONProver.Configuration",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentDay",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "day",
        "type": "uint256"
      }
    ],
    "name": "getMetricByDate",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint128",
            "name": "claimed",
            "type": "uint128"
          },
          {
            "internalType": "uint128",
            "name": "userCount",
            "type": "uint128"
          }
        ],
        "internalType": "struct ONProver.DailyClaim",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMetricToday",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint128",
            "name": "claimed",
            "type": "uint128"
          },
          {
            "internalType": "uint128",
            "name": "userCount",
            "type": "uint128"
          }
        ],
        "internalType": "struct ONProver.DailyClaim",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "name": "getTotalClaim",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserNonce",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "checkAddress",
        "type": "address"
      }
    ],
    "name": "isOperator",
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
        "internalType": "address",
        "name": "operatorOld",
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
        "components": [
          {
            "internalType": "uint128",
            "name": "maxDailyLimit",
            "type": "uint128"
          },
          {
            "internalType": "uint64",
            "name": "timeStart",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "timeEnd",
            "type": "uint64"
          },
          {
            "internalType": "contract OrochiNetworkToken",
            "name": "tokenContract",
            "type": "address"
          }
        ],
        "internalType": "struct ONProver.Configuration",
        "name": "cfg",
        "type": "tuple"
      }
    ],
    "name": "setConfiguration",
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
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];