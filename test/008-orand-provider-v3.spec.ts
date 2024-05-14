import hre, { upgrades } from 'hardhat';
import { HexString, OrandEncoding } from '@orochi-network/utilities';
import { getAddress, keccak256 } from 'ethers';

const pk =
  '042296393f4c4bfde812a53ed8bfa841c6251e9891fb0def611331b716a935ec91ad75abb573aada6599df5d3b34fa26853d9f5d89691aef7b811b8463c1561d5a';

describe('Box', function () {
  it('works', async () => {
    const { ethers } = hre;
    const accounts = await ethers.getSigners();
    const orocleV1Factory = await ethers.getContractFactory('OrocleV1');
    const orandECVRFV3Factory = await ethers.getContractFactory('OrandECVRFV3');
    const orand1Factory = await ethers.getContractFactory('OrandProviderV3');
    const orand2Factory = await ethers.getContractFactory('OrandProviderTest');

    const orocleV1 = await orocleV1Factory.deploy([accounts[0]]);
    console.log('Orocle V1', await orocleV1.getAddress());
    let correspondingAddress = getAddress(`0x${keccak256(`0x${pk.substring(2, 130)}`).substring(26, 66)}`);
    const orandECVRFV3 = await orandECVRFV3Factory.deploy();
    console.log('Orand ECVRF V3', await orandECVRFV3.getAddress());

    const instance = await upgrades.deployProxy(orand1Factory, [
      // uint256[2] memory publicKey
      OrandEncoding.pubKeyToAffine(HexString.hexPrefixAdd(pk)),
      // address operator
      correspondingAddress,
      // address ecvrfAddress
      await orandECVRFV3.getAddress(),
      // address oracleAddress
      await orocleV1.getAddress(),
      // uint256 maxBatchingLimit
      100,
    ]);

    console.log('Instance:', await instance.getOracle(), await instance.getAddress());

    const upgraded = await upgrades.upgradeProxy(await instance.getAddress(), orand2Factory);

    console.log('Upgrade', await upgraded.getOracle(), await upgraded.getAddress());
  });
});
