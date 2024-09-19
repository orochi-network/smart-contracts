/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getWallet } from '../helpers/wallet';
import { OrocleV2 } from '../typechain-types';

const CONTRACT_ADDRESS = '0x6Fc8fcE9061977131A87D95458De69b9b4e36B1e';
const operator = ['0x3275d050830d8b691f05eb1afb07a06f030cb4c6'];

task('orochi:add-operator', 'OrocleV2 add new operator').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  const { chainId } = await hre.ethers.provider.getNetwork();
  const account = await getWallet(hre, chainId);

  const contract = (await hre.ethers.getContractAt('OrocleV2', CONTRACT_ADDRESS, account)) as OrocleV2;
  for (let i = 0; i < operator.length; i += 1) {
    (await contract.addOperator(operator[i])).wait();
  }
});
