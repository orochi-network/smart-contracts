import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '../helpers';
import { getWallet } from '../helpers/wallet';
import { OnToken } from '../typechain-types';

const TOKEN_NAME = 'On [Beta Token]';
const TOKEN_SYMBOL = 'ON';
const INIT_PROVER = '';

task('deploy:OnToken', 'Deploy ON token').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  const { chainId } = await hre.ethers.provider.getNetwork();
  const account = await getWallet(hre, chainId);
  const deployer: Deployer = Deployer.getInstance(hre).connect(account);

  await deployer.contractDeploy<OnToken>('on-token/OnToken', [], TOKEN_NAME, TOKEN_SYMBOL, INIT_PROVER);
  await deployer.printReport();
});
