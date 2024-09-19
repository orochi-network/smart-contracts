/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { env } from '../env';
import { getAddress, keccak256 } from 'ethers';
import { getWallet } from '../helpers/wallet';

const PREVIOUS_ORAND_ADDRESS = '0x90028d825C04e85DB045364a956931aF1AF5d5f5';

task('upgrade:orandv3', 'Upgrade OrandV3 contract').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    // Public key
    let pk = env.OROCHI_PUBLIC_KEY.replace(/^0x/gi, '').trim();
    let correspondingAddress = getAddress(`0x${keccak256(`0x${pk.substring(2, 130)}`).substring(26, 66)}`);
    // Get deployer account
    const { chainId } = await hre.ethers.provider.getNetwork();
    const account = await getWallet(hre, chainId);
    const { ethers, upgrades } = hre;
    const OWNER = chainId === 911n ? account.address : env.OROCHI_OWNER.trim();

    //m/44'/60'/0'/0/0
    //m/44'/60'/0'/0/0/0

    const orandProviderV3Factory = (await ethers.getContractFactory('OrandProviderV3')).connect(account);

    // Setup deployer
    console.log('Deployer:', account.address);

    // Prepare upgrade
    console.log('Preparing for the upgrade...');
    await upgrades.prepareUpgrade(PREVIOUS_ORAND_ADDRESS, orandProviderV3Factory);

    // Deploy Provider
    const orandProviderV3Proxy = await upgrades.upgradeProxy(PREVIOUS_ORAND_ADDRESS, orandProviderV3Factory);
    console.log('Upgraded OrandProviderV3 Proxy contract address:', await orandProviderV3Proxy.getAddress());

    console.log(
      `Corresponding address: ${correspondingAddress} , is valid publicKey?:`,
      correspondingAddress === (await orandProviderV3Proxy.getOperator()),
    );

    console.log(
      'Is orand service operator  correct?',
      correspondingAddress === (await orandProviderV3Proxy.getOperator()),
    );
    console.log('Is OrandProviderV2 owner correct?', OWNER === (await orandProviderV3Proxy.owner()));
  },
);
