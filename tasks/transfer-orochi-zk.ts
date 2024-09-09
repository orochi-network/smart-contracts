/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import '@matterlabs/hardhat-zksync-node/dist/type-extensions';
import '@matterlabs/hardhat-zksync-upgradable';
import '@matterlabs/hardhat-zksync-verify/dist/src/type-extensions';
import '@nomicfoundation/hardhat-ethers';
import { Deployer } from '@matterlabs/hardhat-zksync';
import { getAddress, isAddress, keccak256 } from 'ethers';
import { task } from 'hardhat/config';
import { Provider } from 'zksync-ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { env } from '../env';

import { GAS_LIMIT_IN_GAS_LESS_BLOCKCHAIN } from './deploy-orochi-network';
import EthJsonRpc from '../helpers/provider';
import { getWallet, getZkSyncWallet } from '../helpers/wallet';
import { OrandProviderV3, OrocleV2 } from '../typechain-types';

// CHANGE OROCLE & ORAND ADDRESS BEFORE RUN THIS TASK
const OROCLE_V2_ADDRESS = '0x4e12287584A3a506755f8212311f6165336f98a9';
const ORAND_PROVIDER_ADDRESS = '0x29ca057761732432bcA26109A291291a365755b4';

const sleep = async (seconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

const OPERATORS = env.OROCHI_OPERATOR.split(',').map((op) => op.trim());

task('transfer:orochi-owner', 'Transfer orocle & orand ownership with zkSolc').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    if (!hre.network.config.chainId) {
      throw new Error('Invalid chainId');
    }
    const provider = new Provider(hre.network.config.url);
    const { chainId } = await provider.getNetwork();
    const wallet = await getWallet(hre, chainId);

    const account = getZkSyncWallet(wallet, provider);
    const deployer = new Deployer(hre, account);
    console.log('Deployer:', deployer.zkWallet.address);

    let pk = env.OROCHI_PUBLIC_KEY.replace(/^0x/gi, '').trim();
    let correspondingAddress = getAddress(`0x${keccak256(`0x${pk.substring(2, 130)}`).substring(26, 66)}`);

    const gasOverrides =
      account.provider instanceof EthJsonRpc && account.provider.isGasLessBlockchain
        ? {
            gasLimit: GAS_LIMIT_IN_GAS_LESS_BLOCKCHAIN,
          }
        : {};

    const { ethers, upgrades } = hre;
    const OWNER = chainId === 911n ? account.address : env.OROCHI_OWNER.trim();

    // Check owner and operators
    if (!isAddress(OWNER)) {
      throw new Error('Invalid owner address');
    }
    console.log('Owner:', OWNER);

    // Load deployed OrocleV2 & OrandProviderV3 contract

    const orocleV2Proxy = (await hre.ethers.getContractFactory('OrocleV2')).attach(OROCLE_V2_ADDRESS) as OrocleV2;

    (await orocleV2Proxy.transferOwnership(OWNER, { gasLimit: gasOverrides.gasLimit })).wait();

    console.log('Transfer orocleV2Proxy successfully');
    await sleep(10);

    let nonce = await ethers.provider.getTransactionCount(account.address);
    console.log('🚀 ~ nonce:', nonce);
    await upgrades.admin
      .transferProxyAdminOwnership(await orocleV2Proxy.getAddress(), OWNER, account, {
        silent: false,
        txOverrides: {
          nonce: nonce + 1,
          gasLimit: gasOverrides.gasLimit,
        },
      })
      .then();
    nonce = nonce + 3;
    await sleep(10);

    const orandProviderV3Proxy = (await hre.ethers.getContractFactory('OrandProviderV3')).attach(
      ORAND_PROVIDER_ADDRESS,
    ) as OrandProviderV3;

    (await orandProviderV3Proxy.transferOwnership(OWNER, { gasLimit: gasOverrides.gasLimit })).wait();

    await sleep(10);

    await upgrades.admin.transferProxyAdminOwnership(await orandProviderV3Proxy.getAddress(), OWNER, account, {
      silent: false,
      txOverrides: {
        nonce,
        gasLimit: gasOverrides.gasLimit,
      },
    });

    console.log(
      `Corresponding address: ${correspondingAddress} , is valid publicKey?:`,
      correspondingAddress === (await orandProviderV3Proxy.getOperator()),
    );

    console.log(
      'Is Oracle deployed correct?',
      (await orocleV2Proxy.getAddress()) === (await orandProviderV3Proxy.getOracle()),
    );
    console.log(
      'Is orand service operator correct?',
      correspondingAddress === (await orandProviderV3Proxy.getOperator()),
    );
    console.log('Is OrocleV2 operator correct?', await orocleV2Proxy.isOperator(OPERATORS[0]));
    console.log('Is OrocleV2 operator correct?', await orocleV2Proxy.isOperator(OPERATORS[1]));
    console.log('Is OrocleV2 owner correct?', OWNER === (await orocleV2Proxy.owner()));
    console.log('Is OrandProviderV3 owner correct?', OWNER === (await orandProviderV3Proxy.owner()));
  },
);

export default {};
