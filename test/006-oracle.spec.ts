import hre from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { BitcoinSeller, OracleV1 } from '../typechain-types';
import { Deployer } from '../helpers';

let owner: SignerWithAddress;
let operator: SignerWithAddress;
let oracleV1: OracleV1;
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

describe('OracleV1', function () {
  it('oracle v1 must be deployed correctly', async () => {
    [owner, operator] = await hre.ethers.getSigners();
    deployer = Deployer.getInstance(hre).connect(owner);

    oracleV1 = await deployer.contractDeploy<OracleV1>('OracleV1/OracleV1', [], operator);
    bitcoinSeller = await deployer.contractDeploy<BitcoinSeller>('example/BitcoinSeller', [], oracleV1);

    const operatorAddress = await oracleV1.getOperator();
    console.log('\tOracle opeartor:', operatorAddress);

    expect(operatorAddress).to.eq(operator);
  });

  it('owner should able to create new application', async () => {
    const identifier = `0x${Buffer.from('BTC/USDT').toString('hex').padEnd(40, '0')}`;
    await expect(oracleV1.getLatestData(1, identifier)).to.revertedWithCustomError(oracleV1, 'UndefinedRound');
  });

  it('should not able to read data since operator did not feed', async () => {
    const appData = `0x${numberToBytes(1, 32)}${stringToBytes('AssetPrice', 24)}`;

    await oracleV1.newApplication(appData);

    console.log(oracleV1.interface.encodeFunctionData('newApplication', [appData]));

    console.log(await oracleV1.getApplication(1));
  });

  it('operator should able to publish data to Oracle', async () => {
    const identifier = `0x${stringToBytes('BTC/USDT', 20)}`;
    const packedData = `0x${numberToBytes(1, 32)}${stringToBytes('BTC/USDT', 20)}${numberToBytes(
      42000n * 10n ** 6n,
      256,
    )}`;
    await oracleV1.connect(operator).publishData(packedData);

    console.log(await oracleV1.getLatestData(1, identifier));
  });

  it('should able to use BitcoinSeller', async () => {
    console.log(await bitcoinSeller.estimate(1));
  });
});
