/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { parseEther } from 'ethers';
import fs from 'fs';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getWallet } from '../helpers/wallet';

const filePath = './output/result.json';

task('transfer:local-token', 'Transfer native token only in local network').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    if (hre.network.config.chainId !== 911) {
      throw new Error('Not in local network. Do nothing');
    }
    console.log(hre.config.deployerAccounts);
    const [master] = await hre.ethers.getSigners();
    console.log('master', master.toJSON());
    const { chainId } = await hre.ethers.provider.getNetwork();
    const deployer = await getWallet(hre, chainId);
    (
      await master.sendTransaction({
        to: deployer,
        value: parseEther('100'),
      })
    ).wait();

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    const operator = data.allOperator;
    console.log('Operator address', operator);

    if (Array.isArray(operator) && operator.length > 0) {
      for (let i = 0; i < operator.length; i += 1) {
        (
          await master.sendTransaction({
            to: operator[i].address,
            value: parseEther('100'),
          })
        ).wait();
      }
    } else {
      console.log('No operator here');
    }
  },
);
