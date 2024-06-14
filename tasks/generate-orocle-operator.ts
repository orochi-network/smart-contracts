/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import fs from 'fs';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ethers } from 'ethers';
import { env } from '../env';

const ENV_PATH = `${__dirname}/../.env`;

task('generate:local-operator', 'Generate operator address only in local network').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    if (hre.network.config.chainId !== 911) {
      throw new Error('Not in local network. Do nothing');
    }
    const { chainId } = hre.network.config;
    const wallet = ethers.Wallet.fromPhrase(env.OROCHI_MNEMONIC);
    const [master] = await hre.ethers.getSigners();

    const dataTable = [0, 1, 2, 3, 4]
      .map((e) => [e, 256 + e])
      .flat()
      .map((child) => {
        const newWallet = wallet.deriveChild(child);
        return {
          path: newWallet.path,
          address: newWallet.address.toLowerCase(),
          chainId,
          childIndex: child,
        };
      })
      .sort((a, b) => a.childIndex - b.childIndex);

    if (!fs.existsSync(ENV_PATH)) {
      throw new Error('.env file not found');
    }

    if (!env.OROCHI_OPERATOR) {
      console.log('Generate new local orocle operator');
      const orochiOperator = `${dataTable[5].address},${dataTable[6].address}`;
      const content = {
        orochiPublicKey: env.OROCHI_PUBLIC_KEY,
        operatorPassphrase: wallet.mnemonic?.phrase.trim(),
        localOrochiOperator: orochiOperator,
        allOperator: dataTable,
        walletCreatedByLocalNode: master.address.toLowerCase(),
      };
      fs.appendFileSync(ENV_PATH, `\nOROCHI_OPERATOR="${orochiOperator}"\n`);
      fs.writeFileSync(env.RESULT_PATH, JSON.stringify(content));
    } else {
      console.log('Local operator existed');
    }
    console.log('Generate operator done');
  },
);
