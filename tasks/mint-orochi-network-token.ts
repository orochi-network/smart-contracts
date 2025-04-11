import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getWallet } from '../helpers/wallet';
import { OrochiNetworkToken } from '../typechain-types';

const TOKEN_ADDRESS = '';
const RECIPIENT = '';
const AMOUNT = '10000';

task('mint:OrochiNetworkToken', 'Mint token to an address').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  const { chainId } = await hre.ethers.provider.getNetwork();
  const account = await getWallet(hre, chainId);
  const token = (await hre.ethers.getContractAt('OrochiNetworkToken', TOKEN_ADDRESS, account)) as OrochiNetworkToken;

  const amountInWei = hre.ethers.parseUnits(AMOUNT, 18);
  const tx = await token.mint(RECIPIENT, amountInWei);
  await tx.wait();

  console.log(`Minted ${AMOUNT} tokens to ${RECIPIENT}`);
});
