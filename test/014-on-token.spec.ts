import hre from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { OnToken } from '../typechain-types';
import Deployer from '../helpers/deployer';
import { AbiCoder, keccak256, getBytes } from 'ethers';

// Setup global variables
let accounts: SignerWithAddress[];
let deployer: SignerWithAddress;
let user1: SignerWithAddress;
let user2: SignerWithAddress;
let prover: SignerWithAddress;
let contract: OnToken;

// Define the daily token limit (5000 tokens)
const DAILY_LIMIT = hre.ethers.parseUnits('5000', 18);

// Helper function to generate a signed claim message
const signClaim = async (to: string, amount: bigint, salt: number, signer: SignerWithAddress): Promise<string> => {
  const abi = new AbiCoder();
  const encoded = abi.encode(['address', 'uint256', 'uint96'], [to, amount, salt]);
  const hash = keccak256(encoded);
  const signature = await signer.signMessage(getBytes(hash));
  return signature;
};

describe('OnToken', function () {
  // Deploy a fresh contract and mint initial tokens before tests
  before(async () => {
    accounts = await hre.ethers.getSigners();
    [deployer, user1, user2, prover] = accounts;

    const deployHelper = Deployer.getInstance(hre);
    deployHelper.connect(deployer);
    contract = await deployHelper.contractDeploy<OnToken>(
      'OnToken/OnToken',
      [],
      'OnToken Token',
      'OnToken',
      prover.address,
    );

    await contract.connect(deployer).mint(await contract.getAddress(), hre.ethers.parseUnits('1000000000', 18));
  });

  it('should allow valid claim', async () => {
    // Sign a valid claim with the prover
    const amount = hre.ethers.parseUnits('1000', 18);
    const salt = 1;
    const signature = await signClaim(user1.address, amount, salt, prover);

    // Get user1's balance before claiming
    const prevBalance = await contract.balanceOf(user1.address);

    // Claim tokens and expect TokenClaim event
    await expect(contract.connect(user1).claim(signature, amount, salt))
      .to.emit(contract, 'TokenClaim')
      .withArgs(keccak256(signature), user1.address, amount);

    // Verify that balance increased correctly
    const newBalance = await contract.balanceOf(user1.address);
    expect(newBalance - prevBalance).to.equal(amount);
  });

  it('should reject invalid signature claim', async () => {
    // Try claiming with a signature signed by wrong signer
    const amount = hre.ethers.parseUnits('500', 18);
    const salt = 2;
    const badSig = await signClaim(user1.address, amount, salt, user2);

    // Should revert with 'Invalid signature'
    await expect(contract.connect(user1).claim(badSig, amount, salt)).to.be.revertedWith('Invalid signature');
  });

  it('should prevent double claim', async () => {
    // Sign and claim once successfully
    const amount = hre.ethers.parseUnits('200', 18);
    const salt = 3;
    const signature = await signClaim(user1.address, amount, salt, prover);
    await contract.connect(user1).claim(signature, amount, salt);

    // Try claiming again with same signature should revert
    await expect(contract.connect(user1).claim(signature, amount, salt)).to.be.revertedWith(
      'Signature already redeemed',
    );
  });

  it('should set daily token limit', async () => {
    // Set a new daily token limit
    await expect(contract.connect(deployer).setDailyTokenLimit(DAILY_LIMIT)).to.emit(contract, 'DailyTokenLimitSet');

    // Verify limit updated correctly
    const limit = await contract.dailyTokenLimitGet();
    expect(limit).to.equal(DAILY_LIMIT);
  });

  it('should allow dailyClaim under daily limit', async () => {
    // Claim an amount within the daily limit
    const amount = hre.ethers.parseUnits('2000', 18);
    const salt = 4;
    const signature = await signClaim(user1.address, amount, salt, prover);

    await expect(contract.connect(user1).claimDaily(signature, amount, salt)).to.emit(contract, 'TokenClaimDaily');

    // Verify claimed amount is correct
    const claimed = await contract.dailyTokenClaimedGet();
    expect(claimed).to.equal(amount);
  });

  it('should allow dailyClaim exactly reaching daily limit', async () => {
    // Claim the remaining amount to exactly hit the daily limit
    const claimedSoFar = await contract.dailyTokenClaimedGet();
    const remain = DAILY_LIMIT - claimedSoFar;
    const salt = 5;
    const signature = await signClaim(user1.address, remain, salt, prover);

    await expect(contract.connect(user1).claimDaily(signature, remain, salt)).to.emit(contract, 'TokenClaimDaily');

    // Verify dailyTokenClaimed == DAILY_LIMIT
    const claimed = await contract.dailyTokenClaimedGet();
    expect(claimed).to.equal(DAILY_LIMIT);
  });

  it('should reject dailyClaim exceeding daily limit', async () => {
    // Try to claim after reaching the limit should revert
    const amount = hre.ethers.parseUnits('1', 18);
    const salt = 6;
    const signature = await signClaim(user1.address, amount, salt, prover);

    await expect(contract.connect(user1).claimDaily(signature, amount, salt)).to.be.revertedWith(
      'Limit per day reached',
    );
  });

  it('should reset daily pool after 1 day', async () => {
    // Move blockchain time forward by 1 day
    await hre.network.provider.send('evm_increaseTime', [86401]);
    await hre.network.provider.send('evm_mine');

    // Claim tokens and expect daily pool reset
    const amount = hre.ethers.parseUnits('1000', 18);
    const salt = 7;
    const signature = await signClaim(user1.address, amount, salt, prover);

    await expect(contract.connect(user1).claimDaily(signature, amount, salt)).to.emit(contract, 'DailyPoolReset');

    // Verify dailyTokenClaimed resets properly
    const claimed = await contract.dailyTokenClaimedGet();
    expect(claimed).to.equal(amount);
  });

  it('should update prover signer and accept claim', async () => {
    // Update prover to user2
    await expect(contract.connect(deployer).setProver(user2.address)).to.emit(contract, 'ProverSet');

    // Claim using a signature from new prover
    const amount = hre.ethers.parseUnits('500', 18);
    const salt = 8;
    const newSig = await signClaim(user1.address, amount, salt, user2);

    await expect(contract.connect(user1).claim(newSig, amount, salt)).to.emit(contract, 'TokenClaim');
  });

  it('should update daily checkpoint and restart time', async () => {
    // Update daily checkpoint and daily restart time
    const newTime = Math.floor(Date.now() / 1000) + 10000;
    const newRestart = 3600;

    await expect(contract.connect(deployer).setDailyCheckpoint(newTime)).to.emit(contract, 'DailyCheckpointSet');
    await expect(contract.connect(deployer).setTimeRestartDaily(newRestart)).to.emit(contract, 'DailyTimeSet');

    const restartTime = await contract.timeRestartDailyGet();
    expect(restartTime).to.equal(newRestart);
  });

  it('should reject claim with amount = 0', async () => {
    // Claim with zero amount must fail
    const amount = hre.ethers.parseUnits('0', 18);
    const salt = 9;
    const signature = await signClaim(user1.address, amount, salt, prover);

    await expect(contract.connect(user1).claim(signature, amount, salt)).to.be.reverted;
  });

  it('should reject reused signature across dailyClaim and claim', async () => {
    // Claim once then attempt to reuse signature in claimDaily
    const amount = hre.ethers.parseUnits('1000', 18);
    const salt = 10;
    const signature = await signClaim(user1.address, amount, salt, user2);

    await contract.connect(user1).claim(signature, amount, salt);

    await expect(contract.connect(user1).claimDaily(signature, amount, salt)).to.be.revertedWith(
      'Signature already redeemed',
    );
  });

  it('should emit correct events on claim and claimDaily', async () => {
    // Validate events emitted correctly for claim and claimDaily
    const amount = hre.ethers.parseUnits('500', 18);
    const salt1 = 11;
    const salt2 = 12;

    const sig1 = await signClaim(user1.address, amount, salt1, user2);
    const sig2 = await signClaim(user1.address, amount, salt2, user2);

    // Expect TokenClaim event for claim
    await expect(contract.connect(user1).claim(sig1, amount, salt1))
      .to.emit(contract, 'TokenClaim')
      .withArgs(keccak256(sig1), user1.address, amount);

    await expect(contract.connect(user1).claimDaily(sig2, amount, salt2))
      .to.emit(contract, 'TokenClaimDaily')
      .withArgs(keccak256(sig2), user1.address, amount);
  });

  it('should full daily limit, then reset after 1 day', async () => {
    // Fill the daily limit completely and reset after 24h
    const limit = await contract.dailyTokenLimitGet();
    const amount1 = limit / 2n;
    const amount2 = limit - amount1;

    const sig1 = await signClaim(user1.address, amount1, 13, user2);
    const sig2 = await signClaim(user1.address, amount2, 14, user2);

    await expect(contract.connect(user1).claimDaily(sig1, amount1, 13))
      .to.emit(contract, 'TokenClaimDaily')
      .withArgs(keccak256(sig1), user1.address, amount1);

    await expect(contract.connect(user1).claimDaily(sig2, amount2, 14))
      .to.emit(contract, 'TokenClaimDaily')
      .withArgs(keccak256(sig2), user1.address, amount2);
    // Check that dailyTokenClaimed == limit
    const claimed = await contract.dailyTokenClaimedGet();
    expect(claimed).to.equal(limit);
    // badSig because it no more token to dailyClaim today
    const badSig = await signClaim(user1.address, 1n, 15, user2);
    await expect(contract.connect(user1).claimDaily(badSig, 1n, 15)).to.be.revertedWith('Limit per day reached');

    await hre.network.provider.send('evm_increaseTime', [86401]);
    await hre.network.provider.send('evm_mine');

    // After 24h, dailyTokenClaimed should reset
    const newSig = await signClaim(user1.address, amount1, 16, user2);
    await expect(contract.connect(user1).claimDaily(newSig, amount1, 16))
      .to.emit(contract, 'DailyPoolReset')
      .and.to.emit(contract, 'TokenClaimDaily')
      .withArgs(keccak256(newSig), user1.address, amount1);
  });

  it('should manually reset daily pool by setting dailyCheckpoint', async () => {
    // Backdate daily checkpoint manually to force a reset
    const oldCheckpoint = await contract.dailyCheckpointGet();
    const backdated = Number(oldCheckpoint) - 2 * 86400;

    await expect(contract.connect(deployer).setDailyCheckpoint(backdated)).to.emit(contract, 'DailyCheckpointSet');

    const amount = hre.ethers.parseUnits('1000', 18);
    const salt = 17;
    const sig = await signClaim(user1.address, amount, salt, user2);

    await expect(contract.connect(user1).claimDaily(sig, amount, salt)).to.emit(contract, 'DailyPoolReset');
  });

  it('should allow claiming after manual reset by setDailyCheckpoint', async () => {
    // Claim after manually resetting checkpoint
    const amount = hre.ethers.parseUnits('1500', 18);
    const salt = 18;
    const sig = await signClaim(user1.address, amount, salt, user2);

    await expect(contract.connect(user1).claimDaily(sig, amount, salt)).to.emit(contract, 'TokenClaimDaily');
  });

  it('should correctly partial fill and adjust transferable amount', async () => {
    // Partially fill claim when exceeding remaining daily limit
    await hre.network.provider.send('evm_increaseTime', [86401]);
    await hre.network.provider.send('evm_mine');

    const limit = await contract.dailyTokenLimitGet();
    const amount1 = limit - hre.ethers.parseUnits('100', 18);
    const sig1 = await signClaim(user1.address, amount1, 19, user2);
    await contract.connect(user1).claimDaily(sig1, amount1, 19);

    const amount2 = hre.ethers.parseUnits('200', 18);
    const sig2 = await signClaim(user1.address, amount2, 20, user2);

    const beforeBalance = await contract.balanceOf(user1.address);

    await contract.connect(user1).claimDaily(sig2, amount2, 20);

    const afterBalance = await contract.balanceOf(user1.address);
    expect(afterBalance - beforeBalance).to.equal(hre.ethers.parseUnits('100', 18));
  });
});
