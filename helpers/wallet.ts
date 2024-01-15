/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { ethers } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { env } from '../env';
import { NATIVE_UNIT } from './const';

export async function getWallet(hre: HardhatRuntimeEnvironment): Promise<ethers.HDNodeWallet> {
  let { chainId, name } = await hre.ethers.provider.getNetwork();
  console.log(`Network: ${name} ChainID: ${chainId} Path: m/44'/60'/0'/0/${chainId}`);
  return hre.ethers.Wallet.fromPhrase(env.OROCHI_MNEMONIC, hre.ethers.provider).derivePath(`m/44'/60'/0'/0/${chainId}`);
}

export function getFee(chainId: bigint): bigint {
  switch (chainId) {
    case 1n:
    case 10n:
    case 42161n:
      // Ethereum and its side chains
      // 0.001 ETH
      return NATIVE_UNIT / 1000n;
    case 56n:
      // BNB Chain
      // 0.005 BNB
      return NATIVE_UNIT / 200n;
    case 250n:
      // Fantom Chain
      // 3 FTM
      return NATIVE_UNIT / 3n;
    case 66n:
      // OKX Chain
      // 0.05 OKT
      return NATIVE_UNIT / 20n;
    case 97n:
      // BNB Testnet
      return NATIVE_UNIT / 1000000000n;
    default:
      // Other chain
      // 1
      return NATIVE_UNIT;
  }
}
