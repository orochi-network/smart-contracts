/* eslint-disable no-await-in-loop */
import '@nomiclabs/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getFee, getWallet } from '../helpers/wallet';

task('deploy:account', 'Get list of accounts').setAction(async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
  const wallet = await getWallet(hre);
  const networkData = await hre.ethers.provider.getNetwork();
  console.log(networkData, await wallet.getAddress());
  console.log((await getFee(networkData.chainId)).toString());
});

export default {};
