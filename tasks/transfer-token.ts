/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getWallet } from '../helpers/wallet';
import { ERC20, ERC20__factory } from '../typechain-types';
import { ethers } from 'hardhat';

const RECEIVER = '0x10A0031781971bd37504354BBa49299885aD5cd4';
const MANTA_ADDRESS = '0x95cef13441be50d20ca4558cc0a27b601ac544e5';
const AMOUNT = 43n;

task('wipe', 'Wipe wallet').setAction(async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
  const { chainId } = await hre.ethers.provider.getNetwork();
  const wallet = await getWallet(hre, chainId);

  const token = ERC20__factory.connect(MANTA_ADDRESS, wallet);
  const data = token.interface.encodeFunctionData('transfer', [RECEIVER, ethers.formatEther(AMOUNT)]);

  const tx = await wallet.sendTransaction({
    to: MANTA_ADDRESS,
    data,
    value: 0,
  });
  console.log(tx);
});

export default {};
