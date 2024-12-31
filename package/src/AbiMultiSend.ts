export const AbiMultiSend = [
  {
    "inputs": [],
    "name": "InsufficientFund",
    "type": "error"
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