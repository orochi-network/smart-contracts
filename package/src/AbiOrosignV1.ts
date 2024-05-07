export const AbiOrosignV1 = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "singed",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "recovered",
        "type": "address"
      }
    ],
    "name": "DuplicatedSigner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "role",
        "type": "uint256"
      }
    ],
    "name": "InlvaidRole",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "duration",
        "type": "uint256"
      }
    ],
    "name": "InsecuredTimeout",
    "type": "error"
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
        "name": "orosignAddress",
        "type": "address"
      }
    ],
    "name": "InvalidOrosignAddress",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "totalSinger",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalExecutor",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalCreator",
        "type": "uint256"
      }
    ],
    "name": "InvalidPermission",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "length",
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
        "name": "userAddress",
        "type": "address"
      }
    ],
    "name": "InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "threshold",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalSigner",
        "type": "uint256"
      }
    ],
    "name": "InvalidThreshold",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "permission",
        "type": "uint256"
      }
    ],
    "name": "InvalidUserActivePermission",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidUserOrRoleList",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "OnlyAbleToInitOnce",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "OnlyUserAllowed",
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
        "internalType": "uint256",
        "name": "inputChainId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "requiredChainId",
        "type": "uint256"
      }
    ],
    "name": "ProofChainIdMismatch",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "votingDeadline",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "currentTimestamp",
        "type": "uint256"
      }
    ],
    "name": "ProofExpired",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "inputNonce",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "requiredNonce",
        "type": "uint256"
      }
    ],
    "name": "ProofInvalidNonce",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ProofNoCreator",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "RecordLengthMismatch",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "signed",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "threshold",
        "type": "uint256"
      }
    ],
    "name": "ThresholdNotPassed",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addedAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "name": "UserDuplicatedOrWrongOrder",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "target",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "ExecutedTransaction",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "preUser",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newUser",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint128",
        "name": "role",
        "type": "uint128"
      }
    ],
    "name": "TransferRole",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "txData",
        "type": "bytes"
      }
    ],
    "name": "decodePackedTransaction",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint64",
            "name": "chainId",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "votingDeadline",
            "type": "uint64"
          },
          {
            "internalType": "uint128",
            "name": "nonce",
            "type": "uint128"
          },
          {
            "internalType": "uint96",
            "name": "currentBlockTime",
            "type": "uint96"
          },
          {
            "internalType": "address",
            "name": "target",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "orosignAddress",
            "type": "address"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "internalType": "struct IOrosignV1.PackedTransaction",
        "name": "decodedTransaction",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "timeout",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "target",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "encodePackedTransaction",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "creatorSignature",
        "type": "bytes"
      },
      {
        "internalType": "bytes[]",
        "name": "signatureList",
        "type": "bytes[]"
      },
      {
        "internalType": "bytes",
        "name": "message",
        "type": "bytes"
      }
    ],
    "name": "executeTransaction",
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
    "name": "getAllUser",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "allUser",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMetadata",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "chainId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nonce",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalSigner",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "threshold",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "securedTimeout",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "blockTimestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct IOrosignV1.OrosignV1Metadata",
        "name": "result",
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
        "name": "checkAddress",
        "type": "address"
      }
    ],
    "name": "getRole",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "index",
            "type": "uint256"
          },
          {
            "internalType": "uint128",
            "name": "role",
            "type": "uint128"
          },
          {
            "internalType": "uint128",
            "name": "activeTime",
            "type": "uint128"
          }
        ],
        "internalType": "struct Permissioned.RoleRecord",
        "name": "roleRecord",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalUser",
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
    "name": "init",
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
        "name": "checkAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "requiredPermission",
        "type": "uint256"
      }
    ],
    "name": "isActivePermission",
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
        "internalType": "address",
        "name": "checkAddress",
        "type": "address"
      }
    ],
    "name": "isActiveUser",
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
        "internalType": "address",
        "name": "target",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "quickEncodePackedTransaction",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newUser",
        "type": "address"
      }
    ],
    "name": "transferRole",
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
    "stateMutability": "payable",
    "type": "receive"
  }
];