/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getWallet } from '../helpers/wallet';

const OUR_PARTNER_WALLET = [
  '0x778346778c2d1278e918fbefebabf987b27c44ff',
  '0xA055fC33232Ced24ed58d00296050f07513478ad',
  '0xB290caE8652d7Dd291CD1E63fe1FAd522324DCd4',
  '0x10A0031781971bd37504354BBa49299885aD5cd4',
];
const AMOUNT = 10n ** 9n * 10n ** 18n;

export const packData = (amount: bigint, address: string): bigint => (amount << 160n) | BigInt(address);

task('deploy:test-token', 'Deploy our token for our partner testing').setAction(
  async (_, hre: HardhatRuntimeEnvironment) => {
    const { chainId } = await hre.ethers.provider.getNetwork();
    const account = await getWallet(hre, chainId);
    const TestERCFactory = await hre.ethers.getContractFactory('TestERC20', account);
    const token = await (await TestERCFactory.deploy('Orochi Test Token', 'OT')).waitForDeployment();

    const packedArray = OUR_PARTNER_WALLET.map((item) => packData(AMOUNT, item));
    console.log('TestERC20 token contract address:', await token.getAddress());

    await token.batchMint(packedArray);
    console.log('Successfully mint token to our partner');
  },
);
