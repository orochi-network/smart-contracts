/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { Wallet, ethers } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { env } from '../env';

export async function getWallet(hre: HardhatRuntimeEnvironment, chainId: bigint): Promise<ethers.HDNodeWallet> {
  if (chainId === 911n) {
    const wallet = (await hre.ethers.getSigners())[0];
    console.log(
      `ChainID: ${chainId.toString().padEnd(16, ' ')} Address: ${wallet.address} Path: m/44'/60'/0'/0/${chainId}`,
    );
    return wallet as any;
  } else {
    const wallet = Wallet.fromPhrase(env.OROCHI_MNEMONIC.trim(), hre.ethers.provider).deriveChild(chainId);
    console.log(`ChainID: ${chainId.toString().padEnd(16, ' ')} Address: ${wallet.address} Path: ${wallet.path}`);
    return wallet;
  }
}
