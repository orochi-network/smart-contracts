/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import fs from 'fs';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ethers } from 'ethers';
import { env } from '../env';

const ENV_PATH = `${__dirname}/../.env`;
const RESULT_PATH = `${__dirname}/../output/result.json`;
const ORAND_APP_ID = 0;
const ASSET_PRICE_APP_ID = 1;

task('generate:local-operator', 'Generate operator address only in local network').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    if (hre.network.config.chainId !== 911) {
      throw new Error('Not in local network. Do nothing');
    }
    const { chainId } = hre.network.config;
    const dataTable = [];
    const wallet = ethers.Wallet.createRandom();
    const [master] = await hre.ethers.getSigners();

    for (let i = 0; i < 5; i += 1) {
      const childOrandId = ORAND_APP_ID * 256 + i;
      const childAssetPriceId = ASSET_PRICE_APP_ID * 256 + i;
      const orandWallet = wallet.derivePath(`${chainId}/${childOrandId}`);
      const assetPriceWallet = wallet.derivePath(`${chainId}/${childAssetPriceId}`);
      dataTable.push({
        path: orandWallet.path,
        address: orandWallet.address.toLowerCase(),
        chainId,
        childIndex: childOrandId,
      });
      dataTable.push({
        path: assetPriceWallet.path,
        address: assetPriceWallet.address.toLowerCase(),
        chainId,
        childIndex: childAssetPriceId,
      });
    }

    const sortDataTable = dataTable.sort((a, b) => {
      return a.childIndex - b.childIndex;
    });

    if (!fs.existsSync(ENV_PATH)) {
      throw new Error('.env file not found');
    }

    const fileContent = fs.readFileSync(ENV_PATH, 'utf-8');
    if (fileContent.indexOf('LOCAL_OROCHI_OPERATOR') === -1) {
      console.log('Generate new local orocle operator');
      const orochiOperator = `${sortDataTable[5].address},${sortDataTable[6].address}`;
      const content = {
        orochiPublicKey: env.OROCHI_PUBLIC_KEY,
        operatorPassphrase: wallet.mnemonic?.phrase.trim(),
        localOrochiOperator: orochiOperator,
        allOperator: sortDataTable,
        walletCreatedByLocalNode: master.address.toLowerCase(),
      };
      fs.appendFileSync(ENV_PATH, `\nLOCAL_OROCHI_OPERATOR="${orochiOperator}"\n`);
      fs.writeFileSync(RESULT_PATH, JSON.stringify(content));
      console.table(sortDataTable);
    } else {
      console.log('Local operator existed');
    }
    console.log('Generate operator done');
  },
);
