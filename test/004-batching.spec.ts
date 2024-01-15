import hre from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { OrandECVRF } from '../typechain-types';
import { Deployer } from '../helpers';
import { ExampleValidityProofDice } from '../typechain-types/';

let deployerSigner: SignerWithAddress;
let orandECVRF: OrandECVRF;
let exampleDice: ExampleValidityProofDice;
let deployer: Deployer;
let player: SignerWithAddress;

describe('ExampleValidityDice', function () {
  it('orand proof must be correct', async () => {
    [deployerSigner, player] = await hre.ethers.getSigners();
    deployer = Deployer.getInstance(hre).connect(deployerSigner);
    exampleDice = <ExampleValidityProofDice>(
      await deployer.contractDeploy('test/ExampleValidityProofDice', [], deployerSigner.address, 50)
    );
  });

  it('any player could able to guess the dice number', async () => {
    for (let i = 0; i < 302; i++) {
      const diceNumber = (Math.round(Math.random() * 100) % 6) + 1;
      await exampleDice.connect(player).guessingDiceNumber(diceNumber);
    }
  });

  it('provider should able batching results', async () => {
    let [fulfilled, totalGame] = await exampleDice.getStateOfGame();
    while (fulfilled < totalGame - 1n) {
      await exampleDice
        .connect(deployerSigner)
        .consumeRandomness('0x0e1e7e382020781f47c56cb161fbd088729bbf977792e8c149a496400f07d31f');
      [fulfilled, totalGame] = await exampleDice.getStateOfGame();
    }

    expect(fulfilled).eq(totalGame - 1n);
  });
});
