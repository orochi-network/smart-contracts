import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import hre from 'hardhat';
import Deployer from '../helpers/deployer';
import { GameContract } from '../typechain-types';
import { expect } from 'chai';

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

  it('Game Contract must be deployed correctly', async () => {
    expect(await contract.owner()).eq(deployerSigner.address);
  });

  it('Only signer can send transaction', async () => {
    await contract.connect(deployerSigner).addSigners([user01.address, user02.address, user03.address]);

    await expect(contract.connect(user01).dailyQuestSubmit('login')).to.not.be.reverted;
    await expect(contract.connect(user02).gameQuestSubmit('played 10 game')).to.not.be.reverted;
    await expect(contract.connect(user03).socialQuestSubmit('Tweet')).to.not.be.reverted;

    await expect(contract.connect(user04).dailyQuestSubmit('login')).to.be.revertedWithCustomError(
      contract,
      'InvalidGameContractUser()',
    );
    await expect(contract.connect(user07).gameQuestSubmit('played 10 game')).to.be.revertedWithCustomError(
      contract,
      'InvalidGameContractUser()',
    );
    await expect(contract.connect(user05).socialQuestSubmit('Tweet')).to.be.revertedWithCustomError(
      contract,
      'InvalidGameContractUser()',
    );
  });

  it('Should emit events correctly when submitting quests', async () => {
    await expect(contract.connect(user01).dailyQuestSubmit('login'))
      .to.emit(contract, 'DailyQuestSubmit')
      .withArgs(user01.address, 'login');

    await expect(contract.connect(user02).socialQuestSubmit('Tweet'))
      .to.emit(contract, 'SocialQuestSubmit')
      .withArgs(user02.address, 'Tweet');

    await expect(contract.connect(user03).gameQuestSubmit('played 10 games'))
      .to.emit(contract, 'GameQuestSubmit')
      .withArgs(user03.address, 'played 10 games');
  });

  it('Only owner can add new signers and emit event addsigner', async () => {
    await expect(contract.connect(deployerSigner).addSigners([user04.address]))
      .to.emit(contract, 'AddSigners')
      .withArgs([user04.address]);

    expect(await contract.isSigner(user04.address)).to.be.true;
    expect(await contract.isSigner(user05.address)).to.be.false;

    await expect(contract.connect(user01).addSigners([user05.address])).to.be.revertedWith(
      'Ownable: caller is not the owner',
    );
  });

  it('Only owner can remove signers and emit event removesigners', async () => {
    await expect(contract.connect(deployerSigner).addSigners([user04.address]))
      .to.emit(contract, 'AddSigners')
      .withArgs([user04.address]);
    expect(await contract.isSigner(user04.address)).to.be.true;

    await expect(contract.connect(deployerSigner).removeSigners([user04.address]))
      .to.emit(contract, 'RemoveSigners')
      .withArgs([user04.address]);

    expect(await contract.isSigner(user04.address)).to.be.false;

    await expect(contract.connect(user01).removeSigners([user04.address])).to.be.revertedWith(
      'Ownable: caller is not the owner',
    );
  });

  it('Should remove multiple signers', async () => {
    await expect(contract.connect(deployerSigner).addSigners([user05.address, user06.address])).to.not.be.reverted;

    await expect(contract.connect(deployerSigner).removeSigners([user05.address, user06.address])).to.not.be.reverted;

    expect(await contract.isSigner(user05.address)).to.be.false;
    expect(await contract.isSigner(user06.address)).to.be.false;
  });
});
