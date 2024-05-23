/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { env } from '../env';
import { getAddress, isAddress, keccak256 } from 'ethers';
import { getWallet } from '../helpers/wallet';
import { OrandProviderV3, OrocleV2 } from '../typechain-types';

const OPERATORS = env.OROCHI_OPERATOR.split(',').map((op) => op.trim());

// CHANGE OROCLE & ORAND ADDRESS BEFORE RUN THIS TASK
const OROCLE_V2_ADDRESS = '0xd08b82d793025E4e210D40Dc2298Fd5204835ED7';
const ORAND_PROVIDER_ADDRESS = '0x976b1E268D0b06540d3428b5970cA0c3e17eE315';

const sleep = async (seconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

task('transfer:orochi-owner', 'Transfer orocle & orand ownership').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    let pk = env.OROCHI_PUBLIC_KEY.replace(/^0x/gi, '').trim();
    const { chainId } = await hre.ethers.provider.getNetwork();
    const account = await getWallet(hre, chainId);
    let correspondingAddress = getAddress(`0x${keccak256(`0x${pk.substring(2, 130)}`).substring(26, 66)}`);
    const { ethers, upgrades } = hre;
    const OWNER = chainId === 911n ? account.address : env.OROCHI_OWNER.trim();

    // Check owner and operators
    if (!isAddress(OWNER)) {
      throw new Error('Invalid owner address');
    }
    console.log('Owner:', OWNER);

    const orocleV2Proxy = (await hre.ethers.getContractAt('OrocleV2', OROCLE_V2_ADDRESS)) as OrocleV2;
    const orandProviderV3Proxy = (await hre.ethers.getContractAt(
      'OrandProviderV3',
      ORAND_PROVIDER_ADDRESS,
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

    (await orocleV2Proxy.connect(account).transferOwnership(OWNER)).wait();
    await sleep(10);

    let nonce = await ethers.provider.getTransactionCount(account.address);
    console.log('🚀 ~ nonce:', nonce);
    await upgrades.admin
      .transferProxyAdminOwnership(await orocleV2Proxy.getAddress(), OWNER, account, {
        silent: false,
        txOverrides: {
          nonce: nonce + 1,
        },
      })
      .then();
    nonce = nonce + 3;
    await sleep(10);
    (await orandProviderV3Proxy.connect(account).transferOwnership(OWNER)).wait();
    await sleep(10);
    await upgrades.admin.transferProxyAdminOwnership(await orandProviderV3Proxy.getAddress(), OWNER, account, {
      silent: false,
      txOverrides: {
        nonce,
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
