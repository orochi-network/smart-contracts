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
    console.log(`Corresponding address: ${correspondingAddress}`);

    const accounts = await hre.ethers.getSigners();
    const deployer: Deployer = Deployer.getInstance(hre).connect(accounts[0]);
    const orandECVRF = await deployer.contractDeploy<OrandECVRFV2>('OrandV2/OrandECVRFV2', []);
    await deployer.contractDeploy<OrandProviderV2>(
      'OrandV2/OrandProviderV2',
      [],
      // This public key is corresponding to 0x7e9e03a453867a7046B0277f6cD72E1B59f67a0e
      // We going to skip 0x04 -> Pubkey format from libsecp256k1
      `0x${pk.substring(2, 130)}`,
      // Operator address
      correspondingAddress,
      orandECVRF,
      NATIVE_UNIT / 100n,
    );

    await deployer.printReport();
  },
);

export default {};
