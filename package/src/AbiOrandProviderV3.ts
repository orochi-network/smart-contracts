export const AbiOrandProviderV3 = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "expectedAlpha",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "givenAlpha",
        "type": "uint256"
      }
    ],
    "name": "InvalidAlphaValue",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "signerAddress",
        "type": "address"
      }
    ],
    "name": "InvalidECDSAProof",
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
    "name": "InvalidECDSAProofLength",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidECVRFProofDigest",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "currentEpoch",
        "type": "uint256"
      }
    ],
    "name": "InvalidGenesisEpoch",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "proofSigner",
        "type": "address"
      }
    ],
    "name": "InvalidProofSigner",
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
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "receiverAddress",
        "type": "address"
      }
    ],
    "name": "ExternalError",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "version",
        "type": "uint8"
      }
    ],
    "name": "Initialized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "receiverAddress",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint96",
        "name": "receiverEpoch",
        "type": "uint96"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "randomness",
        "type": "uint256"
      }
    ],
    "name": "NewEpoch",
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
        "name": "actor",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "maxBatching",
        "type": "uint256"
      }
    ],
    "name": "SetBatchingLimit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "actor",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "ecvrfAddress",
        "type": "address"
      }
    ],
    "name": "SetNewECVRFVerifier",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldOperator",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOperator",
        "type": "address"
      }
    ],
    "name": "SetNewOperator",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "actor",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOracle",
        "type": "address"
      }
    ],
    "name": "SetNewOracle",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "actor",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "pkx",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "pky",
        "type": "uint256"
      }
    ],
    "name": "SetNewPublicKey",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "proof",
        "type": "bytes"
      }
    ],
    "name": "decomposeProof",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "signer",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "receiverAddress",
            "type": "address"
          },
          {
            "internalType": "uint96",
            "name": "receiverEpoch",
            "type": "uint96"
          },
          {
            "internalType": "uint256",
            "name": "ecvrfProofDigest",
            "type": "uint256"
          }
        ],
        "internalType": "struct IOrandECDSAV3.OrandECDSAProof",
        "name": "ecdsaProof",
        "type": "tuple"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "fraudProof",
        "type": "bytes"
      },
      {
        "components": [
          {
            "internalType": "uint256[2]",
            "name": "gamma",
            "type": "uint256[2]"
          },
          {
            "internalType": "uint256",
            "name": "c",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "s",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "alpha",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "uWitness",
            "type": "address"
          },
          {
            "internalType": "uint256[2]",
            "name": "cGammaWitness",
            "type": "uint256[2]"
          },
          {
            "internalType": "uint256[2]",
            "name": "sHashWitness",
            "type": "uint256[2]"
          },
          {
            "internalType": "uint256",
            "name": "zInv",
            "type": "uint256"
          }
        ],
        "internalType": "struct IOrandProviderV3.ECVRFProof",
        "name": "ecvrfProof",
        "type": "tuple"
      }
    ],
    "name": "genesis",
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
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "getCurrentEpoch",
    "outputs": [
      {
        "internalType": "uint96",
        "name": "epoch",
        "type": "uint96"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "getCurrentEpochResult",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "result",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getECVRFVerifier",
    "outputs": [
      {
        "internalType": "address",
        "name": "ecvrfVerifier",
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
        "name": "receiver",
        "type": "address"
      },
      {
        "internalType": "uint96",
        "name": "epoch",
        "type": "uint96"
      }
    ],
    "name": "getEpochResult",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "result",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMaximumBatching",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "maxBatchingLimit",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getOperator",
    "outputs": [
      {
        "internalType": "address",
        "name": "operatorAddress",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getOracle",
    "outputs": [
      {
        "internalType": "address",
        "name": "oracleAddress",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPublicKey",
    "outputs": [
      {
        "internalType": "uint256[2]",
        "name": "pubKey",
        "type": "uint256[2]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPublicKeyDigest",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "operator",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "getTotalEpoch",
    "outputs": [
      {
        "internalType": "uint96",
        "name": "epoch",
        "type": "uint96"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[2]",
        "name": "publicKey",
        "type": "uint256[2]"
      },
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "ecvrfAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "oracleAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "maxBatchingLimit",
        "type": "uint256"
      }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
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
        "name": "receiverAddress",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "uint256[2]",
            "name": "gamma",
            "type": "uint256[2]"
          },
          {
            "internalType": "uint256",
            "name": "c",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "s",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "alpha",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "uWitness",
            "type": "address"
          },
          {
            "internalType": "uint256[2]",
            "name": "cGammaWitness",
            "type": "uint256[2]"
          },
          {
            "internalType": "uint256[2]",
            "name": "sHashWitness",
            "type": "uint256[2]"
          },
          {
            "internalType": "uint256",
            "name": "zInv",
            "type": "uint256"
          }
        ],
        "internalType": "struct IOrandProviderV3.ECVRFProof",
        "name": "ecvrfProof",
        "type": "tuple"
      }
    ],
    "name": "publish",
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
        "name": "fraudProof",
        "type": "bytes"
      },
      {
        "components": [
          {
            "internalType": "uint256[2]",
            "name": "gamma",
            "type": "uint256[2]"
          },
          {
            "internalType": "uint256",
            "name": "c",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "s",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "alpha",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "uWitness",
            "type": "address"
          },
          {
            "internalType": "uint256[2]",
            "name": "cGammaWitness",
            "type": "uint256[2]"
          },
          {
            "internalType": "uint256[2]",
            "name": "sHashWitness",
            "type": "uint256[2]"
          },
          {
            "internalType": "uint256",
            "name": "zInv",
            "type": "uint256"
          }
        ],
        "internalType": "struct IOrandProviderV3.ECVRFProof",
        "name": "ecvrfProof",
        "type": "tuple"
      }
    ],
    "name": "publishFraudProof",
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
        "internalType": "uint256",
        "name": "maxBatchingLimit",
        "type": "uint256"
      }
    ],
    "name": "setMaxBatching",
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
        "name": "ecvrfAddress",
        "type": "address"
      }
    ],
    "name": "setNewECVRFVerifier",
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
        "name": "oracleAddress",
        "type": "address"
      }
    ],
    "name": "setNewOracle",
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
        "internalType": "uint256[2]",
        "name": "pk",
        "type": "uint256[2]"
      }
    ],
    "name": "setPublicKey",
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
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "fraudProof",
        "type": "bytes"
      },
      {
        "components": [
          {
            "internalType": "uint256[2]",
            "name": "gamma",
            "type": "uint256[2]"
          },
          {
            "internalType": "uint256",
            "name": "c",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "s",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "alpha",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "uWitness",
            "type": "address"
          },
          {
            "internalType": "uint256[2]",
            "name": "cGammaWitness",
            "type": "uint256[2]"
          },
          {
            "internalType": "uint256[2]",
            "name": "sHashWitness",
            "type": "uint256[2]"
          },
          {
            "internalType": "uint256",
            "name": "zInv",
            "type": "uint256"
          }
        ],
        "internalType": "struct IOrandProviderV3.ECVRFProof",
        "name": "ecvrfProof",
        "type": "tuple"
      }
    ],
    "name": "verifyEpoch",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "signer",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "receiverAddress",
            "type": "address"
          },
          {
            "internalType": "uint96",
            "name": "receiverEpoch",
            "type": "uint96"
          },
          {
            "internalType": "uint256",
            "name": "ecvrfProofDigest",
            "type": "uint256"
          }
        ],
        "internalType": "struct IOrandECDSAV3.OrandECDSAProof",
        "name": "ecdsaProof",
        "type": "tuple"
      },
      {
        "internalType": "uint96",
        "name": "currentEpochNumber",
        "type": "uint96"
      },
      {
        "internalType": "bool",
        "name": "isEpochLinked",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isValidDualProof",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "currentEpochResult",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "verifiedEpochResult",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];