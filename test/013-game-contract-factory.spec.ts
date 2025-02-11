import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import hre from 'hardhat';
import Deployer from '../helpers/deployer';
import { GameContractFactory, GameContract } from '../typechain-types';
import { expect } from 'chai';
import { keccak256, toUtf8Bytes } from 'ethers';

let accounts: SignerWithAddress[];
let deployerSigner: SignerWithAddress;
let user01: SignerWithAddress;
let user02: SignerWithAddress;
let user03: SignerWithAddress;
let user04: SignerWithAddress;
let user05: SignerWithAddress;
let factory: GameContractFactory;
let gameContract: GameContract;
let deployedGameContractAddress: string;

describe('GameContractFactory', function () {
  beforeEach(async () => {
    // Retrieve signers from Hardhat
    accounts = await hre.ethers.getSigners();
    [deployerSigner, user01, user02, user03, user04, user05] = accounts;

    // Deploy the GameContractFactory contract
    const deployer: Deployer = Deployer.getInstance(hre);
    deployer.connect(deployerSigner);
    factory = await deployer.contractDeploy<GameContractFactory>('GameContract/GameContractFactory', []);
  });

  it('Should deploy contract correctly and initialize state', async () => {
    // Verify that the contract owner is correctly set
    expect(await factory.owner()).to.equal(deployerSigner.address);
    // Ensure the signer count starts at zero
    expect(await factory.signerTotal()).to.equal(0);
  });

  it('Only owner can add and remove signers', async () => {
    // Add new signers to the list
    await factory.connect(deployerSigner).signerListAdd([user01.address, user02.address]);
    expect(await factory.signerCheck(user01.address)).to.be.true;
    expect(await factory.signerCheck(user02.address)).to.be.true;

    // Remove a signer from the list
    await factory.connect(deployerSigner).signerListRemove([user01.address]);
    expect(await factory.signerCheck(user01.address)).to.be.false;

    // Ensure that non-owners cannot add or remove signers
    await expect(factory.connect(user01).signerListAdd([user03.address])).to.be.revertedWith(
      'Ownable: caller is not the owner',
    );
    await expect(factory.connect(user01).signerListRemove([user02.address])).to.be.revertedWith(
      'Ownable: caller is not the owner',
    );
  });

  it('Should correctly track signer total', async () => {
    // Add multiple signers and check count
    await factory.connect(deployerSigner).signerListAdd([user01.address, user02.address, user03.address]);
    expect(await factory.signerTotal()).to.equal(3);

    // Remove a signer and check count again
    await factory.connect(deployerSigner).signerListRemove([user02.address]);
    expect(await factory.signerTotal()).to.equal(2);
  });

  it('Should deploy GameContract and set ownership correctly', async () => {
    // Ensure only signers can deploy a GameContract
    await factory.connect(deployerSigner).signerListAdd([user01.address]);
    const salt = keccak256(toUtf8Bytes('randomSalt'));
    const tx = await factory.connect(user01).deployGameContract(user01.address, salt);

    // Retrieve transaction receipt
    const receipt = await tx.wait();
    if (!receipt) {
      throw new Error(`Can not find receipt`);
    }

    // Extract event logs to find the deployed contract address
    const eventLog = receipt.logs.find((log) => {
      try {
        const parsedLog = factory.interface.parseLog(log);
        if (parsedLog) {
          return parsedLog.name === 'GameContractDeploy';
        }
      } catch (error) {
        return false;
      }
    });

    if (!eventLog) {
      throw new Error('GameContractDeploy event not found');
    }

    const parsedEvent = factory.interface.parseLog(eventLog);
    if (!parsedEvent) {
      throw new Error(`can not find any parse event`);
    }
    deployedGameContractAddress = parsedEvent.args.contractAddress;

    // Load the deployed contract and verify ownership
    gameContract = await hre.ethers.getContractAt('GameContract', deployedGameContractAddress);
    expect(await gameContract.owner()).to.equal(user01.address);
  });

  it('Only valid signers can deploy GameContract', async () => {
    const salt = keccak256(toUtf8Bytes('randomSalt'));
    await expect(factory.connect(user02).deployGameContract(user02.address, salt)).to.be.revertedWithCustomError(
      factory,
      'InvalidUser',
    );
  });

  it('Should return correct deployed contract list', async () => {
    await factory.connect(deployerSigner).signerListAdd([user04.address]);
    const salt = keccak256(toUtf8Bytes('randomSalt2'));
    await factory.connect(user04).deployGameContract(user04.address, salt);

    const deployedContracts = await factory.getContractListDeploy();
    console.log(deployedContracts.length);
    expect(deployedContracts.length).to.equal(2);
  });

  it('Should emit correct events when adding and removing signers', async () => {
    const signersToAdd = [user01.address, user02.address];
    const txAdd = await factory.connect(deployerSigner).signerListAdd(signersToAdd);
    const blockAdd = await hre.ethers.provider.getBlock('latest');
    if (!blockAdd) {
      throw new Error(`Can not find block`);
    }
    const totalSigner = await factory.signerTotal();
    console.log(totalSigner.toString());
    await expect(txAdd).to.emit(factory, 'SignerListAdd').withArgs(totalSigner, blockAdd.timestamp);

    const txRemove = await factory.connect(deployerSigner).signerListRemove([user01.address]);
    const blockRemove = await hre.ethers.provider.getBlock('latest');
    if (!blockRemove) {
      throw new Error(`Can not find block`);
    }
    const totalSignerAfterRemove = await factory.signerTotal();

    await expect(txRemove)
      .to.emit(factory, 'SignerListRemove')
      .withArgs(totalSignerAfterRemove, blockRemove.timestamp);
  });

  it('Should correctly check signer statuses', async () => {
    await factory.connect(deployerSigner).signerListAdd([user01.address, user02.address]);
    const statuses = await factory.signerListCheck([user01.address, user02.address, user05.address]);
    expect(statuses).to.deep.equal([true, true, false]);
  });

  it('Should transfer ownership correctly', async () => {
    expect(await factory.owner()).to.equal(deployerSigner.address);

    await factory.connect(deployerSigner).transferOwnership(user01.address);
    expect(await factory.owner()).to.equal(user01.address);

    await expect(factory.connect(deployerSigner).transferOwnership(user02.address)).to.be.revertedWith(
      'Ownable: caller is not the owner',
    );

    await factory.connect(user01).transferOwnership(user02.address);
    expect(await factory.owner()).to.equal(user02.address);
  });

  it('GameContract should allow only the owner to add signers', async () => {
    await gameContract.connect(user01).signerListAdd([user02.address]);
    expect(await gameContract.signerCheck(user02.address)).to.be.true;

    await expect(gameContract.connect(user02).signerListAdd([user03.address])).to.be.revertedWith(
      'Ownable: caller is not the owner',
    );
  });

  it('GameContract should allow signers to complete quests', async () => {
    const questHash = keccak256(toUtf8Bytes('dailyQuest'));
    await gameContract.connect(user01).signerListAdd([user02.address]);

    await expect(gameContract.connect(user02).questSubmitDaily(questHash))
      .to.emit(gameContract, 'QuestCompleteDaily')
      .withArgs(user02.address, questHash);
  });

  it('GameContract should prevent non-signers from submit quests', async () => {
    const questHash = keccak256(toUtf8Bytes('dailyQuest'));
    await expect(gameContract.connect(user03).questSubmitDaily(questHash)).to.be.revertedWithCustomError(
      gameContract,
      'InvalidUser',
    );
  });
});
