/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getWallet } from '../helpers/wallet';
import { ONProver } from '../typechain-types';

const CONTRACT_ADDRESS = '';
const MINT_ADDRESS = '';
const AMOUNT = 1000000000;

task('mint:ONProver', 'Mint token ONProver').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  const { chainId } = await hre.ethers.provider.getNetwork();
  const account = await getWallet(hre, chainId);
  const amountMint = hre.ethers.parseUnits(AMOUNT.toString(), 18);
  const contract = (await hre.ethers.getContractAt('ONProver', CONTRACT_ADDRESS, account)) as ONProver;
  const tx = await contract.mint(MINT_ADDRESS, amountMint);
  console.log('Successfully mint to', MINT_ADDRESS, ', at txhash:  ', tx.hash);
});

export default {};
