/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getWallet } from '../helpers/wallet';
import { XOroV2 } from '../typechain-types';

const CONTRACT_ADDRESS = '0x21651badF158a42CF84A051aE69409B10a933F19';

task('mint:x-oro-token', 'Mint Soul bound token X-OROV2').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  const receiver = '0x10A0031781971bd37504354BBa49299885aD5cd4';
  const { chainId } = await hre.ethers.provider.getNetwork();
  const account = await getWallet(hre, chainId);
  const contract = (await hre.ethers.getContractAt('XOroV2', CONTRACT_ADDRESS, account)) as XOroV2;
  const tx = await contract.mint(receiver, 20);
  console.log('Successfully minted user token at', tx);
});

export default {};
