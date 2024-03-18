/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '../helpers';
import { DiceGame, OrocleV1, OrandECVRFV2, OrandProviderV2 } from '../typechain-types';
import { env } from '../env';
import { getAddress, keccak256 } from 'ethers';

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

const TESTNET_OPERATOR = ['0xc4fFb047C1C6600FC82c68376C502bAa72ea2074', '0x4d8Ebc5601683C5b50dADA3066940e234146C07E'];

task('deploy:orochi', 'Deploy Orochi Network contracts').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    let pk = env.OROCHI_PUBLIC_KEY.replace(/^0x/gi, '').trim();
    let correspondingAddress = getAddress(`0x${keccak256(`0x${pk.substring(2, 130)}`).substring(26, 66)}`);
    // Setup deployer
    const accounts = await hre.ethers.getSigners();
    const deployer: Deployer = Deployer.getInstance(hre).connect(accounts[0]);
    // Deploy ECVRF
    const orandECVRF = await deployer.contractDeploy<OrandECVRFV2>('OrandV2/OrandECVRFV2', []);
    // Deploy Orocle
    const OrocleV1 = await deployer.contractDeploy<OrocleV1>('OrocleV1/OrocleV1', [], TESTNET_OPERATOR);

    // Deploy Provider
    const orandProviderV2 = await deployer.contractDeploy<OrandProviderV2>(
      'OrandV2/OrandProviderV2',
      [],
      // We going to skip 0x04 -> Pubkey format from libsecp256k1
      publicKeyToNumberish(pk),
      correspondingAddress,
      orandECVRF,
      OrocleV1,
      100,
    );
    await deployer.contractDeploy<DiceGame>('examples/DiceGame', [], orandProviderV2);

    console.log(
      `Corresponding address: ${correspondingAddress} , is valid publicKey?:`,
      correspondingAddress === (await orandProviderV2.getOperator()),
    );

    await deployer.printReport();
  },
);

export default {};
