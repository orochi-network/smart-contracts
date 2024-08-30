import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { env } from '../env';
import { Deployer } from '../helpers';
import { getWallet } from '../helpers/wallet';
import { XORO } from '../typechain-types';
import { isAddress } from 'ethers';

const TOKEN_NAME = 'ORC [Beta Token]';
const TOKEN_SYMBOL = 'XORO';

task('deploy:xoro', 'Deploy XORO token').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  const { chainId } = await hre.ethers.provider.getNetwork();
  const account = await getWallet(hre, chainId);
  const deployer: Deployer = Deployer.getInstance(hre).connect(account);
  const OPERATORS = env.OROCHI_OPERATOR.split(',').map((op) => op.trim());
  for (let i = 0; i < OPERATORS.length; i += 1) {
    if (!isAddress(OPERATORS[i])) {
      throw new Error(`Invalid operator address ${i}: ${OPERATORS[i]}`);
    }
    console.log(`Operator [${i}]:`, OPERATORS[i]);
  }
  if (!env.OROCHI_METADATA_URL) {
    throw new Error('Invalid orochi metadata uri');
  }

  await deployer.contractDeploy<XORO>('token/XORO', [], TOKEN_NAME, TOKEN_SYMBOL, OPERATORS);
  await deployer.printReport();
});
