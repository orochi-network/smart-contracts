/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getWallet } from '../helpers/wallet';
import { GameContract } from '../typechain-types';

const CONTRACT_ADDRESS = '0xDE3412F8BF81a3E5C8b7a8b46e292cf0372FCCB2';

task('transferOwnership:gameContract', 'Transfer ownership to owner contract').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  const OwnerAddress = '0xb0ceb5bd649bae066340e5ea106a5d49e66c0446';
  const { chainId } = await hre.ethers.provider.getNetwork();
  const account = await getWallet(hre, chainId);
  const contract = (await hre.ethers.getContractAt('GameContract', CONTRACT_ADDRESS, account)) as GameContract;
  const tx = await contract.transferOwnership(OwnerAddress);
  console.log('Successfully transfer ownership to ',OwnerAddress ,' : ', tx.hash);
});

export default {};
