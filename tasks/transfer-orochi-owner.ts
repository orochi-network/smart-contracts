/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { getAddress, isAddress, keccak256 } from 'ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { env } from '../env';
import { getWallet } from '../helpers/wallet';
import { OrandProviderV3, OrocleV2 } from '../typechain-types';
import { GAS_LIMIT_IN_GAS_LESS_BLOCKCHAIN } from './deploy-orochi-network';
import EthJsonRpc from '../helpers/provider';

const OPERATORS = env.OROCHI_OPERATOR.split(',').map((op) => op.trim());

// CHANGE OROCLE & ORAND ADDRESS BEFORE RUN THIS TASK
const OROCLE_V2_ADDRESS = '0xfa59E81714BE6A453057A76DAF7Cb619B05CD877';
const ORAND_PROVIDER_ADDRESS = '0x0370D689959Bc692D0C46C41Bdd2Bc4B22599Ef0';

const sleep = async (seconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

task('transfer:orochi-owner', 'Transfer orocle & orand ownership').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    if (!hre.network.config.chainId) {
      throw new Error('Invalid chainId');
    }

    let pk = env.OROCHI_PUBLIC_KEY.replace(/^0x/gi, '').trim();
    const { chainId } = await hre.ethers.provider.getNetwork();
    const account = await getWallet(hre, chainId);
    if (!account.provider) {
      throw new Error('Invalid provider');
    }
    const txOverrides =
      account.provider instanceof EthJsonRpc && account.provider.isGasLessBlockchain
        ? {
            gasLimit: GAS_LIMIT_IN_GAS_LESS_BLOCKCHAIN,
          }
        : {};

    let correspondingAddress = getAddress(`0x${keccak256(`0x${pk.substring(2, 130)}`).substring(26, 66)}`);
    const { ethers, upgrades } = hre;
    const OWNER = chainId === 911n ? account.address : env.OROCHI_OWNER.trim();

    // Check owner and operators
    if (!isAddress(OWNER)) {
      throw new Error('Invalid owner address');
    }
    console.log('Owner:', OWNER);

    const orocleV2Proxy = (await hre.ethers.getContractAt('OrocleV2', OROCLE_V2_ADDRESS, account)) as OrocleV2;
    const orandProviderV3Proxy = (await hre.ethers.getContractAt(
      'OrandProviderV3',
      ORAND_PROVIDER_ADDRESS,
      account,
    )) as OrandProviderV3;

    console.log('Deployer:', account.address);

    /*
      constructor(
        uint256[2] memory publicKey,
        address operator,
        address ecvrfAddress,
        address oracleAddress,
        uint256 maxBatchingLimit
      )
    */
    // Deploy Provider
    (await orocleV2Proxy.transferOwnership(OWNER, txOverrides)).wait();

    console.log('Transfer orocleV2Proxy successfully');
    await sleep(10);

    let nonce = await ethers.provider.getTransactionCount(account.address);
    console.log('🚀 ~ nonce:', nonce);
    await upgrades.admin
      .transferProxyAdminOwnership(await orocleV2Proxy.getAddress(), OWNER, account, {
        silent: false,
        txOverrides: {
          nonce: nonce + 1,
          gasLimit: txOverrides.gasLimit,
        },
      })
      .then();
    nonce = nonce + 3;
    await sleep(10);

    (await orandProviderV3Proxy.transferOwnership(OWNER, txOverrides)).wait();

    await sleep(10);

    await upgrades.admin.transferProxyAdminOwnership(await orandProviderV3Proxy.getAddress(), OWNER, account, {
      silent: false,
      txOverrides: {
        nonce,
        gasLimit: txOverrides.gasLimit,
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
