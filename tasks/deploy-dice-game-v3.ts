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

const OROCLE_ADDRESS = '0x544FE7b51EF279c15f82B2037e524eeCa1E610C3';
const ORAND_PROVIDER_ADDRESS = '0x219Eed0551cB8BCf55b61e1CFB353f4Ad1F5bcF7';

task('deploy:dice-game-v3', 'Deploy dice game contracts').setAction(
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

export default {};
