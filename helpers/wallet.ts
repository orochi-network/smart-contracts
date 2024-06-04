/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { HDNodeWallet, Wallet, ethers } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Wallet as zkSyncWallet, Provider } from 'zksync-ethers';
import { env } from '../env';
import EncryptionKey from './encryption';
import EthJsonRpc from './provider';

export const CHAIN_NEED_CUSTOM_PROVIDER = [196n, 7225878n];
export const GAS_LESS_BLOCK_CHAIN = [7225878n];

export function getZkSyncWallet(wallet: HDNodeWallet, provider: Provider) {
  return new zkSyncWallet(wallet.privateKey, provider);
}

export async function getWallet(hre: HardhatRuntimeEnvironment, chainId: bigint): Promise<HDNodeWallet> {
  if (chainId === 911n) {
    const wallet = (await hre.ethers.getSigners())[0] as any;
    console.log(
      `ChainID: ${chainId.toString().padEnd(16, ' ')} Address: ${wallet.address} Path: m/44'/60'/0'/0/${chainId}`,
    );
    return wallet;
  } else {
    if (!hre.network.config.chainId) {
      throw new Error('Invalid chainId');
    }

    const needCustomProvider = CHAIN_NEED_CUSTOM_PROVIDER.includes(chainId);
    const isGasLessBlockchain = CHAIN_NEED_CUSTOM_PROVIDER.includes(chainId);
    const provider = needCustomProvider
      ? new EthJsonRpc(hre.network.config.url, undefined, undefined, isGasLessBlockchain)
      : hre.ethers.provider;
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
    return needCustomProvider ? wallet.connect(provider) : wallet;
  }
}
