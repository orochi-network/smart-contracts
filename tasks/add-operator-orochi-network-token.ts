import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getWallet } from '../helpers/wallet';
import { OrochiNetworkToken } from '../typechain-types';

const TOKEN_ADDRESS = '';
const OPERATOR_TO_ADD = '';

task('add:ontoken', 'Add operator to OrochiNetworkToken').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  const { chainId } = await hre.ethers.provider.getNetwork();
  const account = await getWallet(hre, chainId);
  const token = (await hre.ethers.getContractAt('OrochiNetworkToken', TOKEN_ADDRESS, account)) as OrochiNetworkToken;

  const tx = await token.addOperator(OPERATOR_TO_ADD);
  await tx.wait();

  console.log(`Successfully added operator ${OPERATOR_TO_ADD} to token ${TOKEN_ADDRESS}`);
});
