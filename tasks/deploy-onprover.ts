import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '../helpers';
import { getWallet } from '../helpers/wallet';
import { ONProver } from '../typechain-types';

const TOKEN_NAME = 'ONProver [Beta Token]';
const TOKEN_SYMBOL = 'ONProver';
const INIT_PROVER = '0x84Ae76a5F8e9e323538e27B5790598b9B53f0126';

task('deploy:ONProver', 'Deploy ONProver').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  const { chainId } = await hre.ethers.provider.getNetwork();
  const account = await getWallet(hre, chainId);
  const deployer: Deployer = Deployer.getInstance(hre).connect(account);

  await deployer.contractDeploy<ONProver>('onprover/ONProver', [], TOKEN_NAME, TOKEN_SYMBOL, INIT_PROVER);
  await deployer.printReport();
});
