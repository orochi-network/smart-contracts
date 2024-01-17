/* eslint-disable no-await-in-loop */
import fs from 'fs';
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer, NATIVE_UNIT } from '../helpers';
import { OrosignMasterV1 } from '../typechain-types';
import { getWallet } from '../helpers/wallet';

task('orosign:collect', 'Collecting fee from master').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const account = await getWallet(hre);
    const networkName = hre.network.name;
    const deploymentRecord = `${__dirname}/deployed.json`;
    const deployer: Deployer = Deployer.getInstance(hre).connect(account);
    let deploymentJson;
    let orosignMasterV1;

    if (fs.existsSync(deploymentRecord)) {
      deploymentJson = JSON.parse(fs.readFileSync(`${__dirname}/deployed.json`).toString());
    } else {
      deploymentJson = {};
    }

    if (typeof deploymentJson[networkName] === 'undefined') {
      deploymentJson[networkName] = {};
    }

    if (typeof deploymentJson[networkName]['master'] !== 'undefined') {
      orosignMasterV1 = <OrosignMasterV1>(
        await deployer.contractAttach('OrosignV1/OrosignMasterV1', deploymentJson[networkName]['master'])
      );
      console.log(`OrosignMasterV1 was deployed at ${orosignMasterV1.address}`);
      const { implementation, walletFee, chainId } = await orosignMasterV1.getMetadata();
      console.log(
        `Implementation: ${implementation}\nWallet Fee: ${walletFee.toString()}\nChain ID: ${chainId.toNumber()}`,
      );
      console.log(await orosignMasterV1.connect(account).withdraw(account.address));
      console.log((await hre.ethers.provider.getBalance(orosignMasterV1.address)).toString());
    }
  },
);

export default {};
