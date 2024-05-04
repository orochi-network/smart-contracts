/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

task('test:vault', 'Test vault').setAction(async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
  const account = (await hre.ethers.getSigners())[0];
  await account.sendTransaction({
    to: '0xfB377eb55121cbF8142f598cE151595b23eFa4fB',
    value: 100n * 10n ** 18n,
  });

  console.log(await hre.ethers.provider.getBalance('0xfB377eb55121cbF8142f598cE151595b23eFa4fB'));
});

export default {};
