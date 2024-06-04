/* eslint-disable no-await-in-loop */
import { Deployer } from '@matterlabs/hardhat-zksync';
import '@matterlabs/hardhat-zksync-node/dist/type-extensions';
import '@matterlabs/hardhat-zksync-upgradable';
import '@matterlabs/hardhat-zksync-verify/dist/src/type-extensions';
import '@nomicfoundation/hardhat-ethers';
import { HexString, OrandEncoding } from '@orochi-network/utilities';
import { getAddress, isAddress, keccak256 } from 'ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Provider, Wallet } from 'zksync-ethers';
import { env } from '../env';
import { getWallet, getZkSyncWallet } from '../helpers/wallet';

const sleep = async (seconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

const OPERATORS = env.OROCHI_OPERATOR.split(',').map((op) => op.trim());

task('deploy:zk', 'Deploy Orochi Network contracts with zkSolc').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const OWNER = env.OROCHI_OWNER.trim();
    const provider = new Provider(hre.network.config.url);
    const { chainId } = await provider.getNetwork();
    const { wallet: legacyWallet } = await getWallet(hre, chainId);

    const wallet = getZkSyncWallet(legacyWallet, provider);
    const deployer = new Deployer(hre, wallet);
    console.log('Deployer:', deployer.zkWallet, deployer.ethWallet);

    let pk = env.OROCHI_PUBLIC_KEY.replace(/^0x/gi, '').trim();
    let correspondingAddress = getAddress(`0x${keccak256(`0x${pk.substring(2, 130)}`).substring(26, 66)}`);

    for (let i = 0; i < OPERATORS.length; i += 1) {
      if (!isAddress(OPERATORS[i])) {
        throw new Error(`Invalid operator address ${i}: ${OPERATORS[i]}`);
      }
      console.log(`Operator [${i}]:`, OPERATORS[i]);
    }

    const orandECVRFV3Artifact = await deployer.loadArtifact('OrandECVRFV3');
    const orandProviderV3Artifact = await deployer.loadArtifact('OrandProviderV3');
    const orocleV2Artifact = await deployer.loadArtifact('OrocleV2');

    // Deploy ECVRF
    const orandECVRF = await deployer.deploy(orandECVRFV3Artifact);
    await orandECVRF.waitForDeployment();
    console.log('orandECVRFContract: ', await orandECVRF.getAddress());

    // Deploy Orocle
    const orocleV2Proxy = await hre.zkUpgrades.deployProxy(deployer.zkWallet, orocleV2Artifact, [OPERATORS], {
      initializer: 'initialize',
    });
    await orocleV2Proxy.waitForDeployment();
    console.log('>> [Orocle V2] proxy contract address:', await orocleV2Proxy.getAddress());

    /*
      constructor(
        uint256[2] memory publicKey,
        address operator,
        address ecvrfAddress,
        address oracleAddress,
        uint256 maxBatchingLimit
      )
    */
    // Deploy Provider
    const orandProviderV3Proxy = await hre.zkUpgrades.deployProxy(
      deployer.zkWallet,
      orandProviderV3Artifact,
      [
        OrandEncoding.pubKeyToAffine(HexString.hexPrefixAdd(pk)),
        correspondingAddress,
        await orandECVRF.getAddress(),
        await orocleV2Proxy.getAddress(),
        200,
      ],
      {
        initializer: 'initialize',
      },
    );
    await orandProviderV3Proxy.waitForDeployment();

    console.log('>> [OrandProvider V3] proxy contract address:', await orandProviderV3Proxy.getAddress());

    console.table({
      OrocleV2: await orocleV2Proxy.getAddress(),
      OrandProviderV3: await orandProviderV3Proxy.getAddress(),
    });

    await orocleV2Proxy.transferOwnership(OWNER);
    await sleep(10);
    await hre.zkUpgrades.admin.changeProxyAdmin(await orocleV2Proxy.getAddress(), OWNER, deployer.zkWallet);
    await sleep(10);
    await orandProviderV3Proxy.transferOwnership(OWNER);
    await sleep(10);
    await hre.zkUpgrades.admin.changeProxyAdmin(await orandProviderV3Proxy.getAddress(), OWNER, deployer.zkWallet);

    console.log(
      `Corresponding address: ${correspondingAddress} , is valid publicKey?:`,
      correspondingAddress === (await orandProviderV3Proxy.getOperator()),
    );

    console.log(
      'Is Oracle deployed correct?',
      (await orocleV2Proxy.getAddress()) === (await orandProviderV3Proxy.getOracle()),
    );
    console.log(
      'Is ECVRF verifier deployed correct?',
      (await orandECVRF.getAddress()) === (await orandProviderV3Proxy.getECVRFVerifier()),
    );
    console.log(
      'Is orand service operator  correct?',
      correspondingAddress === (await orandProviderV3Proxy.getOperator()),
    );
    console.log('Is OrocleV2 operator correct?', await orocleV2Proxy.isOperator(OPERATORS[0]));
    console.log('Is OrocleV2 operator correct?', await orocleV2Proxy.isOperator(OPERATORS[1]));
    console.log('Is OrocleV2 owner correct?', OWNER === (await orocleV2Proxy.owner()));
    console.log('Is OrandProviderV2 owner correct?', OWNER === (await orandProviderV3Proxy.owner()));
  },
);

export default {};
