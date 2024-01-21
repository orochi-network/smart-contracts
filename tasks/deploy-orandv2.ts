/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer, NATIVE_UNIT } from '../helpers';
import { OrandECVRFV2, OrandProviderV2 } from '../typechain-types';
import { env } from '../env';
import { getAddress, keccak256 } from 'ethers';

task('deploy:orandv2', 'Deploy Orand V2 contracts').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    let pk = env.OROCHI_PUBLIC_KEY.replace(/^0x/gi, '');
    let correspondingAddress = getAddress(`0x${keccak256(`0x${pk.substring(2, 130)}`).substring(26, 66)}`);

    const accounts = await hre.ethers.getSigners();
    const deployer: Deployer = Deployer.getInstance(hre).connect(accounts[0]);
    const orandECVRF = await deployer.contractDeploy<OrandECVRFV2>('OrandV2/OrandECVRFV2', []);
    const orandProviderV2 = await deployer.contractDeploy<OrandProviderV2>(
      'OrandV2/OrandProviderV2',
      [],
      // We going to skip 0x04 -> Pubkey format from libsecp256k1
      [`0x${pk.substring(2, 66)}`, `0x${pk.substring(66, 130)}`],
      orandECVRF,
    );

    console.log(
      `Corresponding address: ${correspondingAddress} , is valid publicKey?:`,
      correspondingAddress === (await orandProviderV2.getOperator()),
    );

    await deployer.printReport();
  },
);

export default {};
