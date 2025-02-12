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
  // Before each test, deploy contract and set up accounts
  beforeEach(async () => {
    accounts = await hre.ethers.getSigners();
    [deployerSigner, user01, user02, user03, user04, user05, user06, user07] = accounts;

    const deployer: Deployer = Deployer.getInstance(hre);
    deployer.connect(deployerSigner);
    contract = await deployer.contractDeploy<GameContract>('GameContract/GameContract', []);
  });

  it('Should deploy contract correctly and initialize state', async () => {
    // Ensure the contract is deployed with the correct owner and signer count is initialized to 0
    expect(await contract.owner()).to.equal(deployerSigner.address);
    expect(await contract.userTotal()).to.equal(0);
  });

  it('Only owner can add and remove signers', async () => {
    // Add user01 and user02 by the owner (deployerSigner)
    await contract.connect(deployerSigner).userListAdd([user01.address, user02.address]);

    // Ensure the users have been added successfully
    expect(await contract.userCheck(user01.address)).to.be.true;
    expect(await contract.userCheck(user02.address)).to.be.true;

    // Remove user01 by the owner
    await contract.connect(deployerSigner).userListRemove([user01.address]);
    expect(await contract.userCheck(user01.address)).to.be.false;

    // Only owner (deployerSigner) can add and remove signers, others should fail
    await expect(contract.connect(user01).userListAdd([user03.address])).to.be.revertedWith(
      'Ownable: caller is not the owner',
    );
    await expect(contract.connect(user01).userListRemove([user02.address])).to.be.revertedWith(
      'Ownable: caller is not the owner',
    );
  });

  it('Should handle adding multiple signers and totalSigner count', async () => {
    // Add 3 signers and check if the signer total count is updated
    await contract.connect(deployerSigner).userListAdd([user01.address, user02.address, user03.address]);
    expect(await contract.userTotal()).to.equal(3);

    // Remove one signer and check total signer count again
    await contract.connect(deployerSigner).userListRemove([user02.address]);
    expect(await contract.userTotal()).to.equal(2);

    // Remove the remaining signers and ensure total signer count is 0
    await contract.connect(deployerSigner).userListRemove([user01.address, user03.address]);
    expect(await contract.userTotal()).to.equal(0);
  });

  it('Should reject duplicate signers and not affect totalSigner', async () => {
    // Add 2 signers and ensure totalSigner = 2
    await contract.connect(deployerSigner).userListAdd([user01.address, user02.address]);
    expect(await contract.userTotal()).to.equal(2);

    // Add duplicate signers, totalSigner should not be affected and gonna be 3
    await contract.connect(deployerSigner).userListAdd([user01.address, user02.address, user03.address]);
    expect(await contract.userTotal()).to.equal(3);
  });

  it('Should handle removing non exist signers without errors', async () => {
    // Add signers and check totalSigner
    await contract.connect(deployerSigner).userListAdd([user01.address, user02.address, user03.address]);
    expect(await contract.userTotal()).to.equal(3);

    // Try removing a non exist signer (user04) without errors
    await contract.connect(deployerSigner).userListRemove([user04.address]);
    expect(await contract.userTotal()).to.equal(3);

    // Remove an existing signer and verify totalSigner updates
    await contract.connect(deployerSigner).userListRemove([user03.address]);
    expect(await contract.userTotal()).to.equal(2);
  });

  it('Only valid signers can perform user actions', async () => {
    // Prepare the quest hashes
    const loginQuest = keccak256(toUtf8Bytes('login'));
    const tweetQuest = keccak256(toUtf8Bytes('Tweet'));

    // Add signers
    await contract.connect(deployerSigner).userListAdd([user01.address, user02.address]);

    // Only valid signers (user01, user02) can submit quests
    await expect(contract.connect(user01).questSubmitDaily(loginQuest))
      .to.emit(contract, 'QuestCompleteDaily')
      .withArgs(user01.address, loginQuest);

    await expect(contract.connect(user02).questSubmitSocial(tweetQuest))
      .to.emit(contract, 'QuestCompleteSocial')
      .withArgs(user02.address, tweetQuest);

    // user03 is not a valid signer, so the action should be rejected
    await expect(contract.connect(user03).questSubmitDaily(loginQuest)).to.be.revertedWithCustomError(
      contract,
      'InvalidUser',
    );
  });

  it('Should handle bytes32 questName for events', async () => {
    // Submit a game quest with a bytes32 quest name and check the event emission
    const questName = keccak256(toUtf8Bytes('playGame'));
    await contract.connect(deployerSigner).userListAdd([user01.address]);

    await expect(contract.connect(user01).questSubmitGame(questName))
      .to.emit(contract, 'QuestCompleteGame')
      .withArgs(user01.address, questName);
  });

  it('Should emit AddListSigner event with correct totalAddedUser and timestamp', async () => {
    // Add signers and ensure the correct event is emitted
    const signersToAdd = [user01.address, user02.address, user03.address];
    const tx = await contract.connect(deployerSigner).userListAdd(signersToAdd);

    // Get the current block's timestamp
    const block = await hre.ethers.provider.getBlock('latest');
    if (!block) {
      throw new Error('Unable to fetch the latest block.');
    }

    // Check if the correct event is emitted with the expected arguments
    await expect(tx).to.emit(contract, 'UserListAdd').withArgs(signersToAdd.length, block.timestamp);

    // Verify signer total count is correct
    expect(await contract.userTotal()).to.equal(signersToAdd.length);
  });

  it('Should emit RemoveListSigner event with correct totalAddedUser and timestamp', async () => {
    // Add signers and then remove them
    const signersToAdd = [user01.address, user02.address, user03.address];
    const signersToRemove = [user01.address, user03.address];

    await contract.connect(deployerSigner).userListAdd(signersToAdd);

    const tx = await contract.connect(deployerSigner).userListRemove(signersToRemove);

    // Get the current block's timestamp
    const block = await hre.ethers.provider.getBlock('latest');
    if (!block) {
      throw new Error('Unable to fetch the latest block.');
    }

    // Check if the correct event is emitted with the expected arguments
    await expect(tx)
      .to.emit(contract, 'UserListRemove')
      .withArgs(signersToAdd.length - signersToRemove.length, block.timestamp);

    // Verify signer total count is updated correctly
    expect(await contract.userTotal()).to.equal(signersToAdd.length - signersToRemove.length);
  });

  it('Should correctly return signer statuses using checkListSigner', async () => {
    // Add signers and non-signers, then check their statuses
    const signersToAdd = [user01.address, user02.address, user03.address];
    const nonSigners = [user04.address, user05.address];

    await contract.connect(deployerSigner).userListAdd(signersToAdd);

    // Check the status of all users
    const statuses = await contract.userListCheck([...signersToAdd, ...nonSigners]);
    expect(statuses).to.deep.equal([true, true, true, false, false]);

    // Remove one signer and check the updated statuses
    await contract.connect(deployerSigner).userListRemove([user01.address]);
    const updatedStatuses = await contract.userListCheck([...signersToAdd, ...nonSigners]);
    expect(updatedStatuses).to.deep.equal([false, true, true, false, false]);
  });

  it('Should transfer ownership correctly', async () => {
    // Check initial owner
    expect(await contract.owner()).to.equal(deployerSigner.address);

    // Transfer ownership to user01 and check
    await contract.connect(deployerSigner).transferOwnership(user01.address);
    expect(await contract.owner()).to.equal(user01.address);

    // Only the current owner can transfer ownership
    await expect(contract.connect(deployerSigner).transferOwnership(user02.address)).to.be.revertedWith(
      'Ownable: caller is not the owner',
    );

    // user01 (new owner) transfers ownership to user02
    await contract.connect(user01).transferOwnership(user02.address);
    expect(await contract.owner()).to.equal(user02.address);
  });
});
