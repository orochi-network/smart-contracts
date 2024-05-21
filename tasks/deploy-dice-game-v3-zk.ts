/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { env } from '../env';
import { Provider, Wallet } from 'zksync-ethers';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';

task('deploy:dice-game-v3-zk', 'Deploy dice game contracts with zkSolc').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const provider = new Provider(hre.network.config.url);

    if (!env.WALLET_PRIVATE_KEY) {
      throw new Error('Not found wallet private key');
    }
    const wallet = new Wallet(env.WALLET_PRIVATE_KEY, provider);
    const deployer = new Deployer(hre, wallet);
    const DiceGameV3Artifact = await deployer.loadArtifact('DiceGameV3');

    const contract = await deployer.deploy(DiceGameV3Artifact, [
      '0xf9338096bb1bCdBDB83E5a237F198A60A48395a2', // Provider
      '0xb0b5fFeF72c6ea620689CF947C0458fAD5cF58da', //Orocle
    ]);
    await contract.waitForDeployment();
    console.log('Dice game V3: ', await contract.getAddress());
  },
);

export default {};
