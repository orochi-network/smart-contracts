/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '../helpers';
import { OrocleV1 } from '../typechain-types';

task('wipe', 'Add new operator to OrocleV1').setAction(async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
  const accounts = await hre.ethers.getSigners();
  /*
    const deployer: Deployer = Deployer.getInstance(hre).connect(accounts[0]);
    const OrocleV1 = await deployer.contractAttach<OrocleV1>(
      'OrocleV1/OrocleV1',
      '0x37fe3DeADd810aebea4289E3fC2F2dEf4630d265',
    );
    await OrocleV1.request(0, '0x');*/
  console.log(
    await accounts[0].sendTransaction({
      to: '0xCa484B766085992584af778F61579bB29EcE0BC4',
      value: hre.ethers.parseEther('0.04928305'),
    }),
  );
});

export default {};
