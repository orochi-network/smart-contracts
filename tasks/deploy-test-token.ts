/* eslint-disable no-await-in-loop */
import { Deployer as zkDeployer } from '@matterlabs/hardhat-zksync';
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Provider } from 'zksync-ethers';
import { env } from '../env';
import { getWallet, getZkSyncWallet } from '../helpers/wallet';
import { packDataTokenBatchMint } from '../helpers';

const TEST_RECEIVER_ADDRESS = [
  '0x778346778c2d1278e918fbefebabf987b27c44ff',
  '0xA055fC33232Ced24ed58d00296050f07513478ad',
  '0xB290caE8652d7Dd291CD1E63fe1FAd522324DCd4',
  '0x10A0031781971bd37504354BBa49299885aD5cd4',
];
const AMOUNT = 10n ** 9n * 10n ** 18n;

const TOKEN_NAME = 'Orochi Test Token';
const TOKEN_SYMBOL = 'OT';

task('deploy:test-token', 'Deploy test token').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  console.log('Using zkSolc =', env.USE_ZKSOLC);
  const { chainId } = await hre.ethers.provider.getNetwork();
  const account = await getWallet(hre, chainId);
  const packedArray = TEST_RECEIVER_ADDRESS.map((item) => packDataTokenBatchMint(AMOUNT, item));
  let tokenAddress: string;

  if (env.USE_ZKSOLC) {
    const provider = new Provider(hre.network.config.url);
    const wallet = getZkSyncWallet(account, provider);
    const deployer = new zkDeployer(hre, wallet);
    const testERC20Artifact = await deployer.loadArtifact('TestERC20');
    const token = await deployer.deploy(testERC20Artifact, [TOKEN_NAME, TOKEN_SYMBOL]);
    await token.waitForDeployment();
    await token.batchMint(packedArray);
    tokenAddress = await token.getAddress();
  } else {
    const testERC20Factory = await hre.ethers.getContractFactory('TestERC20', account);
    const token = await testERC20Factory.deploy(TOKEN_NAME, TOKEN_SYMBOL);
    await token.batchMint(packedArray);
    tokenAddress = await token.getAddress();
  }

  console.log('TestERC20 token contract address:', tokenAddress);
});
