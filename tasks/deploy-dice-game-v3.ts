import fs from 'fs';
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DEPLOYED_CONTRACT_RESULT_PATH, Deployer } from '../helpers';
import { DiceGameV3 } from '../typechain-types';
import { getWallet, getZkSyncWallet } from '../helpers/wallet';
import { env } from '../env';
import { Provider } from 'zksync-ethers';
import { Deployer as zkDeployer } from '@matterlabs/hardhat-zksync';

task('deploy:dice-game-v3', 'Deploy DiceGameV3 contract').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { chainId, name } = await hre.ethers.provider.getNetwork();

    // Check Orocle & Orand contract is existed or not
    const deploymentJson = fs.existsSync(DEPLOYED_CONTRACT_RESULT_PATH)
      ? JSON.parse(fs.readFileSync(DEPLOYED_CONTRACT_RESULT_PATH).toString())
      : {};
    if (deploymentJson?.[name]?.OrandProviderV3 && deploymentJson?.[name]?.OrocleV2) {
      let diceGameAddress = '';
      const account = await getWallet(hre, chainId);
      const orocleV2Address = deploymentJson[name].OrocleV2;
      const orandProviderV3Address = deploymentJson[name].OrandProviderV3;
      console.log('Using zkSolc:', env.USE_ZKSOLC);
      if (env.USE_ZKSOLC) {
        const provider = new Provider(hre.network.config.url);
        const wallet = getZkSyncWallet(account, provider);
        const deployer = new zkDeployer(hre, wallet);
        const diceGameArtifact = await deployer.loadArtifact('DiceGameV3');
        const diceGame = await (
          await deployer.deploy(diceGameArtifact, [orandProviderV3Address, orocleV2Address])
        ).waitForDeployment();
        diceGameAddress = await diceGame.getAddress();
      } else {
        const deployer: Deployer = Deployer.getInstance(hre).connect(account);
        const diceGame = await deployer.contractDeploy<DiceGameV3>(
          'orochi/DiceGameV3',
          [],
          orandProviderV3Address,
          orocleV2Address,
        );
        diceGameAddress = await diceGame.getAddress();
        await deployer.printReport();
      }
      console.log('DiceGame contract address:', diceGameAddress);
      // Insert dice game contract address to contract.json file to use later
      deploymentJson[name] = {
        ...deploymentJson[name],
        DiceGame: diceGameAddress,
      };
      fs.writeFileSync(DEPLOYED_CONTRACT_RESULT_PATH, JSON.stringify(deploymentJson));
    } else {
      throw new Error(`Missing OrandProvider/ Orocle contract in ${name}`);
    }
  },
);
