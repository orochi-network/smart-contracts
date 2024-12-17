export const AbiMultiSend = [
  {
    "inputs": [],
    "name": "InsufficientFund",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      }
    ],
    "name": "BalanceUpdate",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "recipientList",
        "type": "address[]"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "multiSend",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];