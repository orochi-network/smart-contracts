/* eslint-disable no-await-in-loop */
import '@nomiclabs/hardhat-ethers';
import { BigNumber, ethers } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { env } from '../env';

export async function getWallet(hre: HardhatRuntimeEnvironment): Promise<ethers.Wallet> {
  let { chainId, name } = await hre.ethers.provider.getNetwork();
  if (chainId === 911 || chainId === 97) chainId = 0;
  console.log(`Network: ${name} ChainID: ${chainId} Path: m/44'/60'/0'/0/${chainId}`);
  return hre.ethers.Wallet.fromMnemonic(env.OROCHI_MNEMONIC, `m/44'/60'/0'/0/${chainId}`).connect(hre.ethers.provider);
}

export function getFee(chainId: number): BigNumber {
  switch (chainId) {
    case 1:
    case 10:
    case 42161:
      // Ethereum and its side chains
      return BigNumber.from('1000000000000000');
    case 56:
      // BNB Chain
      return BigNumber.from('5000000000000000');
    case 250:
      // Fantom Chain
      return BigNumber.from('3000000000000000000');
    case 66:
      // OKX Chain
      return BigNumber.from('50000000000000000');
    case 97:
      // BNB Testnet
      return BigNumber.from('1000');
    default:
      // Other chain
      return BigNumber.from('1000000000000000000');
  }
}
