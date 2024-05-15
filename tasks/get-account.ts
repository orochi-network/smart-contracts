/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getWallet } from '../helpers/wallet';

task('get:account', 'Get list of accounts').setAction(async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
  const chains = [1n, 56n, 888888888n, 39n, 97n];
  for (let i = 0; i < chains.length; i += 1) {
    getWallet(hre, chains[i]);
  }
});

export default {};
