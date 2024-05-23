/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getWallet } from '../helpers/wallet';

task('get:account', 'Get accounts').setAction(async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
  const { chainId, name } = await hre.ethers.provider.getNetwork();
  console.log('Chain name:', name);
  await getWallet(hre, chainId);
});

export default {};
