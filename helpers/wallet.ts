/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { HDNodeWallet, Wallet, ethers } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Wallet as zkSyncWallet, Provider } from 'zksync-ethers';
import { env } from '../env';
import EncryptionKey from './encryption';

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
    const aes = await EncryptionKey.getInstance();
    const masterWallet = Wallet.fromPhrase(
      aes.decrypt(Buffer.from(env.OROCHI_ENCRYPTED_PASSPHRASE, 'base64')).toString('utf-8'),
      hre.ethers.provider,
    );
    console.log('Recovered master wallet:', masterWallet.address, 'path:', masterWallet.path);
    const wallet = masterWallet.deriveChild(chainId);
    console.log(
      `--------------------
Deployer's Wallet > ChainID: ${chainId.toString().padEnd(16, ' ')} Address: ${wallet.address} Path: ${wallet.path}`,
    );
    return wallet;
  }
}
