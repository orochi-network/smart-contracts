/* eslint-disable no-await-in-loop */
import fs from 'fs';
import '@nomiclabs/hardhat-ethers';
import { task } from 'hardhat/config';
import { BigNumber, ethers } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer, NATIVE_UNIT } from '../helpers';
import { OrosignMasterV1, OrosignV1 } from '../typechain-types';
import { env } from '../env';

async function getWallet(hre: HardhatRuntimeEnvironment): Promise<ethers.Wallet> {
  let { chainId, name } = await hre.ethers.provider.getNetwork();
  if (chainId === 911) chainId = 0;
  console.log(`Network: ${name} ChainID: ${chainId} Path: m/44'/60'/0'/0/${chainId}`);
  return hre.ethers.Wallet.fromMnemonic(env.OROCHI_MNEMONIC, `m/44'/60'/0'/0/${chainId}`).connect(hre.ethers.provider);
}

function getFee(chainId: number): BigNumber {
  switch (chainId) {
    case 1:
    case 42161:
      return BigNumber.from('1000000000000000');
    case 56:
      return BigNumber.from('5000000000000000');
    default:
      return BigNumber.from('1000000000000000000');
  }
}

task('deploy:orosign', 'Deploy multi signature v1 contracts').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const account = await getWallet(hre);
    const networkName = hre.network.name;
    const { chainId } = await hre.ethers.provider.getNetwork();
    const deploymentRecord = `${__dirname}/deployed.json`;
    const deployer: Deployer = Deployer.getInstance(hre).connect(account);
    let deploymentJson;
    let orosignV1;
    let orosignMasterV1;
    const balance = await account.getBalance();

    console.log(`Address: ${account.address} Balance: ${balance.div(NATIVE_UNIT).toString()}`);
    console.log(`Wallet Fee: ${getFee(chainId).mul(1000000).div(NATIVE_UNIT).toNumber() / 1000000}`);

    if (balance.eq(0)) {
      throw new Error('Insufficient balance');
    }

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
        chainId,
        // Assign roles for corresponding address
        ['0x7ED1908819cc4E8382D3fdf145b7e2555A9fb6db', '0x7ED1908819cc4E8382D3fdf145b7e2555A9fb6db'],
        [1, 2],
        // Implementation
        orosignV1.address,
        // Fee
        getFee(chainId),
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
