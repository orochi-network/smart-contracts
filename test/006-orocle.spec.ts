import hre from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { BitcoinSeller, OrocleV1 } from '../typechain-types';
import { Deployer } from '../helpers';
import { randomBytes } from 'crypto';

let owner: SignerWithAddress;
let operator: SignerWithAddress;
let somebody: SignerWithAddress;
let orocleV1: OrocleV1;
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
  symbol: string;
  price: bigint;
};

function tokenPricePackedData(input: AssetPrice[]): string {
  let packedData = '0x';
  for (let i = 0; i < input.length; i += 1) {
    const { symbol, price } = input[i];
    const chunk = `${stringToBytes(symbol, 8)}${numberToBytes(price, 128)}`;
    packedData += chunk;
  }
  return packedData;
}

describe('OrocleV1', function () {
  it('Orocle V1 must be deployed correctly', async () => {
    [owner, operator, somebody] = await hre.ethers.getSigners();
    deployer = Deployer.getInstance(hre).connect(owner);

    orocleV1 = await deployer.contractDeploy<OrocleV1>('OrocleV1/OrocleV1', [], [operator]);
    bitcoinSeller = await deployer.contractDeploy<BitcoinSeller>('example/BitcoinSeller', [], orocleV1);

    expect(await orocleV1.isOperator(operator)).to.eq(true);
  });

  it('owner should able to add an operator', async () => {
    await orocleV1.addOperator(somebody);
    expect(await orocleV1.isOperator(somebody)).to.eq(true);
  });

  it('owner should able to remove an operator', async () => {
    await orocleV1.removeOperator(somebody);
    expect(await orocleV1.isOperator(somebody)).to.eq(false);
  });

  it('should not able to read data since operator did not feed', async () => {
    const identifier = `0x${Buffer.from('BTC').toString('hex').padEnd(40, '0')}`;
    await expect(orocleV1.getData(1, 256, identifier)).to.revertedWithCustomError(orocleV1, 'UndefinedRound');
  });

  it('operator should able to publish asset price to Oracle', async () => {
    for (let j = 0; j < 520; j += 1) {
      const data = tokenPricePackedData([
        {
          symbol: 'BTC',
          price: 42000n * 10n ** 9n,
        },
        {
          symbol: 'ETH',
          price: 2000n * 10n ** 9n,
        },
        {
          symbol: 'DOT',
          price: 6n * 10n ** 9n,
        },
        {
          symbol: 'MINA',
          price: 1n * 10n ** 9n,
        },
        {
          symbol: 'USDT',
          price: 1n * 10n ** 9n,
        },
        {
          symbol: 'USDC',
          price: 1n * 10n ** 9n,
        },
        {
          symbol: 'USA',
          price: 1n * 10n ** 9n,
        },
        {
          symbol: 'USB',
          price: 1n * 10n ** 9n,
        },
        {
          symbol: 'USG',
          price: 1n * 10n ** 9n,
        },
        {
          symbol: 'USS',
          price: 1n * 10n ** 9n,
        },
      ]);

      await orocleV1.connect(operator).publishPrice(data);
    }
  });

  it('operator should able to publish asset price to Oracle', async () => {
    for (let j = 0; j < 520; j += 1) {
      const data = tokenPricePackedData([
        {
          symbol: 'BTC',
          price: 42000n * 10n ** 9n,
        },
        {
          symbol: 'ETH',
          price: 2000n * 10n ** 9n,
        },
        {
          symbol: 'DOT',
          price: 6n * 10n ** 9n,
        },
        {
          symbol: 'MINA',
          price: 1n * 10n ** 9n,
        },
      ]);

      await orocleV1.connect(operator).publishPrice(data);
    }
  });

  it('operator should able to publish token price to Oracle', async () => {
    const identifier = `0x${stringToBytes('BTC', 20)}`;

    const tokens = [];
    for (let i = 0; i < 100; i += 1) {
      tokens.push({
        symbol: Math.round(Math.random() * 1000000000).toString(16),
        price: BigInt(Math.round(Math.random() * 1000000000)),
      });
    }
    const data = tokenPricePackedData([
      {
        symbol: 'BTC',
        price: 42000n * 10n ** 9n,
      },
      {
        symbol: 'ETH',
        price: 2000n * 10n ** 9n,
      },
      {
        symbol: 'DOT',
        price: 6n * 10n ** 9n,
      },

      {
        symbol: 'MINA',
        price: 1n * 10n ** 9n,
      },
      ...tokens,
    ]);

    await orocleV1.connect(operator).publishPrice(data);
    console.log('\tApp Id:', 1, 'identifier:', identifier);
    console.log('\tLatest data:', await orocleV1.getLatestData(1, identifier));
    console.log('\tApplication metadata:', await orocleV1.getMetadata(1, identifier));
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

    let r = await orocleV1.connect(operator).publishData(2, packedData);
    let t = await r.wait();

    for (let i = 0; i < 100; i += 1) {
      expect((await orocleV1.getData(2, 1, identifier[i])).toLowerCase()).to.eq(data[i]);
    }
  });

  it('should able to use BitcoinSeller', async () => {
    console.log('\tPrice for 2 BTC:', (await bitcoinSeller.estimate(2)) / 10n ** 9n, 'USDT');
    const price = (await bitcoinSeller.ethOverBtc()) / 10n ** 12n;
    console.log('\tPrice of 1 ETH/BTC:', Number(price) / 1000000, 'BTC');
  });

  it('Oracle must pack correct data', async () => {
    const data =
      '42544300000000000000000000000eedeb84ba803e17d400455448000000000000000000000000c36f172341703e55b0424e42000000000000000000000000204148a38e0d6c00004144410000000000000000000000000008f70d93cce700005852500000000000000000000000000008b27c5460bcc000555344430000000000000000000000000de000cd866f80004c494e4b00000000000000000000000108d46f64d8c779d0534f4c0000000000000000000000000af98ee25fb9d4d380444f5400000000000000000000000000868f1ca0de2fff0041564158000000000000000000000002e62f20a69be3f3c0';
    await orocleV1.connect(operator).publishPrice(`0x${data}`);
    for (let i = 0; i < data.length; i += 48) {
      const chunk = data.substring(i, i + 48);
      const identifier = `0x${chunk.substring(0, 16).padEnd(40, '0')}`;
      const price = BigInt(`0x${chunk.substring(16)}`);
      const [round, timestamp, value] = await orocleV1.getLatestRound(1, identifier);
      console.log(
        Buffer.from(chunk.substring(0, 16), 'hex').toString().trim(),
        Number(price / 10n ** 12n) / 1000000,
        'USDT',
      );
      expect(BigInt(value)).to.eq(price);
    }
  });
});
