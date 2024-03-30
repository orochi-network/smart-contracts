/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '../helpers';
import { Multicast } from '../typechain-types';

task('deploy:multicast', 'Deploy Multicast contracts').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const accounts = await hre.ethers.getSigners();
    //0x3ECb21f2c6A5a57C57634036777730bb6E87F281
    const deployer: Deployer = Deployer.getInstance(hre).connect(accounts[0]);
    await deployer.contractDeploy<Multicast>('orochi/Multicast', []);
    await deployer.printReport();
  },
);

export default {};
