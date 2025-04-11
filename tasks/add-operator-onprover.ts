import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getWallet } from '../helpers/wallet';
import { ONProver } from '../typechain-types';

const ONPROVER_ADDRESS = '';
const OPERATOR_ADDRESS = '';

task('add:ONProver', 'Add operator to ONProver').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  const { chainId } = await hre.ethers.provider.getNetwork();
  const account = await getWallet(hre, chainId);
  const onProver = (await hre.ethers.getContractAt('ONProver', ONPROVER_ADDRESS, account)) as ONProver;

  const tx = await onProver.addOperator(OPERATOR_ADDRESS);
  await tx.wait();

  console.log(`Added operator ${OPERATOR_ADDRESS} to ONProver`);
});
