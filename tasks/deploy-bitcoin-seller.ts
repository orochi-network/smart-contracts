import '@nomicfoundation/hardhat-ethers';
import fs from 'fs';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DEPLOYED_CONTRACT_RESULT_PATH, Deployer } from '../helpers';
import { getWallet } from '../helpers/wallet';
import { BitcoinSeller } from '../typechain-types';

task('deploy:bitcoin-seller', 'Deploy Bitcoin seller contracts').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { chainId, name } = await hre.ethers.provider.getNetwork();
    const deploymentJson = fs.existsSync(DEPLOYED_CONTRACT_RESULT_PATH)
      ? JSON.parse(fs.readFileSync(DEPLOYED_CONTRACT_RESULT_PATH).toString())
      : {};
    if (deploymentJson?.[name]?.OrocleV2) {
      const orocleAddress = deploymentJson?.[name]?.OrocleV2;
      const account = await getWallet(hre, chainId);
      const deployer: Deployer = Deployer.getInstance(hre).connect(account);
      await deployer.contractDeploy<BitcoinSeller>('orochi/BitcoinSeller', [], orocleAddress);
      await deployer.printReport();
    } else {
      throw new Error(`Missing orocle contract in ${name}`);
    }
  },
);
