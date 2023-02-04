/* eslint-disable no-await-in-loop */
import '@nomiclabs/hardhat-ethers';
import { BigNumber, utils } from 'ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer, NATIVE_UNIT, printAllEvents } from '../helpers';
import { OrosignMasterV1, OrosignV1 } from '../typechain-types';
import { env } from '../env';
import { ethers } from 'hardhat';

task('deploy:orosign', 'Deploy multi signature v1 contract').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const accounts = await hre.ethers.getSigners();

    const deployer: Deployer = Deployer.getInstance(hre).connect(accounts[0]);
    // const bigOToken = await deployer.contractDeploy('test/BigO', []);
    const orosignV1 = <OrosignV1>await deployer.contractDeploy('OrosignV1/OrosignV1', []);
    const orosignMaster = <OrosignMasterV1>await deployer.contractDeploy(
      'OrosignV1/OrosignMasterV1',
      [],
      deployer.getChainId(),
      // Assign roles for corresponding address
      [accounts[0].address, accounts[0].address],
      [1, 2],
      // Implementation
      orosignV1.address,
      // Fee
      0,
    );

    deployer.printReport();
  },
);

export default {};
