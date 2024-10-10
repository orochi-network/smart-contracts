/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '../helpers';
import { OrocleV1 } from '../typechain-types';
import { env } from '../env';

const OWNER = env.OROCHI_OWNER.trim();
const OPERATORS = env.OROCHI_OPERATOR.split(',').map((op) => op.trim());

task('deploy:oroclev1', 'Deploy Orocle V1 contracts').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    // Setup deployer
    const accounts = await hre.ethers.getSigners();

    const deployer: Deployer = Deployer.getInstance(hre).connect(accounts[0]);
    // Deploy Orocle
    const orocle = await deployer.contractDeploy<OrocleV1>('OrocleV1/OrocleV1', [], OPERATORS);

    await orocle.transferOwnership(OWNER);

    await deployer.printReport();
  },
);
