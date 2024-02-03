/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '../helpers';
import { OrandECVRFV2 } from '../typechain-types';

task('deploy:oraclev1', 'Deploy Oracle V1 contracts').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const accounts = await hre.ethers.getSigners();
    const deployer: Deployer = Deployer.getInstance(hre).connect(accounts[0]);
    await deployer.contractDeploy<OrandECVRFV2>('OracleV1/OracleV1', [], [accounts[0]]);
    await deployer.printReport();
  },
);

export default {};
