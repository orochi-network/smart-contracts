import hre from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { BitcoinSeller, OrocleV1 } from '../typechain-types';
import { Deployer } from '../helpers';
import { randomBytes } from 'crypto';

let owner: SignerWithAddress;
let operator: SignerWithAddress;
let somebody: SignerWithAddress;
let OrocleV1: OrocleV1;
let bitcoinSeller: BitcoinSeller;
let deployer: Deployer;

function numberToBytes(input: number | bigint, bits: number) {
  return input.toString(16).padStart((bits / 8) * 2, '0');
}

function stringToBytes(input: string, length: number) {
  return Buffer.from(input)
    .toString('hex')
    .padEnd(length * 2, '0');
}

export type AssetPrice = {
  pair: string;
  price: bigint;
};

function tokenPricePackedData(appId: number, input: AssetPrice[]): [string, string] {
  let packedData = '0x';
  let chunksize = 0;
  for (let i = 0; i < input.length; i += 1) {
    const { pair, price } = input[i];
    const chunk = `${stringToBytes(pair, 20)}${numberToBytes(price, 256)}`;
    packedData += chunk;
    if (i === 0) {
      chunksize = chunk.length / 2;
    }
  }
  return [`0x${numberToBytes(appId, 32)}${numberToBytes(chunksize, 224)}`, packedData];
}

describe('OrocleV1', function () {
  it('Orocle V1 must be deployed correctly', async () => {
    [owner, operator, somebody] = await hre.ethers.getSigners();
    deployer = Deployer.getInstance(hre).connect(owner);

    OrocleV1 = await deployer.contractDeploy<OrocleV1>('OrocleV1/OrocleV1', [], [operator]);
    bitcoinSeller = await deployer.contractDeploy<BitcoinSeller>('example/BitcoinSeller', [], OrocleV1);

    expect(await OrocleV1.isOperator(operator)).to.eq(true);
  });

  it('owner should able to add an operator', async () => {
    await OrocleV1.addOperator(somebody);
    expect(await OrocleV1.isOperator(somebody)).to.eq(true);
  });

  it('owner should able to remove an operator', async () => {
    await OrocleV1.removeOperator(somebody);
    expect(await OrocleV1.isOperator(somebody)).to.eq(false);
  });

  it('should not able to read data since operator did not feed', async () => {
    const identifier = `0x${Buffer.from('BTC').toString('hex').padEnd(40, '0')}`;
    await expect(OrocleV1.getLatestData(1, identifier)).to.revertedWithCustomError(OrocleV1, 'UndefinedRound');
  });

  it('owner should able to create new application', async () => {
    const appData = `0x${numberToBytes(1, 128)}${stringToBytes('AssetPrice', 16)}`;
    await OrocleV1.newApplication(appData);

    await OrocleV1.newApplication(`0x${numberToBytes(2, 128)}${stringToBytes('DataStorage', 16)}`);

    console.log(OrocleV1.interface.encodeFunctionData('newApplication', [appData]));

    console.log(await OrocleV1.getApplication(1));
  });

  it('operator should able to publish data to Oracle', async () => {
    for (let j = 0; j < 520; j += 1) {
      const data = tokenPricePackedData(1, [
        {
          pair: 'BTC',
          price: 42000n * 10n ** 18n,
        },
        {
          pair: 'ETH',
          price: 2000n * 10n ** 18n,
        },
        {
          pair: 'DOT',
          price: 6n * 10n ** 18n,
        },
        {
          pair: 'MINA',
          price: 1n * 10n ** 18n,
        },
      ]);

      await OrocleV1.connect(operator).publishData(...data);
    }
  });

  it('operator should able to publish data to Oracle', async () => {
    const identifier = `0x${stringToBytes('BTC', 20)}`;

    const tokens = [];
    for (let i = 0; i < 100; i += 1) {
      tokens.push({
        pair: Math.round(Math.random() * 1000000000).toString(16),
        price: BigInt(Math.round(Math.random() * 1000000000)),
      });
    }
    const data = tokenPricePackedData(1, [
      {
        pair: 'BTC',
        price: 42000n * 10n ** 18n,
      },
      {
        pair: 'ETH',
        price: 2000n * 10n ** 18n,
      },
      {
        pair: 'DOT',
        price: 6n * 10n ** 18n,
      },

      {
        pair: 'MINA',
        price: 1n * 10n ** 18n,
      },
      ...tokens,
    ]);

    await OrocleV1.connect(operator).publishData(...data);
    console.log('\tApp Id:', 1, 'identifier:', identifier);
    console.log('\tLatest data:', await OrocleV1.getLatestData(1, identifier));
    console.log('\tApplication metadata:', await OrocleV1.getApplication(1));
  });

  it('data correctness must be guarantee', async () => {
    const identifier = [];
    const data = [];
    let packedData = '0x';
    for (let i = 0; i < 100; i += 1) {
      const id = randomBytes(20).toString('hex').padStart(40, '0');
      const dat = randomBytes(32).toString('hex').padStart(64, '0');
      packedData += id;
      packedData += dat;
      identifier.push(`0x${id.toLowerCase()}`);
      data.push(`0x${dat.toLowerCase()}`);
    }

    await OrocleV1.connect(operator).publishData(`0x${numberToBytes(2, 32)}${numberToBytes(52, 224)}`, packedData);

    for (let i = 0; i < 100; i += 1) {
      expect((await OrocleV1.getData(2, 1, identifier[i])).toLowerCase()).to.eq(data[i]);
    }
  });

  it('should able to use BitcoinSeller', async () => {
    console.log('\tPrice for 2 BTC:', (await bitcoinSeller.estimate(2)) / 10n ** 18n, 'USDT');
    const price = (await bitcoinSeller.ethOverBtc()) / 10n ** 15n;
    console.log('\tPrice of 1 ETH/BTC:', Number(price) / 1000, 'BTC');
  });
});
