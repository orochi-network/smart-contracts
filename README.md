# Orosign

Orosign is a self-managed custodial service for semi-retails customers that empowers our customers to organize and manage their digital assets.

Orosign is designed for ease of use, even for non-crypto users. You can send, receive or store various cryptocurrencies and digital assets safely and securely with Orosign mobile app.

Orosign allows customers to create their own multisig wallet with minimal cost as well as customize the smart contract to meet their own needs. Off-chain signing and verification are used to secure the signing process. All proofs are verified independently with secp256k1 thus the fund is safe as long as the majority private keys are safe

## Orosign Smart Contracts

Smart Contracts is a part of Orosign project, these smart contracts are using to verify ECDSA proof from off-chain signers.

## Orosign on BNB testnet

```text
[Report for network: bnbtest] --------------------------------------------------------
        test/BigO:                                       0xdeeAdC11B67d0cDcBF2869E74563d84dd21B4631
        OrosignV1/OrosignV1:                             0x7c837e5fF5F4b4d28d6FdfDD3CeCd89584B2E645
        OrosignV1/OrosignMasterV1:                       0x49836B67D2180972e4337Dd2De5d7c47FE3de687
[End of Report for network: bnbtest] -------------------------------------------------
Deployer: 0xD62f6bCc528AAb6D21d63102bE4Fdf60C83dCDE5
```

## A8 Testnet

```
Corresponding address: 0xED6A792F694b7a52E7cf4b7f02dAa41a7c92f362 , is valid publicKey?: true
Deployer: 0x7Ba5A9fA3f3BcCeE36f60F62a6Ef728C3856b8Bb
[Report for network: a8] --------------------------------------------------------
        OrandV2/OrandECVRFV2:                            0x55fFD4A70E3D9ceC75364AfBb4FF349436e1D0B7
        OrandV2/OrandProviderV2:                         0xfB40e49d74b6f00Aad3b055D16b36912051D27EF
        examples/DiceGame:                               0x3fc4344b63fb1AB35a406Cb90ca7310EC8687585
[End of Report for network: a8] -------------------------------------------------
```

## Deployed Smart Contracts

- [0xdeeAdC11B67d0cDcBF2869E74563d84dd21B4631](https://testnet.bscscan.com/address/0xdeeadc11b67d0cdcbf2869e74563d84dd21b4631#code) BigO Test Token
- [0x7c837e5fF5F4b4d28d6FdfDD3CeCd89584B2E645](https://testnet.bscscan.com/address/0x7c837e5fF5F4b4d28d6FdfDD3CeCd89584B2E645#code) OrosignV1 Implement
- [0x49836B67D2180972e4337Dd2De5d7c47FE3de687](https://testnet.bscscan.com/address/0x49836B67D2180972e4337Dd2De5d7c47FE3de687#code) OrosignMasterV1

# Orand

## BNB Chain Testnet

```text
[Report for network: bnbChainTest] --------------------------------------------------------
        OrandV1/OrandECVRF:                              0x6d4e6CFEe923F60c448ED2F9F69eA91C59856017
        OrandV1/OrandProviderV1:                         0x75C0e60Ca5771dd58627ac8c215661d0261D5D76
[End of Report for network: bnbChainTest] -------------------------------------------------
Deployer: 0x23A0944B9a8260964Fa23116D6549625c6bBD50A
```

- [0x6d4e6CFEe923F60c448ED2F9F69eA91C59856017](https://testnet.bscscan.com/address/0x6d4e6CFEe923F60c448ED2F9F69eA91C59856017): OrandECVRF
- [0x75C0e60Ca5771dd58627ac8c215661d0261D5D76](https://testnet.bscscan.com/address/0x75C0e60Ca5771dd58627ac8c215661d0261D5D76): OrandProviderV1
- [0xF16F07cfd6e9Ac06925FCf68dD0b450f4131989D](https://testnet.bscscan.com/address/0xF16F07cfd6e9Ac06925FCf68dD0b450f4131989D): ExampleValidityProofDice

# Installation

You need to install LTS version of NodeJS, the best way is install from `nvm`

https://github.com/nvm-sh/nvm

Install `yarn`

```
npm i -g yarn
```

Install dependencies

```
yarn install
```

To test

```
yarn test
```

## Run a local node & deploy OrocleV2 and OrandProviderV3

1. For the first time, run this script to create your own wallet passphrase. Remember to type your passphrase

```
npx hardhat create:wallet
```

2. Make sure these variables exist in .env file in right format

```
OROCHI_PUBLIC_KEY=""

OROCHI_CORRESPONDING_ADDRESS=""

OROCHI_OWNER=""

OROCHI_MNEMONIC=""

OROCHI_OPERATOR=""

LOCAL_RPC="http://smart-contracts-local-node-1:8545"
```

3. Run docker compose file to create a local node & automatically deploy smart contracts

```
docker compose up -d

```

4. After all docker container successfully created, wait 10 seconds then go below link to check the result or check it via docker logs.

```
http://localhost:8888/result.json
```

On the local node, all operators will receive 100 ETH. Address of local node:

```
http://localhost:8545
```

## License

Orochi Network's source code licensed under [Apache License 2.0](./LICENSE)

_built with ❤️_
