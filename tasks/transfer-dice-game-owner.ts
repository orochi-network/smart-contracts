import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DiceGameV3 } from '../typechain-types';
import { getWallet } from '../helpers/wallet';

const DICE_GAME_CONTRACT_ADDRESS = '0xfd3617eF06C02992BD611e74Fc248D027096269D';

task('tranferDicegame', 'Test dice game with OrandProviderV3').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { chainId } = await hre.ethers.provider.getNetwork();
    const account = await getWallet(hre, chainId);
    const contract = (await hre.ethers.getContractAt('DiceGameV3', DICE_GAME_CONTRACT_ADDRESS, account)) as DiceGameV3;
    const tx = await contract.transferOwnership("0x73100880b1B6F0De121CAc27C418BF77183e3768");
    console.log('Successful transaction', tx);
  },
);

export default {};
