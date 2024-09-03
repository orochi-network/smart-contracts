import hre, { upgrades } from 'hardhat';
import { OrocleV2 } from '../typechain-types';
import { FixedFloat, OrocleEncoding } from '@orochi-network/utilities';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

let orocleV2: OrocleV2;
let operator: HardhatEthersSigner;

describe('OrocleV2', function () {
  it('OrocleV2 should be upgradeable', async () => {
    const { ethers } = hre;
    [operator] = await ethers.getSigners();
    const orocleV2Factory1 = await ethers.getContractFactory('OrocleTest');
    const orocleV2Factory2 = await ethers.getContractFactory('OrocleV2');

    const instance = await upgrades.deployProxy(orocleV2Factory1, [[operator.address]]);

    console.log('Instance:', await instance.owner(), await instance.getAddress());

    const upgraded = await upgrades.upgradeProxy(await instance.getAddress(), orocleV2Factory2);

    console.log('Upgrade', await upgraded.owner(), await upgraded.getAddress());
    orocleV2 = upgraded as any;
  });

  it('OrocleV2 should be upgradeable', async () => {
    await orocleV2.connect(operator).publishPrice(
      OrocleEncoding.encodeTokenPrice([
        {
          symbol: 'BTC',
          price: 42000n * 10n ** 18n,
        },
      ]),
    );
    const [round, lastUpdate, price] = await orocleV2.getLatestRound(1, OrocleEncoding.toIdentifier('BTC'));

    console.log('Round data:', { round, lastUpdate, price });

    console.log(
      'BTC/USDT',
      FixedFloat.fromFixedFloat({
        basedValue: BigInt(price),
        decimals: 18,
      }).pretty('en-us', 2),
    );
  });

  it('OrocleV2 should be upgradeable', async () => {
    await orocleV2.connect(operator).publishPrice(
      OrocleEncoding.encodeTokenPrice([
        {
          symbol: 'BTC',
          price: 42000n * 10n ** 18n,
        },
        {
          symbol: 'ETH',
          price: 3821n * 10n ** 18n,
        },
      ]),
    );
    const [round, lastUpdate, price] = await orocleV2.getLatestRound(1, OrocleEncoding.toIdentifier('ETH'));

    console.log('Round data:', { round, lastUpdate, price });

    console.log(
      'ETH/USDT',
      FixedFloat.fromFixedFloat({
        basedValue: BigInt(price),
        decimals: 18,
      }).pretty('en-us', 2),
    );

    console.log(await orocleV2.getLatestRound(1, OrocleEncoding.toIdentifier('BTC')));
  });
});
