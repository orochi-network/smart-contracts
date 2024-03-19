/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '../helpers';
import { DiceGame, OrandECVRFV2, OrandProviderV2 } from '../typechain-types';
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

task('deploy:orandv2', 'Deploy Orand V2 contracts').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    let pk = env.OROCHI_PUBLIC_KEY.replace(/^0x/gi, '').trim();
    let correspondingAddress = getAddress(`0x${keccak256(`0x${pk.substring(2, 130)}`).substring(26, 66)}`);

    const accounts = await hre.ethers.getSigners();
    const deployer: Deployer = Deployer.getInstance(hre).connect(accounts[0]);
    const orandECVRF = await deployer.contractDeploy<OrandECVRFV2>('OrandV2/OrandECVRFV2', []);

    /**
      constructor(
        uint256[2] memory publicKey,
        address operator,
        address ecvrfAddress,
        address oracleAddress,
        uint256 maxBatchingLimit
      )
     */
    const orandProviderV2 = await deployer.contractDeploy<OrandProviderV2>(
      'OrandV2/OrandProviderV2',
      [],
      // We going to skip 0x04 -> Pubkey format from libsecp256k1
      publicKeyToNumberish(pk),
      correspondingAddress,
      orandECVRF,
      // Oracle
      '0x674305AD68cf9c2F572D06b8b617EF3C6c74503E',
      100,
    );
    await deployer.contractDeploy<DiceGame>(
      'examples/DiceGame',
      [],
      orandProviderV2,
      '0x674305AD68cf9c2F572D06b8b617EF3C6c74503E',
    );

    console.log(
      `Corresponding address: ${correspondingAddress} , is valid publicKey?:`,
      correspondingAddress === (await orandProviderV2.getOperator()),
    );

    await deployer.printReport();
  },
);

export default {};
