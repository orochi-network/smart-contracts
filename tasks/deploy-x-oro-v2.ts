/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '../helpers';
import { DiceGameV3, XOroV2 } from '../typechain-types';
import { getWallet } from '../helpers/wallet';

task('deploy:x-oro-v2', 'Deploy Soul bound token X-OROV2').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  const { chainId } = await hre.ethers.provider.getNetwork();
  const account = await getWallet(hre, chainId);
  const deployer: Deployer = Deployer.getInstance(hre).connect(account);
  await deployer.contractDeploy<XOroV2>('orochi/XOroV2', []);
  await deployer.printReport();
});

export default {};
