/* eslint-disable no-await-in-loop */
import '@nomiclabs/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { env } from '../env';
import { ethers } from 'ethers';

async function getWallet(hre: HardhatRuntimeEnvironment): Promise<ethers.Wallet> {
  const { chainId, name } = await hre.ethers.provider.getNetwork();
  console.log(`Network: ${name} ChainID: ${chainId} Path: m/44'/60'/0'/0/${chainId}`);
  return hre.ethers.Wallet.fromMnemonic(env.OROCHI_MNEMONIC, `m/44'/60'/0'/0/${chainId}`).connect(hre.ethers.provider);
}

task('deploy:account', 'Get list of accounts').setAction(async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
  const wallet = await getWallet(hre);
  console.log(await wallet.getAddress());
});

export default {};
