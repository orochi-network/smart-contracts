import hre, { upgrades } from 'hardhat';

describe('OrocleV1', function () {
  it('OrocleV1 should be upgradeable', async () => {
    const { ethers } = hre;
    const accounts = await ethers.getSigners();
    const orocleV1Factory = await ethers.getContractFactory('OrocleTest');
    const orocleV2Factory = await ethers.getContractFactory('OrocleV1');

    const instance = await upgrades.deployProxy(orocleV1Factory, [accounts[0]]);

    console.log('Instance:', await instance.owner(), await instance.getAddress());

    const upgraded = await upgrades.upgradeProxy(await instance.getAddress(), orocleV2Factory);

    console.log('Upgrade', await upgraded.owner(), await upgraded.getAddress());
  });
});
