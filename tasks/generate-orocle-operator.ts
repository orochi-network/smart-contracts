/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import fs from 'fs';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ethers } from 'ethers';

const envPath = '.env';
const resultPath = './output/result.json';

task('generate:local-operator', 'Generate operator address only in local network').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    if (hre.network.config.chainId !== 911) {
      throw new Error('Not in local network. Do nothing');
    }
    const dataTable = [];
    const wallet = ethers.Wallet.createRandom();
    const [master] = await hre.ethers.getSigners();
    for (let i = 0; i < 5; i += 1) {
      const newWallet = wallet.deriveChild(i);
      dataTable.push({
        path: newWallet.path,
        address: await newWallet.getAddress(),
      });
    }
    for (let i = 100; i < 105; i += 1) {
      const newWallet = wallet.deriveChild(i);
      dataTable.push({
        path: newWallet.path,
        address: await newWallet.getAddress(),
      });
    }
    const fileContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
    if (fileContent.indexOf('LOCAL_OROCHI_OPERATOR') === -1) {
      console.log('Generate new local orocle operator');
      const orochiOperator = `${dataTable[0].address},${dataTable[1].address}`;
      const content = {
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
