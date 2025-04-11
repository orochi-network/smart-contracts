/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getWallet } from '../helpers/wallet';
import { ONProver } from '../typechain-types';

const CONTRACT_ADDRESS = '';
const OWNERADDRESS = '';

task('transferOwnership:ONProver', 'Transfer ownership to owner contract').setAction(
  async (_, hre: HardhatRuntimeEnvironment) => {
    const { chainId } = await hre.ethers.provider.getNetwork();
    const account = await getWallet(hre, chainId);
    const contract = (await hre.ethers.getContractAt('ONProver', CONTRACT_ADDRESS, account)) as ONProver;
    const tx = await contract.transferOwnership(OWNERADDRESS);
    console.log('Successfully transfer ownership to', OWNERADDRESS, ', at txhash:', tx.hash);
  },
);

export default {};
