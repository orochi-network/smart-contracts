/* eslint-disable no-await-in-loop */
import '@nomiclabs/hardhat-ethers';
import { BigNumber, ethers } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { env } from '../env';
import { NATIVE_UNIT } from './const';

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
      // 0.001 ETH
      return BigNumber.from(NATIVE_UNIT).div(1000);
    case 56:
      // BNB Chain
      // 0.005 BNB
      return BigNumber.from(NATIVE_UNIT).div(200);
    case 250:
      // Fantom Chain
      // 3 FTM
      return BigNumber.from(NATIVE_UNIT).mul(3);
    case 66:
      // OKX Chain
      // 0.05 OKT
      return BigNumber.from(NATIVE_UNIT).div(20);
    case 97:
      // BNB Testnet
      return BigNumber.from(NATIVE_UNIT).div(1000000000);
    default:
      // Other chain
      // 1
      return BigNumber.from(NATIVE_UNIT);
  }
}
