/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '../helpers';
import { OrocleV1 } from '../typechain-types';

function numberToBytes(input: number | bigint, bits: number) {
  return input.toString(16).padStart((bits / 8) * 2, '0');
}

function stringToBytes(input: string, length: number) {
  return Buffer.from(input)
    .toString('hex')
    .padEnd(length * 2, '0');
}

task('deploy:OrocleV1', 'Deploy Orocle V1 contracts').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const accounts = await hre.ethers.getSigners();
    const deployer: Deployer = Deployer.getInstance(hre).connect(accounts[0]);
    const OrocleV1 = await deployer.contractDeploy<OrocleV1>('OrocleV1/OrocleV1', [], [accounts[0]]);
    await OrocleV1.newApplication(`0x${numberToBytes(1, 128)}${stringToBytes('AssetPrice', 16)}`);
    await deployer.printReport();
  },
);

export default {};
