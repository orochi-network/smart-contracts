/* eslint-disable no-await-in-loop */
import fs from 'fs';
import '@nomiclabs/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '../helpers';
import { OrosignMasterV1, OrosignV1 } from '../typechain-types';

task('deploy:orosign', 'Deploy multi signature v1 contract').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const accounts = await hre.ethers.getSigners();
    const networkName = hre.network.name;
    const deploymentRecord = `${__dirname}/deployed.json`;
    const deployer: Deployer = Deployer.getInstance(hre).connect(accounts[0]);
    let deploymentJson;
    let orosignV1;
    let orosignMasterV1;

    if (fs.existsSync(deploymentRecord)) {
      deploymentJson = JSON.parse(fs.readFileSync(`${__dirname}/deployed.json`).toString());
    } else {
      deploymentJson = {};
    }

    if (typeof deploymentJson[networkName] === 'undefined') {
      deploymentJson[networkName] = {};
    }

    if (typeof deploymentJson[networkName]['orosign'] === 'undefined') {
      orosignV1 = <OrosignV1>await deployer.contractDeploy('OrosignV1/OrosignV1', []);
    } else {
      orosignV1 = <OrosignV1>(
        await deployer.contractAttach('OrosignV1/OrosignV1', deploymentJson[networkName]['orosign'])
      );
      console.log(`OrosignV1 was deployed at ${orosignV1.address}`);
    }

    if (typeof deploymentJson[networkName]['master'] === 'undefined') {
      orosignMasterV1 = <OrosignMasterV1>await deployer.contractDeploy(
        'OrosignV1/OrosignMasterV1',
        [],
        deployer.getChainId(),
        // Assign roles for corresponding address
        ['0x7ED1908819cc4E8382D3fdf145b7e2555A9fb6db', '0x7ED1908819cc4E8382D3fdf145b7e2555A9fb6db'],
        [1, 2],
        // Implementation
        orosignV1.address,
        // Fee
        1000000000000000,
      );
    } else {
      orosignMasterV1 = <OrosignMasterV1>(
        await deployer.contractAttach('OrosignV1/OrosignMasterV1', deploymentJson[networkName]['master'])
      );
      console.log(`OrosignMasterV1 was deployed at ${orosignMasterV1.address}`);
    }

    deploymentJson[networkName] = {
      orosign: orosignV1.address,
      master: orosignMasterV1.address,
    };
    if (networkName !== 'hardhat') {
      fs.writeFileSync(deploymentRecord, JSON.stringify(deploymentJson));
    }
  },
);

export default {};
