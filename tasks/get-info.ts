/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '../helpers';
import { OrocleV1, OrandProviderV2 } from '../typechain-types';

const OROCLEV1_ADDRESS: any = {
  a8main: '0x11Af4c61D8D51016b8800EA71e42Cf7c3682Ab84',
  u2umain: '0xF1EE9eD597336B2a585DDb5A3DB6c5f0739cbE87',
  a8: '0xBF3Ff099fb6c23296Fd192df643ad49FCeD658D0',
  u2: '0xfA73F946E66eC366419c110f9Ae1AEe234eA714e',
  seitest: '0x2323e0098c260Fe5815e85e9EC127D53401Bd6e7',
};

const ORANDV2_ADDRESS: any = {
  a8main: '0x184Ae846c6AC7F7452350AB4Fa81C2cD986c64E1',
  u2umain: '0x8131bE6F2b15Bead0B8D675db9D3d43BFcb3eA72',
  a8: '0x5778CE57f49A5487D2127fd39a060D75aF694e8c',
  u2: '0xe97FE633EC2021A71214D5d9BfF9f337dD1db5c1',
  seitest: '0x1b95BCC7828719a4C2Dc74789708b70fE5EEa9Cf',
};

const operators: any = {
  a8main: ['0x22d5418e846bDf01EeD373f879Ee43283b061402', '0x8b8626544A03986fAB5134888c031CB61CC76680'],
  u2umain: ['0xdB0C9227974d080EB5B236914f610a49d908AAD2', '0xdEAaBBA9149AC4be9feE5ecA0939232688E19756'],
};

task('get:info', 'Deploy Orochi Network contracts').setAction(
  async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const network = hre.network.name;
    const deployer = Deployer.getInstance(hre).connect((await hre.ethers.getSigners())[0]);
    if (typeof OROCLEV1_ADDRESS[network] !== 'undefined') {
      const orocle = await deployer.contractAttach<OrocleV1>('orocle/OrocleV1', OROCLEV1_ADDRESS[network]);
      const orand = await deployer.contractAttach<OrandProviderV2>('orand/OrandProviderV2', ORANDV2_ADDRESS[network]);
      console.log('Orocle V1 Owner:', await orocle.owner());
      console.log('Orand V2 Owner:', await orand.owner());
      try {
        console.log('Orand and Orocle linked?:', (await orand.getOracle()) === OROCLEV1_ADDRESS[network]);
      } catch (e) {
        console.log('Old version');
      }
      if (typeof operators[network] !== 'undefined') {
        for (let i = 0; i < operators[network].length; i += 1) {
          const isOperator = await orocle.isOperator(operators[network][i]);
          if (isOperator) {
            const balance = await hre.ethers.provider.getBalance(operators[network][i]);
            console.log(`Operator ${i} balance:`, operators[network][i], Number(balance / 10n ** 12n) / 1000000);
          } else {
            console.log(`Not operator ${i}:`, operators[network][i]);
          }
        }
        console.log('Orand operator:', await orand.getOperator());
      }
    }
  },
);

export default {};
