/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DiceGameV3, OrandProviderV3 } from '../typechain-types';
import { OrandProviderV2 } from '../package/src';

task('test:dice-game-v3', 'Test vault').setAction(async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
  const account = (await hre.ethers.getSigners())[0];
  const contract = (await hre.ethers.getContractAt(
    'DiceGameV3',
    '0x57abA949de504cE2c1D55cBB919A5e8233b40c60',
  )) as DiceGameV3;
  // console.log('🚀 ~ task ~ contract:', contract);

  const tx = await contract.connect(account).guessingDiceNumber(2);
  console.log('🚀 ~ task ~ tx:', tx);
});

export default {};
