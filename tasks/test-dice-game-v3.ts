import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DiceGameV3 } from '../typechain-types';

const DICE_GAME_CONTRACT_ADDRESS = '0x57abA949de504cE2c1D55cBB919A5e8233b40c60';

task('test:dice-game-v3', 'Test dice game with OrandProviderV3').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const account = (await hre.ethers.getSigners())[0];
    const contract = (await hre.ethers.getContractAt('DiceGameV3', DICE_GAME_CONTRACT_ADDRESS)) as DiceGameV3;
    const tx = await contract.connect(account).guessingDiceNumber(2);
    console.log('Successful transaction', tx);
  },
);

export default {};
