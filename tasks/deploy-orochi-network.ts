/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import fs from 'fs';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { env } from '../env';
import { getAddress, isAddress, keccak256 } from 'ethers';
import { HexString, OrandEncoding } from '@orochi-network/utilities';
import { getWallet } from '../helpers/wallet';
import EthJsonRpc from '../helpers/provider';

export const GAS_LIMIT_IN_GAS_LESS_BLOCKCHAIN = 1000000n;
const filePath = './output/result.json';

task('deploy:orochi', 'Deploy Orochi Network contracts').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    // Public key
    let pk = env.OROCHI_PUBLIC_KEY.replace(/^0x/gi, '').trim();
    let correspondingAddress = getAddress(`0x${keccak256(`0x${pk.substring(2, 130)}`).substring(26, 66)}`);
    // Get deployer account

    const { chainId } = await hre.ethers.provider.getNetwork();
    const OPERATORS =
      chainId === 911n
        ? env.LOCAL_OROCHI_OPERATOR.split(',').map((op) => op.trim())
        : env.OROCHI_OPERATOR.split(',').map((op) => op.trim());
    const account = await getWallet(hre, chainId);
    if (!account.provider) {
      throw new Error('Invalid provider');
    }

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
    for (let i = 0; i < OPERATORS.length; i += 1) {
      if (!isAddress(OPERATORS[i])) {
        throw new Error(`Invalid operator address ${i}: ${OPERATORS[i]}`);
      }
      console.log(`Operator [${i}]:`, OPERATORS[i]);
    }
    console.log('Owner:', OWNER);

    //m/44'/60'/0'/0/0
    //m/44'/60'/0'/0/0/0

    const orandECVRFV3Factory = await ethers.getContractFactory('OrandECVRFV3', account);
    const orandProviderV3Factory = await ethers.getContractFactory('OrandProviderV3', account);
    const orocleV2Factory = await ethers.getContractFactory('OrocleV2', account);

    // Setup deployer
    console.log('Deployer:', account.address);
    // Deploy ECVRF
    const orandECVRF = await (await orandECVRFV3Factory.deploy()).waitForDeployment();
    console.log('orandECVRF', await orandECVRF.getAddress());

    // Deploy Orocle
    const orocleV2Proxy = await upgrades.deployProxy(orocleV2Factory, [OPERATORS], { txOverrides: gasOverrides });
    await orocleV2Proxy.waitForDeployment();
    console.log('>> [Orocle V2] proxy contract address:', await orocleV2Proxy.getAddress());

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
    const orandProviderV3Proxy = await upgrades.deployProxy(
      orandProviderV3Factory,
      // We going to skip 0x04 -> Pubkey format from libsecp256k1
      [
        OrandEncoding.pubKeyToAffine(HexString.hexPrefixAdd(pk)),
        correspondingAddress,
        await orandECVRF.getAddress(),
        await orocleV2Proxy.getAddress(),
        200,
      ],
      { txOverrides: gasOverrides },
    );
    console.log('>> [OrandProvider V3] proxy contract address:', await orandProviderV3Proxy.getAddress());
    await orandProviderV3Proxy.waitForDeployment();
    console.table({
      OrocleV2: await orocleV2Proxy.getAddress(),
      OrandProviderV3: await orandProviderV3Proxy.getAddress(),
    });

    console.log(
      `Corresponding address: ${correspondingAddress}, is valid publicKey?:`,
      correspondingAddress === (await orandProviderV3Proxy.getOperator()),
    );

    console.log(
      'Is Oracle deployed correct?',
      (await orocleV2Proxy.getAddress()) === (await orandProviderV3Proxy.getOracle()),
    );
    console.log(
      'Is ECVRF verifier deployed correct?',
      (await orandECVRF.getAddress()) === (await orandProviderV3Proxy.getECVRFVerifier()),
    );
    console.log(
      'Is orand service operator  correct?',
      correspondingAddress === (await orandProviderV3Proxy.getOperator()),
    );
    if (chainId === 911n) {
      const data = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
      const DiceGameV3Factory = await ethers.getContractFactory('DiceGameV3', account);
      const diceGame = await DiceGameV3Factory.deploy(
        await orandProviderV3Proxy.getAddress(),
        await orocleV2Proxy.getAddress(),
      );
      if (data) {
        const parseData = JSON.parse(data);
        fs.writeFileSync(
          filePath,
          JSON.stringify({
            ...parseData,
            orandECVRF: await orandECVRF.getAddress(),
            OrocleV2: await orocleV2Proxy.getAddress(),
            OrandProviderV3: await orandProviderV3Proxy.getAddress(),
            DiceGame: await diceGame.getAddress(),
          }),
        );
        console.log('Everything done now');
      }
    }
  },
);

export default {};
