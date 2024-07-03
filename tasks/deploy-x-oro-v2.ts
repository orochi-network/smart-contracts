/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { env } from '../env';
import { Deployer } from '../helpers';
import { getWallet } from '../helpers/wallet';
import { XOroV2 } from '../typechain-types';

task('deploy:x-oro-v2', 'Deploy Soul bound token X-OROV2').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  const { chainId } = await hre.ethers.provider.getNetwork();
  const account = await getWallet(hre, chainId);
  const deployer: Deployer = Deployer.getInstance(hre).connect(account);
  const OPERATORS = env.OROCHI_OPERATOR.split(',').map((op) => op.trim());
  if (!env.OROCHI_METADATA_URL) {
    throw new Error('Invalid orochi metadata uri');
  }

  await deployer.contractDeploy<XOroV2>(
    'orochi/XOroV2',
    [],
    env.OROCHI_METADATA_URL,
    OPERATORS.map((item) => item),
  );
  await deployer.printReport();
});

export default {};
