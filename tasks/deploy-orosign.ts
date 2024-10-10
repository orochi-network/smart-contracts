/* eslint-disable no-await-in-loop */
import fs from 'fs';
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer, NATIVE_UNIT } from '../helpers';
import { OrosignMasterV1, OrosignV1 } from '../typechain-types';
import { getWallet } from '../helpers/wallet';
import { env } from '../env';

task('deploy:orosign', 'Deploy multi signature v1 contracts').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const networkName = hre.network.name;
    const { chainId } = await hre.ethers.provider.getNetwork();
    const account = await getWallet(hre, chainId);
    const deploymentRecord = `${__dirname}/deployed.json`;
    const deployer: Deployer = Deployer.getInstance(hre).connect(account);
    let deploymentJson;
    let orosignV1: OrosignV1;
    let orosignMasterV1: OrosignMasterV1;

    const balance = await hre.ethers.provider.getBalance(account);

    console.log(`Address: ${account.address} Balance: ${Number((balance * 1000000n) / NATIVE_UNIT) / 1000000}`);

    if (balance === 0n) {
      throw new Error('Insufficient balance');
    }

    if (fs.existsSync(deploymentRecord)) {
      deploymentJson = JSON.parse(fs.readFileSync(deploymentRecord).toString());
    } else {
      deploymentJson = {};
    }

    if (typeof deploymentJson[networkName] === 'undefined') {
      deploymentJson[networkName] = {};
    }

    if (typeof deploymentJson[networkName]['orosign'] === 'undefined') {
      orosignV1 = await deployer.contractDeploy<OrosignV1>('OrosignV1/OrosignV1', []);
    } else {
      orosignV1 = <OrosignV1>(
        await deployer.contractAttach('OrosignV1/OrosignV1', deploymentJson[networkName]['orosign'])
      );
      console.log(`OrosignV1 was deployed at: ${await orosignV1.getAddress()}`);
    }

    if (typeof deploymentJson[networkName]['master'] === 'undefined') {
      if (chainId !== 97n) {
        orosignMasterV1 = <OrosignMasterV1>(
          await deployer.contractDeploy('OrosignV1/OrosignMasterV1', [], orosignV1, env.OROCHI_OWNER)
        );
      } else {
        orosignMasterV1 = <OrosignMasterV1>(
          await deployer.contractDeploy('OrosignV1/OrosignMasterV1', [], orosignV1, env.OROCHI_OWNER)
        );
      }
    } else {
      orosignMasterV1 = <OrosignMasterV1>(
        await deployer.contractAttach('OrosignV1/OrosignMasterV1', deploymentJson[networkName]['master'])
      );
      console.log(`OrosignMasterV1 was deployed at: ${await orosignMasterV1.getAddress()}`);
    }

    await orosignMasterV1.transferOwnership(env.OROCHI_OWNER);

    deploymentJson[networkName] = {
      orosign: await orosignV1.getAddress(),
      master: await orosignMasterV1.getAddress(),
    };
    if (networkName !== 'hardhat') {
      fs.writeFileSync(deploymentRecord, JSON.stringify(deploymentJson));
    }
  },
);
