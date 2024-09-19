/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '../helpers';
import { DiceGameV3 } from '../typechain-types';
import { getWallet, getZkSyncWallet } from '../helpers/wallet';
import { env } from '../env';
import { Provider } from 'zksync-ethers';
import { Deployer as zkDeployer } from '@matterlabs/hardhat-zksync';

const OROCLE_ADDRESS = '0xF49c2DFb6789C8643B772F8dd039E6cF5fdaF6CE';
const ORAND_PROVIDER_ADDRESS = '0xB7a2e1ffa0Aaef491d381ABA2e07668f98B02C49';

task('deploy:dice-game', 'Deploy dice game contracts').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    console.log('Using zkSolc =', env.USE_ZKSOLC);
    const { chainId } = await hre.ethers.provider.getNetwork();
    const account = await getWallet(hre, chainId);

    if (env.USE_ZKSOLC) {
      const provider = new Provider(hre.network.config.url);
      const wallet = getZkSyncWallet(account, provider);
      const deployer = new zkDeployer(hre, wallet);
      const diceGameArtifact = await deployer.loadArtifact('DiceGameV3');
      const diceGame = await deployer.deploy(diceGameArtifact, [ORAND_PROVIDER_ADDRESS, OROCLE_ADDRESS]);
      await diceGame.waitForDeployment();
      console.log('DiceGame contract address:', await diceGame.getAddress());
    } else {
      const deployer: Deployer = Deployer.getInstance(hre).connect(account);
      await deployer.contractDeploy<DiceGameV3>('orochi/DiceGameV3', [], ORAND_PROVIDER_ADDRESS, OROCLE_ADDRESS);
      await deployer.printReport();
    }
  },
);
