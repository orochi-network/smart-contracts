import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '../helpers';
import { getWallet } from '../helpers/wallet';
import { ONProver } from '../typechain-types';

const MAX_DAILY_LIMIT = '10000';
const TIME_START = 0;
const TIME_END = 0;
const TOKEN_ADDRESS = '';
const INITIAL_OPERATORS = [''];

task('deploy:onprover', 'Deploy ONProver').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  const { chainId } = await hre.ethers.provider.getNetwork();
  const account = await getWallet(hre, chainId);
  const deployer: Deployer = Deployer.getInstance(hre).connect(account);
  const maxDailyLimit = hre.ethers.parseUnits(MAX_DAILY_LIMIT, 18);
  const config = {
    maxDailyLimit: maxDailyLimit,
    timeStart: TIME_START,
    timeEnd: TIME_END,
    tokenContract: TOKEN_ADDRESS,
  };

  const onProver = await deployer.contractDeploy<ONProver>('onprover/ONProver', [], config, INITIAL_OPERATORS);

  console.log(`ONProver deployed at: ${await onProver.getAddress()}`);
  await deployer.printReport();
});
