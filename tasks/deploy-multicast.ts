/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '../helpers';
import { Multicast } from '../typechain-types';
import { getWallet } from '../helpers/wallet';

task('deploy:multicast', 'Deploy Multicast contracts').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { chainId } = await hre.ethers.provider.getNetwork();
    const account = await getWallet(hre, chainId);
    //0x3ECb21f2c6A5a57C57634036777730bb6E87F281
    const deployer: Deployer = Deployer.getInstance(hre).connect(account);
    await deployer.contractDeploy<Multicast>('orochi/Multicast', []);
    await deployer.printReport();
  },
);

export default {};
