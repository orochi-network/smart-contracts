/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '../helpers';
import { OracleV1 } from '../typechain-types';

task('oraclev1:add-operator', 'Add new operator to OracleV1').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const accounts = await hre.ethers.getSigners();
    const deployer: Deployer = Deployer.getInstance(hre).connect(accounts[0]);
    const oracleV1 = await deployer.contractAttach<OracleV1>(
      'OracleV1/OracleV1',
      '0x1b95BCC7828719a4C2Dc74789708b70fE5EEa9Cf',
    );
    await oracleV1.addOperator('0xc4fFb047C1C6600FC82c68376C502bAa72ea2074');
    await oracleV1.addOperator('0x4d8Ebc5601683C5b50dADA3066940e234146C07E');
  },
);

export default {};
