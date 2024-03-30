/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { HDNodeWallet, Wallet } from 'ethers';
import { env } from '../env';

task('wipe', 'Wipe token').setAction(async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
  let wallet = Wallet.fromPhrase(env.OROCHI_MNEMONIC).connect(hre.ethers.provider);
  // m/44'/60'/0'/0/0/0	0xA0AA39fAAaCcB5927A4Ffed9fff2B8f0f73CE561
  console.log(wallet.address);
  let wallet2 = HDNodeWallet.fromPhrase(env.OROCHI_MNEMONIC, undefined, `m/44'/60'/0'/0`)
    .deriveChild(0)
    .connect(hre.ethers.provider);
  console.log((await wallet.deriveChild(0)).address);
  console.log('Wa', wallet2.address);
  //  await wallet.sendTransaction({ to: '0xA2096671D4A0939D4D50bd7AAB612883e98B4D47', value: parseEther('4.9959') });
});

export default {};
