import fs from 'fs';
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DiceGameV3 } from '../typechain-types';
import { getWallet } from '../helpers/wallet';
import { DEPLOYED_CONTRACT_RESULT_PATH } from '../helpers';

task('test:dice-game', 'Test dice game with OrandProviderV3').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { chainId, name } = await hre.ethers.provider.getNetwork();

    // Check DiceGame contract is existed or not
    const deploymentJson = fs.existsSync(DEPLOYED_CONTRACT_RESULT_PATH)
      ? JSON.parse(fs.readFileSync(DEPLOYED_CONTRACT_RESULT_PATH).toString())
      : {};

    if (deploymentJson?.[name]?.DiceGame) {
      const account = await getWallet(hre, chainId);
      const diceGameAddress = deploymentJson?.[name]?.DiceGame;
      const contract = (await hre.ethers.getContractAt('DiceGameV3', diceGameAddress, account)) as DiceGameV3;
      const tx = await (await contract.guessingDiceNumber(Math.round(Math.random() * 5) + 1)).wait(5);
      console.log('Successful guessing a new game', tx);
    } else {
      throw new Error(`Missing DiceGame contract in ${name}`);
    }
  },
);
