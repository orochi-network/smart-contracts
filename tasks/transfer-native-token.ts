/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { parseEther } from 'ethers';
import fs from 'fs';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getWallet } from '../helpers/wallet';

// REMEMBER TO CHANGE THESE VALUES BELOW
const OPERATOR_ADDRESS = '';
const AMOUNT_IN_ETH = '';

task('transfer:native-token', 'Transfer native token to operator').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { chainId } = await hre.ethers.provider.getNetwork();
    const account = await getWallet(hre, chainId);
    const tx = await account.sendTransaction({
      to: OPERATOR_ADDRESS,
      value: parseEther(AMOUNT_IN_ETH),
    });
    await tx.wait();
    console.log(`Transaction successful with hash: ${tx.hash}`);
  },
);
