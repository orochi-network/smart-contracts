/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getWallet } from '../helpers/wallet';
import { OnToken } from '../typechain-types';

const CONTRACT_ADDRESS = '0x25391103feAFf67dBF392CFC73C91319AD1dcD13';
const MINT_ADDRESS = '';
const AMOUNT = 1000000000;

task('mint:OnToken', 'Mint token ON for target').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  const { chainId } = await hre.ethers.provider.getNetwork();
  const account = await getWallet(hre, chainId);
  const amountMint = hre.ethers.parseUnits(AMOUNT.toString(), 18);
  const contract = (await hre.ethers.getContractAt('OnToken', CONTRACT_ADDRESS, account)) as OnToken;
  const tx = await contract.mint(MINT_ADDRESS, amountMint);
  console.log('Successfully mint to', MINT_ADDRESS, ', at txhash:  ', tx.hash);
});

export default {};
