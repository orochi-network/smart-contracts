/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '../helpers';
import { OrocleV1, OrandECVRFV2, OrandProviderV2 } from '../typechain-types';
import { env } from '../env';
import { getAddress, isAddress, keccak256 } from 'ethers';

const affineToNumberish = (affine: string): [string, string] => {
  const aff = affine.trim().replace(/^0x/gi, '').padStart(128, '0');
  return [`0x${aff.substring(0, 64)}`, `0x${aff.substring(64, 128)}`];
};

const publicKeyToNumberish = (pubkey: string): [string, string] => {
  const aff = pubkey.trim().replace(/^0x/gi, '').padStart(130, '0').substring(2, 130);
  return affineToNumberish(aff);
};

function numberToBytes(input: number | bigint, bits: number) {
  return input.toString(16).padStart((bits / 8) * 2, '0');
}

function stringToBytes(input: string, length: number) {
  return Buffer.from(input)
    .toString('hex')
    .padEnd(length * 2, '0');
}

const OWNER = env.OROCHI_OWNER.trim();
const OPERATORS = env.OROCHI_OPERATOR.split(',').map((op) => op.trim());

task('deploy:orochi', 'Deploy Orochi Network contracts').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    let pk = env.OROCHI_PUBLIC_KEY.replace(/^0x/gi, '').trim();
    let correspondingAddress = getAddress(`0x${keccak256(`0x${pk.substring(2, 130)}`).substring(26, 66)}`);
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

    // Setup deployer
    const accounts = await hre.ethers.getSigners();
    console.log('Deployer:', accounts[0].address);
    const deployer: Deployer = Deployer.getInstance(hre).connect(accounts[0]);
    // Deploy ECVRF
    const orandECVRF = await deployer.contractDeploy<OrandECVRFV2>('OrandV2/OrandECVRFV2', []);
    // Deploy Orocle
    const orocleV1 = await deployer.contractDeploy<OrocleV1>('OrocleV1/OrocleV1', [], OPERATORS);

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
    const orandProviderV2 = await deployer.contractDeploy<OrandProviderV2>(
      'OrandV2/OrandProviderV2',
      [],
      // We going to skip 0x04 -> Pubkey format from libsecp256k1
      publicKeyToNumberish(pk),
      correspondingAddress,
      orandECVRF,
      orocleV1,
      200,
    );

    await orocleV1.transferOwnership(OWNER);
    await orandProviderV2.transferOwnership(OWNER);

    console.log(
      `Corresponding address: ${correspondingAddress} , is valid publicKey?:`,
      correspondingAddress === (await orandProviderV2.getOperator()),
    );

    console.log('Is Oracle deployed correct?', (await orocleV1.getAddress()) === (await orandProviderV2.getOracle()));
    console.log(
      'Is ECVRF verifier deployed correct?',
      (await orandECVRF.getAddress()) === (await orandProviderV2.getECVRFVerifier()),
    );
    console.log('Is orand service operator  correct?', correspondingAddress === (await orandProviderV2.getOperator()));
    console.log('Is OrocleV1 operator correct?', await orocleV1.isOperator(OPERATORS[0]));
    console.log('Is OrocleV1 operator correct?', await orocleV1.isOperator(OPERATORS[1]));
    console.log('Is OrocleV1 owner correct?', OWNER === (await orocleV1.owner()));
    console.log('Is OrandProviderV2 owner correct?', OWNER === (await orandProviderV2.owner()));

    await deployer.printReport();
  },
);

export default {};
