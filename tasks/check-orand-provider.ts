/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { OrandProviderV3 } from '../typechain-types';

task('check:orand', 'Check orand provider public key').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const contract = (await hre.ethers.getContractAt(
      'OrandProviderV3',
      '0x50C72F5bea0757c8052daa6402568d4bbf2336Fb',
    )) as OrandProviderV3;

    console.log(await contract.getPublicKey());
  },
);
