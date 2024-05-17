/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '../helpers';
import { DiceGameV3 } from '../typechain-types';

task('deploy:dice-game-v3', 'Deploy dice game contracts').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const accounts = await hre.ethers.getSigners();
    //0x3ECb21f2c6A5a57C57634036777730bb6E87F281
    const deployer: Deployer = Deployer.getInstance(hre).connect(accounts[0]);
    await deployer.contractDeploy<DiceGameV3>(
      'orochi/DiceGameV3',
      [],
      '0x3eAF9da360dA944105599cdB7833712346af6DF1',
      '0x70523434ee6a9870410960E2615406f8F9850676',
    );
    await deployer.printReport();
  },
);

export default {};
