/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getWallet } from '../helpers/wallet';
import { LittleWicce } from '../typechain-types';

const CONTRACT_ADDRESS = '0x1E15ecdCFC2Cff5EcbaF6Df78cEe09727918783C';

task('transferOwnership:LitteWicce', 'Transfer ownership LitteWicce to new owner').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  const OwnerAddress = '0xe979163cfd506abf8ec2e42b53b0969ce7fae071';
  const { chainId } = await hre.ethers.provider.getNetwork();
  const account = await getWallet(hre, chainId);
  const contract = (await hre.ethers.getContractAt('LittleWicce', CONTRACT_ADDRESS, account)) as LittleWicce;
  const tx = await contract.transferOwnership(OwnerAddress);
  console.log('Successfully transfer ownership to ',OwnerAddress ,' : ', tx.hash);
});

export default {};
