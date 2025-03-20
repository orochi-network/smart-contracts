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
let contract: OroNft;

describe('OroNft Contract', function () {
  beforeEach(async () => {
    accounts = await hre.ethers.getSigners();
    [deployerSigner, user01, user02, user03, user04] = accounts;

    const OroNft = await hre.ethers.getContractFactory('OroNft');
    contract = await OroNft.deploy(
      "https://baseuri.com/", 
      Math.floor(Date.now() / 1000), 
      Math.floor(Date.now() / 1000) + 100, 
      Math.floor(Date.now() / 1000) + 101, 
      Math.floor(Date.now() / 1000) + 200, 
      Math.floor(Date.now() / 1000) + 300
    );
    await contract.deployed();
  });

  it('Should deploy contract correctly and initialize state', async () => {
    expect(await contract.getMaxSupply()).to.equal(3000);
    expect(await contract.getGuaranteedSupply()).to.equal(1600);
    expect(await contract.getFcfsSupply()).to.equal(1400);
  });

  it('Should mint NFT in Guaranteed Phase', async () => {
    await hre.ethers.provider.send('evm_increaseTime', [101]);
    await hre.ethers.provider.send('evm_mine', []);

    await contract.addGuarantee([user01.address]);

    const initialBalance = await hre.ethers.provider.getBalance(user01.address);
    await contract.connect(user01).guaranteedMint();
    const finalBalance = await hre.ethers.provider.getBalance(user01.address);

    expect(finalBalance).to.equal(initialBalance);
    expect(await contract.getTokenIndex(user01.address)).to.equal(1);
  });

  it('Should not mint NFT outside the Guaranteed Phase', async () => {
    await expect(contract.connect(user01).guaranteedMint()).to.be.revertedWith('Not in Guaranteed Phase');
  });

  it('Should mint NFT in FCFS Phase with enough ETH', async () => {
    await hre.ethers.provider.send('evm_increaseTime', [202]);
    await hre.ethers.provider.send('evm_mine', []);

    const initialBalance = await hre.ethers.provider.getBalance(user01.address);
    await contract.connect(user01).fcfsMint({ value: hre.ethers.parseEther('0.05') });

    const finalBalance = await hre.ethers.provider.getBalance(user01.address);
    expect(finalBalance).to.equal(initialBalance - hre.ethers.parseEther('0.05'));
  });

  it('Should revert if insufficient ETH in FCFS Phase', async () => {
    await hre.ethers.provider.send('evm_increaseTime', [202]);
    await hre.ethers.provider.send('evm_mine', []);

    await expect(contract.connect(user01).fcfsMint({ value: hre.ethers.parseEther('0.01') })).to.be.revertedWith('Insufficient ETH');
  });

  it('Should mint NFT in Public Phase', async () => {
    await hre.ethers.provider.send('evm_increaseTime', [302]);
    await hre.ethers.provider.send('evm_mine', []);

    const initialBalance = await hre.ethers.provider.getBalance(user01.address);
    await contract.connect(user01).publicMint({ value: hre.ethers.parseEther('0.1') });

    const finalBalance = await hre.ethers.provider.getBalance(user01.address);
    expect(finalBalance).to.equal(initialBalance - hre.ethers.parseEther('0.1'));
  });

  it('Should revert minting outside valid phases', async () => {
    await expect(contract.connect(user01).publicMint({ value: hre.ethers.parseEther('0.1') })).to.be.revertedWith('Not in Public Phase');
  });

  it('Should handle changing sale phase times correctly', async () => {
    await contract.setSalePhaseTimes(
      Math.floor(Date.now() / 1000) + 10, 
      Math.floor(Date.now() / 1000) + 100, 
      Math.floor(Date.now() / 1000) + 101, 
      Math.floor(Date.now() / 1000) + 200, 
      Math.floor(Date.now() / 1000) + 300  
    );

    expect(await contract.getGuaranteedStartTime()).to.equal(Math.floor(Date.now() / 1000) + 10);
  });

  it('Should not allow invalid phase order for sale times', async () => {
    await expect(
      contract.setSalePhaseTimes(
        Math.floor(Date.now() / 1000) + 10, 
        Math.floor(Date.now() / 1000) + 5,  
        Math.floor(Date.now() / 1000) + 101, 
        Math.floor(Date.now() / 1000) + 200, 
        Math.floor(Date.now() / 1000) + 300  
      )
    ).to.be.revertedWith('Guarantee start time must be before end time');
  });

  it('Should allow updating guaranteed supply correctly', async () => {
    await contract.setGuaranteedSupply(1700);
    expect(await contract.getGuaranteedSupply()).to.equal(1700);
  });

  it('Should handle adding multiple guarantees correctly', async () => {
    await contract.addGuarantee([user01.address, user02.address]);
    expect(await contract.getGuaranteeAmount()).to.equal(2);

    await expect(
      contract.addGuarantee([user01.address, user02.address, user03.address])
    ).to.be.revertedWith('Cannot add more than allowed Guarantee Supply');
  });

  it('Should handle removing non-existing guarantees without errors', async () => {
    await contract.addGuarantee([user01.address, user02.address, user03.address]);
    expect(await contract.getGuaranteeAmount()).to.equal(3);

    await contract.removeGuarantee(user04.address);  
    expect(await contract.getGuaranteeAmount()).to.equal(3);

    await contract.removeGuarantee(user03.address);  
    expect(await contract.getGuaranteeAmount()).to.equal(2);
  });

  it('Should handle ownership transfer correctly', async () => {
    expect(await contract.owner()).to.equal(deployerSigner.address);

    await contract.connect(deployerSigner).transferOwnership(user01.address);
    expect(await contract.owner()).to.equal(user01.address);

    await expect(contract.connect(deployerSigner).transferOwnership(user02.address))
      .to.be.revertedWith('Ownable: caller is not the owner');
    
    await contract.connect(user01).transferOwnership(user02.address);
    expect(await contract.owner()).to.equal(user02.address);
  });
});
