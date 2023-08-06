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

## License

Orochi Network's source code licensed under [Apache License 2.0](./LICENSE)

_built with ❤️_
