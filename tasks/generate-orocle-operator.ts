/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import fs from 'fs';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ethers } from 'ethers';
import { env } from '../env';

const envPath = '.env';
const resultPath = './output/result.json';

task('generate:local-operator', 'Generate operator address only in local network').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    if (hre.network.config.chainId !== 911) {
      throw new Error('Not in local network. Do nothing');
    }
    const { chainId } = hre.network.config;
    const dataTable = [];
    const wallet = ethers.Wallet.createRandom();
    const [master] = await hre.ethers.getSigners();
    const orandAppId = 0; // Orand Operator

    for (let i = 0; i < 5; i += 1) {
      const childIndex = orandAppId * 256 + i;
      const newWallet = wallet.derivePath(`${chainId}/${childIndex}`);
      dataTable.push({
        path: newWallet.path,
        address: (await newWallet.getAddress()).toLowerCase(),
      });
    }
    const assetPriceAppId = 1;
    for (let i = 0; i < 5; i += 1) {
      const childIndex = assetPriceAppId * 256 + i;
      const newWallet = wallet.derivePath(`${chainId}/${childIndex}`);
      dataTable.push({
        path: newWallet.path,
        address: (await newWallet.getAddress()).toLowerCase(),
      });
    }

    const fileContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
    if (fileContent.indexOf('LOCAL_OROCHI_OPERATOR') === -1) {
      console.log('Generate new local orocle operator');
      const orochiOperator = `${dataTable[5].address},${dataTable[6].address}`;
      const content = {
        orochiPublicKey: env.OROCHI_PUBLIC_KEY,
        operatorPassphrase: wallet.mnemonic?.phrase.trim(),
        localOrochiOperator: orochiOperator,
        allOperator: dataTable,
        walletCreatedByLocalNode: await master.getAddress(),
      };
      fs.appendFileSync(envPath, `\nLOCAL_OROCHI_OPERATOR="${orochiOperator}"\n`);
      fs.writeFileSync(resultPath, JSON.stringify(content));
      console.table(dataTable);
    } else {
      console.log('Local operator existed');
    }
    console.log('Generate operator done');
  },
);
