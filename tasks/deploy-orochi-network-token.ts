import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '../helpers';
import { getWallet } from '../helpers/wallet';
import { OrochiNetworkToken } from '../typechain-types';

task('deploy:OrochiNetworkToken', 'Deploy OrochiNetworkToken').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  const { chainId } = await hre.ethers.provider.getNetwork();

  const account = await getWallet(hre, chainId);
  const deployer: Deployer = Deployer.getInstance(hre).connect(account);

  const tokenName = 'Orochi Network Token';
  const tokenSymbol = 'ON';
  const initialOperators = [account.address];

  // Deploy OrochiNetworkToken
  const token = await deployer.contractDeploy<OrochiNetworkToken>(
    'onprover/OrochiNetworkToken',
    [],
    tokenName,
    tokenSymbol,
    initialOperators,
  );

  console.log(`OrochiNetworkToken deployed at: ${await token.getAddress()}`);
  await deployer.printReport();
});
