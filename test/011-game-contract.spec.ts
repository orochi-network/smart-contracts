import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import hre from 'hardhat';
import Deployer from '../helpers/deployer';
import { GameContract } from '../typechain-types';
import { expect } from 'chai';
import { keccak256, toUtf8Bytes } from 'ethers';


let accounts: SignerWithAddress[];
let deployerSigner: SignerWithAddress;
let user01: SignerWithAddress;
let user02: SignerWithAddress;
let user03: SignerWithAddress;
let user04: SignerWithAddress;
let user05: SignerWithAddress;
let user06: SignerWithAddress;
let user07: SignerWithAddress;

let contract: GameContract;

describe('Game Contract', function () {
  beforeEach(async () => {
    accounts = await hre.ethers.getSigners();
    [deployerSigner, user01, user02, user03, user04, user05, user06, user07] = accounts;

    const deployer: Deployer = Deployer.getInstance(hre);
    deployer.connect(deployerSigner);
    contract = await deployer.contractDeploy<GameContract>('GameContract/GameContract', []);
  });

  it('Should deploy contract correctly and initialize state', async () => {
    expect(await contract.owner()).to.equal(deployerSigner.address);
    expect(await contract.getTotalSigner()).to.equal(0);
  });

  it('Only owner can add and remove signers', async () => {
    await contract.connect(deployerSigner).addListSigner([user01.address, user02.address]);
    expect(await contract.isSigner(user01.address)).to.be.true;
    expect(await contract.isSigner(user02.address)).to.be.true;

    await contract.connect(deployerSigner).removeListSigner([user01.address]);
    expect(await contract.isSigner(user01.address)).to.be.false;

    await expect(contract.connect(user01).addListSigner([user03.address])).to.be.revertedWith(
      'Ownable: caller is not the owner',
    );

    await expect(contract.connect(user01).removeListSigner([user02.address])).to.be.revertedWith(
      'Ownable: caller is not the owner',
    );
  });

  it('Should handle adding multiple signers and totalSigner count', async () => {
    await contract.connect(deployerSigner).addListSigner([user01.address, user02.address, user03.address]);
    expect(await contract.getTotalSigner()).to.equal(3);

    await contract.connect(deployerSigner).removeListSigner([user02.address]);
    expect(await contract.getTotalSigner()).to.equal(2);

    await contract.connect(deployerSigner).removeListSigner([user01.address, user03.address]);
    expect(await contract.getTotalSigner()).to.equal(0);
  });

  it('Should reject duplicate signers and not affect totalSigner', async () => {
    await contract.connect(deployerSigner).addListSigner([user01.address, user02.address]);
    expect(await contract.getTotalSigner()).to.equal(2);

    await contract.connect(deployerSigner).addListSigner([user01.address, user02.address, user03.address]);
    expect(await contract.getTotalSigner()).to.equal(3);
  });

  it('Should handle removing non-existent signers without errors', async () => {
    await contract.connect(deployerSigner).addListSigner([user01.address, user02.address, user03.address]);
    expect(await contract.getTotalSigner()).to.equal(3);

    expect(await contract.isSigner(user03.address)).to.be.true;
    expect(await contract.isSigner(user04.address)).to.be.false;

    await contract.connect(deployerSigner).removeListSigner([user04.address]);
    expect(await contract.getTotalSigner()).to.equal(3);

    await contract.connect(deployerSigner).removeListSigner([user03.address]);
    expect(await contract.getTotalSigner()).to.equal(2);
  });

  it('Only valid signers can perform user actions', async () => {
    const loginQuest = keccak256(toUtf8Bytes('login'));
    const tweetQuest = keccak256(toUtf8Bytes('Tweet'));

    await contract.connect(deployerSigner).addListSigner([user01.address, user02.address]);

    await expect(contract.connect(user01).dailyQuestSubmit(loginQuest))
      .to.emit(contract, 'DailyQuestSubmit')
      .withArgs(user01.address, loginQuest);

    await expect(contract.connect(user02).socialQuestSubmit(tweetQuest))
      .to.emit(contract, 'SocialQuestSubmit')
      .withArgs(user02.address, tweetQuest);

    expect(await contract.isSigner(user03.address)).to.be.false;

    await expect(contract.connect(user03).dailyQuestSubmit(loginQuest)).to.be.revertedWithCustomError(
      contract,
      'InvalidGameContractUser',
    );
  });

  it('Should handle bytes32 questName for events', async () => {
    const questName = keccak256(toUtf8Bytes('playGame'));
    await contract.connect(deployerSigner).addListSigner([user01.address]);

    await expect(contract.connect(user01).gameQuestSubmit(questName))
      .to.emit(contract, 'GameQuestSubmit')
      .withArgs(user01.address, questName);
  });
  it('Should transfer ownership correctly', async () => {
    expect(await contract.owner()).to.equal(deployerSigner.address);

    await contract.connect(deployerSigner).transferOwnership(user01.address);
    expect(await contract.owner()).to.equal(user01.address);

    await expect(contract.connect(deployerSigner).transferOwnership(user02.address)).to.be.revertedWith(
      'Ownable: caller is not the owner',
    );

    await contract.connect(user01).transferOwnership(user02.address);
    expect(await contract.owner()).to.equal(user02.address);
  });
});
