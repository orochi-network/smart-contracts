/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '../helpers';
import { Multicast } from '../typechain-types';
import { getWallet, getZkSyncWallet } from '../helpers/wallet';
import { env } from '../env';
import { Provider } from 'zksync-ethers';
import { Deployer as zkDeployer } from '@matterlabs/hardhat-zksync';

task('deploy:multicast', 'Deploy Multicast contracts').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    console.log('Using zkSolc =', env.USE_ZKSOLC);
    const { chainId } = await hre.ethers.provider.getNetwork();
    const account = await getWallet(hre, chainId);

    // If this blockchain need to use zkSolc
    if (env.USE_ZKSOLC) {
      const provider = new Provider(hre.network.config.url);
      const wallet = getZkSyncWallet(account, provider);
      const deployer = new zkDeployer(hre, wallet);
      const multicastArtifact = await deployer.loadArtifact('Multicast');
      const multicast = await deployer.deploy(multicastArtifact);
      await multicast.waitForDeployment();
      console.log('Multicast contract address:', await multicast.getAddress());
    } else {
      const deployer: Deployer = Deployer.getInstance(hre).connect(account);
      await deployer.contractDeploy<Multicast>('orochi/Multicast', []);
      await deployer.printReport();
    }
  },
);

export default {};
