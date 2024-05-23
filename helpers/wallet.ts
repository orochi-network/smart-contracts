/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { HDNodeWallet, Wallet, ethers } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Wallet as zkSyncWallet, Provider } from 'zksync-ethers';
import { env } from '../env';

export function getZkSyncWallet(wallet: HDNodeWallet, provider: Provider) {
  return new zkSyncWallet(wallet.privateKey);
}

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
