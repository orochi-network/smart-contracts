/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getWallet } from '../helpers/wallet';
import { OnToken } from '../typechain-types';

const CONTRACT_ADDRESS = '0x25391103feAFf67dBF392CFC73C91319AD1dcD13';
const OWNERADDRESS = '0x73100880b1B6F0De121CAc27C418BF77183e3768';

task('transferOwnership:OnToken', 'Transfer ownership to owner contract').setAction(
  async (_, hre: HardhatRuntimeEnvironment) => {
    const { chainId } = await hre.ethers.provider.getNetwork();
    const account = await getWallet(hre, chainId);
    const contract = (await hre.ethers.getContractAt('OnToken', CONTRACT_ADDRESS, account)) as OnToken;
    const tx = await contract.transferOwnership(OWNERADDRESS);
    console.log('Successfully transfer ownership to', OWNERADDRESS, ', at txhash:  ', tx.hash);
  },
);

export default {};
