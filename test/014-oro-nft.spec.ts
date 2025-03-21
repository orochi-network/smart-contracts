import { expect } from 'chai';
import hre from 'hardhat';
import { OroNft } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

let accounts: SignerWithAddress[];
let deployerSigner: SignerWithAddress;
let user01: SignerWithAddress;
let user02: SignerWithAddress;
let user03: SignerWithAddress;
let user04: SignerWithAddress;
let user05: SignerWithAddress;

let contract: OroNft;

describe('OroNft Contract', function () {
  before(async () => {
    accounts = await hre.ethers.getSigners();
    [deployerSigner, user01, user02, user03, user04, user05] = accounts;

    // Deploy the contract once
    const OroNft = await hre.ethers.getContractFactory('OroNft');
    contract = await OroNft.deploy(
      'https://baseuri.com/',
      'OroNft',
      'ORO',
      deployerSigner.address
    );
  });

  it('Should validate initial contract state', async () => {
    expect(await contract.maxSupplyGet()).to.equal(3000);
    expect(await contract.guaranteedSupplyGet()).to.equal(1600);
    expect(await contract.fcfsSupplyGet()).to.equal(1400);
  });

  it('Should allow the owner to add a guaranteed address', async () => {
    await contract.connect(deployerSigner).guaranteeAdd([user01.address]);
    expect(await contract.guaranteeAmountGet()).to.equal(1);
  });

  it('Should allow the owner to start the Guaranteed Phase and allow minting', async () => {
    await contract.connect(deployerSigner).currentPhaseSet(1);
    await contract.connect(user01).mintOroNft();
    expect(await contract.balanceOf(user01.address)).to.equal(1);
  });

  it('Should revert minting for non-guaranteed users in the Guaranteed Phase', async () => {
    await expect(contract.connect(user02).mintOroNft()).to.be.revertedWith('Not in Guarantee');
  });

  it('Should allow the owner to start the FCFS Phase and allow minting', async () => {
    await contract.connect(deployerSigner).fcfsAdd([user02.address]);
    await contract.connect(deployerSigner).currentPhaseSet(2);
    await contract.connect(user02).mintOroNft();
    expect(await contract.balanceOf(user02.address)).to.equal(1);
  });

  it('Should revert minting for non-FCFS users in the FCFS Phase', async () => {
    await expect(contract.connect(user03).mintOroNft()).to.be.revertedWith('Not in FCFS list');
  });

  it('Should allow public minting in the Public Phase', async () => {
    await contract.connect(deployerSigner).currentPhaseSet(3);
    await contract.connect(user03).mintOroNft();
    expect(await contract.balanceOf(user03.address)).to.equal(1);
  });

  

  
});
