/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '../helpers';
import { OroNft } from '../typechain-types';
import { getWallet } from '../helpers/wallet';

task('deploy:oroNft', 'Deploy Oro Nft').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { chainId } = await hre.ethers.provider.getNetwork();
    const account = await getWallet(hre, chainId);
    const deployer: Deployer = Deployer.getInstance(hre).connect(account);
    const guaranteedStartTime = 1742542503;
    const guaranteedEndTime = 1742543503;
    const fcfsStartTime = 1742544503;
    const fcfsEndTime = 1742545503;
    const publicStartTime = 1742546503;
    const baseURI = '';
    const contractName = 'OroNft';
    const contractSymbol = 'ORO';
    await deployer.contractDeploy<OroNft>(
      'OroNft/OroNft',
      [],
      baseURI,
      guaranteedStartTime,
      guaranteedEndTime,
      fcfsStartTime,
      fcfsEndTime,
      publicStartTime,
      contractName,
      contractSymbol,
    );
    await deployer.printReport();
  },
);

export default {};
