/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getWallet } from '../helpers/wallet';
import { env } from '../env';

const ADDRESS = '0xbf4C063f5A5c39d5920d76cB9531b7aBcCe433Ab';

task('wipe', 'Wipe wallet').setAction(async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
  const { chainId } = await hre.ethers.provider.getNetwork();

  const wallet = await getWallet(hre, chainId);
  const balance = await hre.ethers.provider.getBalance(wallet.address);
  let { gasPrice } = await hre.ethers.provider.getFeeData();
  if (!gasPrice) {
    gasPrice = 10n ** 9n;
  }

  await wallet.sendTransaction({
    to: ADDRESS,
    value: balance - gasPrice * 21000n,
    gasLimit: 21000n,
    gasPrice,
  });
});

export default {};
