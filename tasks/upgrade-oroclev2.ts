/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { env } from '../env';
import { getAddress, keccak256 } from 'ethers';
import { getWallet } from '../helpers/wallet';

const PREVIOUS_ORACLE_ADDRESS = '0x2416Ec1d62bE2715A4902d0737efe38A92c95394';
const OPERATORS = env.OROCHI_OPERATOR.split(',').map((op) => op.trim());

task('upgrade:oroclev2', 'Upgrade OrocleV2 contract').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    // Get deployer account
    const { chainId } = await hre.ethers.provider.getNetwork();
    const account = await getWallet(hre, chainId);
    const { ethers, upgrades } = hre;
    const OWNER = chainId === 911n ? account.address : env.OROCHI_OWNER.trim();

    // Check owner and operators
    console.log('Owner:', OWNER);

    //m/44'/60'/0'/0/0
    //m/44'/60'/0'/0/0/0

    const orocleV2Factory = (await ethers.getContractFactory('OrocleV2')).connect(account);

    console.log('Preparing for the upgrade...');
    await upgrades.prepareUpgrade(PREVIOUS_ORACLE_ADDRESS, orocleV2Factory);

    // Setup deployer
    console.log('Deployer:', account.address);

    // Deploy Orocle
    const orocleV2Proxy = await upgrades.upgradeProxy(PREVIOUS_ORACLE_ADDRESS, orocleV2Factory);
    await orocleV2Proxy.waitForDeployment();
    console.log('Upgraded Orocle Proxy contract address:', await orocleV2Proxy.getAddress());

    console.log('Is OrocleV1 operator correct?', await orocleV2Proxy.isOperator(OPERATORS[0]));
    console.log('Is OrocleV1 operator correct?', await orocleV2Proxy.isOperator(OPERATORS[1]));
    console.log('Is OrocleV1 owner correct?', OWNER === (await orocleV2Proxy.owner()));
  },
);

export default {};
