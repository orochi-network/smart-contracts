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
      '0xD7a2643c1d9C3E6069f90DbAabd9D58825C7A2b9', // provider
      '0xd26Ea014930305B498C5826cF0712F877CCAF93f', // orocle
    );
    await deployer.printReport();
  },
);

export default {};
