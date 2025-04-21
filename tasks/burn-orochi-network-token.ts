import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getWallet } from '../helpers/wallet';
import { OrochiNetworkToken } from '../typechain-types';

const OROCHI_TOKEN_ADDRESS = '';
const BURN_ADDRESS = '';
const BURN_AMOUNT = '';

task('burn:ontoken', 'Burn token Orochi network').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  const { chainId } = await hre.ethers.provider.getNetwork();
  const account = await getWallet(hre, chainId);
  const onProver = (await hre.ethers.getContractAt(
    'OrochiNetworkToken',
    OROCHI_TOKEN_ADDRESS,
    account,
  )) as OrochiNetworkToken;

  const burnAmount = hre.ethers.parseUnits(BURN_AMOUNT, 18);

  const tx = await onProver.burn(BURN_ADDRESS, burnAmount);
  await tx.wait();

  console.log(`This address ${BURN_ADDRESS} has been burn ${BURN_AMOUNT} ON token at ${tx.hash}`);
});
