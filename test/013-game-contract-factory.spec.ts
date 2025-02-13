import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import hre, { ethers } from 'hardhat';
import Deployer from '../helpers/deployer';
import { GameContractFactory, GameContract } from '../typechain-types';
import { expect } from 'chai';
import { keccak256, toUtf8Bytes } from 'ethers';
import { gameContract } from '../typechain-types/contracts';

let accounts: SignerWithAddress[];
let deployerSigner: SignerWithAddress;
let user01: SignerWithAddress;
let user02: SignerWithAddress;
let user03: SignerWithAddress;
let user04: SignerWithAddress;
let factory: GameContractFactory;
let gameContractTemplate: GameContract;
let deployedGameContractAddress: string;

describe('GameContractFactory', function () {
  beforeEach(async () => {
    // Retrieve signers from Hardhat
    accounts = await hre.ethers.getSigners();
    [deployerSigner, user01, user02, user03, user04] = accounts;

    // Deploy the GameContract template first
    const deployer: Deployer = Deployer.getInstance(hre);
    deployer.connect(deployerSigner);

    // Deploy GameContract template
    gameContractTemplate = await deployer.contractDeploy<GameContract>('GameContract/GameContract', []);

    const gameContractAddress = await gameContractTemplate.getAddress();

    // Deploy the GameContractFactory contract with the GameContract template address
    factory = await deployer.contractDeploy<GameContractFactory>(
      'GameContract/GameContractFactory',
      [],
      gameContractAddress,
    );
  });

  it('Should deploy GameContract template and GameContractFactory correctly', async () => {
    // Verify that the contract owner is correctly set
    expect(await factory.owner()).to.equal(deployerSigner.address);
    expect(await factory.userTotal()).to.equal(0);
  });

  it('Should deploy GameContract from factory with correct owner', async () => {
    // Add user01 to signer list
    await factory.connect(deployerSigner).userListAdd([user01.address]);
    const salt = keccak256(toUtf8Bytes('randomSalt')).slice(0, 12);

    // Deploy new GameContract from the factory (clone the template)
    const tx = await factory.connect(user01).deployGameContract(user01.address, salt);
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
    const deployedGameContract = await hre.ethers.getContractAt('GameContract', deployedGameContractAddress);
    expect(await deployedGameContract.owner()).to.equal(user01.address);
  });

  it('Should return correct deployed contract list from factory', async () => {
    await factory.connect(deployerSigner).userListAdd([user01.address]);
    const salt = keccak256(toUtf8Bytes('randomSalt2')).slice(0, 12);

    // Deploy a new GameContract from the factory (clone)
    await factory.connect(user01).deployGameContract(user01.address, salt);

    // Get contract address deploy
    const deployedContracts = await ethers.getContractAt("GameContract", await factory.predictWalletAddress(salt,user01.address))
    expect( await deployedContracts.owner()).to.equal(user01.address);
  });

  it('Should only allow valid signers to deploy GameContract', async () => {
    const salt = keccak256(toUtf8Bytes('randomSalt')).slice(0, 12);
    await expect(factory.connect(user02).deployGameContract(user02.address, salt)).to.be.revertedWithCustomError(
      factory,
      'InvalidUser',
    );
  });

  it('Should allow signers to complete quests in the GameContract', async () => {
    await factory.connect(deployerSigner).userListAdd([user01.address]);
    const salt = keccak256(toUtf8Bytes('randomSaltForQuest')).slice(0, 12);
    const tx = await factory.connect(user01).deployGameContract(user01.address, salt);
    const receipt = await tx.wait();
    if (!receipt) {
      throw new Error(`Can not find receipt`);
    }
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
      throw new Error(`Can not find any log`);
    }
    const parsedEvent = factory.interface.parseLog(eventLog);
    if (!parsedEvent) {
      throw new Error(`Can not find any parse event`);
    }
    const deployedAddress = parsedEvent.args.contractAddress;
    const deployedGameContract = await hre.ethers.getContractAt('GameContract', deployedAddress);

    await deployedGameContract.connect(user01).userListAdd([user02.address]);

    // Test quest completion
    const questHash2 = keccak256(toUtf8Bytes('socialQuest'));
    await expect(deployedGameContract.connect(user02).questSubmitSocial(questHash2))
      .to.emit(deployedGameContract, 'QuestCompleteSocial')
      .withArgs(user02.address, questHash2);
  });

  it('Should prevent non-signers from completing quests', async () => {
    const questHash = keccak256(toUtf8Bytes('gameQuest'));
    await expect(
      factory.connect(user03).deployGameContract(user03.address, keccak256(toUtf8Bytes('salt')).slice(0, 12)),
    ).to.be.revertedWithCustomError(factory, 'InvalidUser');
  });
});
