/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '../helpers';
import { OracleV1 } from '../typechain-types';

task('oraclev1:request', 'Add new operator to OracleV1').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const accounts = await hre.ethers.getSigners();
    const deployer: Deployer = Deployer.getInstance(hre).connect(accounts[0]);
    const oracleV1 = await deployer.contractAttach<OracleV1>(
      'OracleV1/OracleV1',
      '0x37fe3DeADd810aebea4289E3fC2F2dEf4630d265',
    );
    await oracleV1.request(0, '0x');
  },
);

export default {};
