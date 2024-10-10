import '@nomicfoundation/hardhat-ethers';
import fs from 'fs';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getWallet } from '../helpers/wallet';
import { OrocleV2 } from '../typechain-types';
import { DEPLOYED_CONTRACT_RESULT_PATH } from '../helpers';
import { env } from '../env';
import { isAddress } from 'ethers';

task('orocle-v2:add-operator', 'OrocleV2 add new operator').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  const { chainId, name } = await hre.ethers.provider.getNetwork();
  const deploymentJson = fs.existsSync(DEPLOYED_CONTRACT_RESULT_PATH)
    ? JSON.parse(fs.readFileSync(DEPLOYED_CONTRACT_RESULT_PATH).toString())
    : {};
  const OPERATORS = env.OROCHI_OPERATOR.split(',').map((op) => op.trim());
  for (let i = 0; i < OPERATORS.length; i += 1) {
    if (!isAddress(OPERATORS[i])) {
      throw new Error(`Invalid operator address ${i}: ${OPERATORS[i]}`);
    }
  }

  if (deploymentJson?.[name]?.OrocleV2) {
    const orocleAddress = deploymentJson?.[name]?.OrocleV2;
    const account = await getWallet(hre, chainId);
    const contract = (await hre.ethers.getContractAt('OrocleV2', orocleAddress, account)) as OrocleV2;
    for (let i = 0; i < OPERATORS.length; i += 1) {
      await (await contract.addOperator(OPERATORS[i])).wait(5);
      console.log('Added new operator', OPERATORS[i]);
    }
    console.log('Done');
  } else {
    throw new Error(`Missing orocle contract in ${name}`);
  }
});
