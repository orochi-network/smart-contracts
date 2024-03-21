#!/usr/bin/env bash

npx hardhat flatten ./contracts/orocle-v1/OrocleV1.sol > /home/chiro/Github/remix/contracts/OrocleV1.sol 
npx hardhat flatten ./contracts/orand-v2/OrandProviderV2.sol > /home/chiro/Github/remix/contracts/OrandProviderV2.sol
npx hardhat flatten ./contracts/orand-v2/OrandECVRFV2.sol > /home/chiro/Github/remix/contracts/OrandECVRFV2.sol
npx hardhat flatten ./contracts/examples/DiceGame.sol > /home/chiro/Github/remix/contracts/DiceGame.sol
npx hardhat flatten ./contracts/orosign/OrosignV1.sol > /home/chiro/Github/remix/contracts/OrosignV1.sol
npx hardhat flatten ./contracts/orosign/OrosignMasterV1.sol > /home/chiro/Github/remix/contracts/OrosignMasterV1.sol
npx hardhat flatten ./contracts/orocle-v1/OrocleV1.sol ./contracts/orand-v2/OrandProviderV2.sol ./contracts/orand-v2/OrandECVRFV2.sol > /home/chiro/Github/remix/contracts/OrocleV1All.sol