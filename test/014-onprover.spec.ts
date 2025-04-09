import hre from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { ONProver } from '../typechain-types';
import Deployer from '../helpers/deployer';
import { AbiCoder, keccak256, getBytes } from 'ethers';

let accounts: SignerWithAddress[];
let deployer: SignerWithAddress;
let user1: SignerWithAddress;
let onProver2: SignerWithAddress;
let prover: SignerWithAddress;
let contract: ONProver;

const DAILY_LIMIT = hre.ethers.parseUnits('5000', 18);

/** Sign a claim for normal claim() */
const signClaim = async (to: string, amount: bigint, salt: number, signer: SignerWithAddress): Promise<string> => {
  const abi = new AbiCoder();
  const encoded = abi.encode(['address', 'uint256', 'uint96'], [to, amount, salt]);
  const hash = keccak256(encoded);
  const signature = await signer.signMessage(getBytes(hash));
  return signature;
};

/** Sign a claim for claimDaily(), includes daily checkpoint */
const signDailyClaim = async (
  to: string,
  amount: bigint,
  salt: number,
  checkpoint: bigint,
  signer: SignerWithAddress,
): Promise<string> => {
  const abi = new AbiCoder();
  const encoded = abi.encode(['address', 'uint256', 'uint96', 'uint64'], [to, amount, salt, checkpoint]);
  const hash = keccak256(encoded);
  const signature = await signer.signMessage(getBytes(hash));
  return signature;
};

/** Get real checkpoint according to current block timestamp */
async function getCheckPoint(): Promise<bigint> {
  const currentCheckpoint = await contract.dailyCheckpointGet();
  const interval = await contract.timeRestartDailyGet();
  const block = await hre.ethers.provider.getBlock('latest');
  if (!block) {
    throw new Error('Block not found');
  }
  const blockTimestamp = block.timestamp;
  const passed = blockTimestamp - Number(currentCheckpoint);
  const intervals = Math.floor(passed / Number(interval));
  return BigInt(Number(currentCheckpoint) + intervals * Number(interval));
}

describe('ONProver', function () {
  before(async () => {
    // Setup accounts
    accounts = await hre.ethers.getSigners();
    [deployer, user1, onProver2, prover] = accounts;

    // Deploy the contract
    const deployHelper = Deployer.getInstance(hre);
    deployHelper.connect(deployer);
    contract = await deployHelper.contractDeploy<ONProver>(
      'onprover/ONProver',
      [],
      'ONProver',
      'ONProver',
      prover.address,
    );

    // Mint initial token supply to contract itself
    await contract.connect(deployer).mint(await contract.getAddress(), hre.ethers.parseUnits('1000000000', 18));
  });

  it('should allow valid claim', async () => {
    // Prepare claim parameters: user1 wants to claim 1000 tokens
    const amount = hre.ethers.parseUnits('1000', 18);
    const salt = 1;
    const signature = await signClaim(user1.address, amount, salt, prover);

    // Check user's balance before claiming
    const balanceBefore = await contract.balanceOf(user1.address);

    // Perform the claim using the signed message
    await expect(contract.connect(user1).claim(signature, amount, salt))
      .to.emit(contract, 'TokenClaim')
      .withArgs(keccak256(signature), user1.address, amount);

    // After claiming, the balance should increase by exactly 'amount'
    const balanceAfter = await contract.balanceOf(user1.address);
    expect(BigInt(balanceAfter.toString()) - BigInt(balanceBefore.toString())).to.equal(BigInt(amount.toString()));
  });

  it('should reject invalid signature claim', async () => {
    // Prepare an invalid signature signed by wrong prover
    const amount = hre.ethers.parseUnits('500', 18);
    const salt = 2;
    const badSignature = await signClaim(user1.address, amount, salt, onProver2);

    // Should reject because signer is not authorized
    await expect(contract.connect(user1).claim(badSignature, amount, salt)).to.be.revertedWith('Invalid signature');
  });

  it('should prevent double claim using the same signature', async () => {
    // Prepare a valid claim
    const amount = hre.ethers.parseUnits('200', 18);
    const salt = 3;
    const signature = await signClaim(user1.address, amount, salt, prover);

    // First claim succeeds
    await contract.connect(user1).claim(signature, amount, salt);

    // Second claim using the same signature must revert
    await expect(contract.connect(user1).claim(signature, amount, salt)).to.be.revertedWith(
      'Signature already redeemed',
    );
  });

  it('should set the daily token limit', async () => {
    // Owner sets a new daily limit
    await expect(contract.connect(deployer).setDailyTokenLimit(DAILY_LIMIT)).to.emit(contract, 'DailyTokenLimitSet');

    // Verify that the daily limit is correctly set
    const limit = await contract.dailyTokenLimitGet();
    expect(limit).to.equal(DAILY_LIMIT);
  });

  it('should allow dailyClaim under the daily limit', async () => {
    // Prepare daily claim
    const amount = hre.ethers.parseUnits('2000', 18);
    const salt = 4;
    const checkpoint = await getCheckPoint();
    const signature = await signDailyClaim(user1.address, amount, salt, checkpoint, prover);

    // Claim should succeed
    await expect(contract.connect(user1).claimDaily(signature, amount, salt)).to.emit(contract, 'TokenClaimDaily');

    // Verify claimed amount
    const claimed = await contract.dailyTokenClaimedGet();
    expect(claimed).to.equal(amount);
  });

  it('should allow dailyClaim exactly reaching the daily limit', async () => {
    // Calculate remaining amount to reach daily limit
    const claimedSoFar = await contract.dailyTokenClaimedGet();
    const remainingAmount = BigInt(DAILY_LIMIT.toString()) - BigInt(claimedSoFar.toString());

    const salt = 5;
    const checkpoint = await getCheckPoint();
    const signature = await signDailyClaim(user1.address, remainingAmount, salt, checkpoint, prover);

    // Final claim to reach daily limit exactly
    await expect(contract.connect(user1).claimDaily(signature, remainingAmount, salt)).to.emit(
      contract,
      'TokenClaimDaily',
    );

    // Verify total claimed equals daily limit
    const totalClaimed = await contract.dailyTokenClaimedGet();
    expect(totalClaimed).to.equal(DAILY_LIMIT);
  });

  it('should reject dailyClaim exceeding daily limit', async () => {
    // Try to claim more than remaining limit
    const amount = hre.ethers.parseUnits('1', 18);
    const salt = 6;
    const checkpoint = await getCheckPoint();
    const signature = await signDailyClaim(user1.address, amount, salt, checkpoint, prover);

    await expect(contract.connect(user1).claimDaily(signature, amount, salt)).to.be.revertedWith(
      'Limit per day reached',
    );
  });

  it('should reset daily pool after one day passes', async () => {
    // Move forward one day
    await hre.network.provider.send('evm_increaseTime', [86401]);
    await hre.network.provider.send('evm_mine');

    // Perform a daily claim
    const amount = hre.ethers.parseUnits('1000', 18);
    const salt = 7;
    const checkpoint = await getCheckPoint();
    const signature = await signDailyClaim(user1.address, amount, salt, checkpoint, prover);

    // Should trigger DailyPoolReset event
    await expect(contract.connect(user1).claimDaily(signature, amount, salt)).to.emit(contract, 'DailyPoolReset');
  });

  it('should allow updating prover signer and accept claim signed by new prover', async () => {
    // Change the prover address to onProver2
    await expect(contract.connect(deployer).setProver(onProver2.address)).to.emit(contract, 'ProverSet');

    // Prepare a claim signed by the new prover
    const amount = hre.ethers.parseUnits('500', 18);
    const salt = 8;
    const signature = await signClaim(user1.address, amount, salt, onProver2);

    // Claim must succeed with new prover's signature
    await expect(contract.connect(user1).claim(signature, amount, salt)).to.emit(contract, 'TokenClaim');
  });

  it('should allow updating daily checkpoint and daily restart interval', async () => {
    // Set a new checkpoint and restart interval
    const newCheckpoint = Math.floor(Date.now() / 1000) + 10000;
    const newInterval = 3600; // 1 hour

    await expect(contract.connect(deployer).setDailyCheckpoint(newCheckpoint)).to.emit(contract, 'DailyCheckpointSet');

    await expect(contract.connect(deployer).setTimeRestartDaily(newInterval)).to.emit(contract, 'DailyTimeSet');

    // Verify the new interval is correctly updated
    const fetchedInterval = await contract.timeRestartDailyGet();
    expect(fetchedInterval).to.equal(newInterval);
  });

  it('should reject reused signature across claim and claimDaily', async () => {
    // Sign once and use it for both claim and claimDaily
    const amount = hre.ethers.parseUnits('1000', 18);
    const salt = 10;
    const signature = await signClaim(user1.address, amount, salt, onProver2);

    // First claim normally
    await contract.connect(user1).claim(signature, amount, salt);

    // Second try as claimDaily must fail
    await expect(contract.connect(user1).claimDaily(signature, amount, salt)).to.be.revertedWith(
      'Signature already redeemed',
    );
  });

  it('should emit correct events for claim and claimDaily', async () => {
    // Check events on both claim and claimDaily flows
    const amount = hre.ethers.parseUnits('500', 18);
    const saltClaim = 11;
    const saltDaily = 12;

    const signatureClaim = await signClaim(user1.address, amount, saltClaim, onProver2);
    const checkpoint = await getCheckPoint();
    const signatureDaily = await signDailyClaim(user1.address, amount, saltDaily, checkpoint, onProver2);

    await expect(contract.connect(user1).claim(signatureClaim, amount, saltClaim))
      .to.emit(contract, 'TokenClaim')
      .withArgs(keccak256(signatureClaim), user1.address, amount);

    await expect(contract.connect(user1).claimDaily(signatureDaily, amount, saltDaily))
      .to.emit(contract, 'TokenClaimDaily')
      .withArgs(keccak256(signatureDaily), user1.address, amount);
  });

  it('should fully fill daily limit and reset after one day', async () => {
    const dailyLimit = await contract.dailyTokenLimitGet();
    const halfLimit = BigInt(dailyLimit.toString()) / 2n;

    // First claim: Half of daily limit
    const salt1 = 13;
    const checkpoint1 = await getCheckPoint();
    const signatureHalf = await signDailyClaim(
      user1.address,
      hre.ethers.parseUnits(halfLimit.toString(), 0),
      salt1,
      checkpoint1,
      onProver2,
    );

    await contract.connect(user1).claimDaily(signatureHalf, hre.ethers.parseUnits(halfLimit.toString(), 0), salt1);

    // Second claim: Remaining half
    const remaining = BigInt(dailyLimit.toString()) - halfLimit;
    const salt2 = 14;
    const checkpoint2 = await getCheckPoint();
    const signatureRemaining = await signDailyClaim(
      user1.address,
      hre.ethers.parseUnits(remaining.toString(), 0),
      salt2,
      checkpoint2,
      onProver2,
    );

    await contract.connect(user1).claimDaily(signatureRemaining, hre.ethers.parseUnits(remaining.toString(), 0), salt2);

    // Daily pool should now be full
    const claimed = await contract.dailyTokenClaimedGet();
    expect(claimed).to.equal(dailyLimit);

    // Try one more claim => should revert
    const salt3 = 15;
    const invalidSignature = await signDailyClaim(
      user1.address,
      hre.ethers.parseUnits('1', 18),
      salt3,
      checkpoint2,
      onProver2,
    );

    await expect(
      contract.connect(user1).claimDaily(invalidSignature, hre.ethers.parseUnits('1', 18), salt3),
    ).to.be.revertedWith('Limit per day reached');

    // Move forward one day to reset daily pool
    await hre.network.provider.send('evm_increaseTime', [86401]);
    await hre.network.provider.send('evm_mine');

    // Now claiming again must succeed
    const salt4 = 16;
    const checkpoint3 = await getCheckPoint();
    const signatureAfterReset = await signDailyClaim(
      user1.address,
      hre.ethers.parseUnits(halfLimit.toString(), 0),
      salt4,
      checkpoint3,
      onProver2,
    );

    await expect(
      contract.connect(user1).claimDaily(signatureAfterReset, hre.ethers.parseUnits(halfLimit.toString(), 0), salt4),
    ).to.emit(contract, 'DailyPoolReset');
  });

  it('should manually reset daily pool by setting checkpoint', async () => {
    // Manually backdate the checkpoint to force reset
    const oldCheckpoint = await getCheckPoint();
    const backdated = Number(oldCheckpoint) - 2 * 86400;

    await expect(contract.connect(deployer).setDailyCheckpoint(backdated)).to.emit(contract, 'DailyCheckpointSet');

    // After manual reset, claim should trigger DailyPoolReset event
    const amount = hre.ethers.parseUnits('1000', 18);
    const salt = 17;
    const checkpointNow = await getCheckPoint();
    const signature = await signDailyClaim(user1.address, amount, salt, checkpointNow, onProver2);

    await expect(contract.connect(user1).claimDaily(signature, amount, salt)).to.emit(contract, 'DailyPoolReset');
  });

  it('should allow claiming after manual checkpoint reset', async () => {
    // After manual reset, claiming works as normal
    const amount = hre.ethers.parseUnits('1500', 18);
    const salt = 18;
    const checkpoint = await getCheckPoint();
    const signature = await signDailyClaim(user1.address, amount, salt, checkpoint, onProver2);

    await expect(contract.connect(user1).claimDaily(signature, amount, salt)).to.emit(contract, 'TokenClaimDaily');
  });

  it('should correctly handle partial fill when amount exceeds remaining daily limit', async () => {
    // Move forward one day
    await hre.network.provider.send('evm_increaseTime', [86401]);
    await hre.network.provider.send('evm_mine');

    const dailyLimit = await contract.dailyTokenLimitGet();
    const almostAll = BigInt(dailyLimit.toString()) - BigInt(hre.ethers.parseUnits('100', 18).toString());

    // Claim almost all daily limit
    const salt1 = 19;
    const checkpoint = await getCheckPoint();
    const signatureAlmostAll = await signDailyClaim(
      user1.address,
      hre.ethers.parseUnits(almostAll.toString(), 0),
      salt1,
      checkpoint,
      onProver2,
    );

    await contract.connect(user1).claimDaily(signatureAlmostAll, hre.ethers.parseUnits(almostAll.toString(), 0), salt1);

    // Then attempt to claim more than remaining limit
    const salt2 = 20;
    const exceedAmount = hre.ethers.parseUnits('200', 18);
    const signatureExceed = await signDailyClaim(user1.address, exceedAmount, salt2, checkpoint, onProver2);

    const balanceBefore = await contract.balanceOf(user1.address);
    await contract.connect(user1).claimDaily(signatureExceed, exceedAmount, salt2);
    const balanceAfter = await contract.balanceOf(user1.address);

    // Only 100 tokens should be added
    expect(BigInt(balanceAfter.toString()) - BigInt(balanceBefore.toString())).to.equal(
      BigInt(hre.ethers.parseUnits('100', 18).toString()),
    );
  });

  it('should reject dailyClaim if signature uses outdated checkpoint', async () => {
    // Sign with an old checkpoint
    const oldCheckpoint = await getCheckPoint();
    const amount = hre.ethers.parseUnits('500', 18);
    const salt = 21;
    const oldSignature = await signDailyClaim(user1.address, amount, salt, oldCheckpoint, onProver2);

    // Move time forward
    await hre.network.provider.send('evm_increaseTime', [86401]);
    await hre.network.provider.send('evm_mine');

    // Claim must be rejected
    await expect(contract.connect(user1).claimDaily(oldSignature, amount, salt)).to.be.revertedWith(
      'Invalid signature',
    );
  });

  it('should revert if reusing the same signature in claimDaily', async () => {
    const amount = hre.ethers.parseUnits('300', 18);
    const salt = 23;
    const checkpoint = await getCheckPoint();
    const signature = await signDailyClaim(user1.address, amount, salt, checkpoint, onProver2);

    // First claim succeeds
    await contract.connect(user1).claimDaily(signature, amount, salt);

    // Second claim fails
    await expect(contract.connect(user1).claimDaily(signature, amount, salt)).to.be.revertedWith(
      'Signature already redeemed',
    );
  });

  it('should revert if contract token balance is insufficient', async () => {
    const balanceContract = await contract.balanceOf(await contract.getAddress());
    console.log('Contract balance before withdraw:', hre.ethers.formatUnits(balanceContract, 18));

    // Withdraw all tokens out
    await contract.connect(deployer).withdraw(onProver2.address, balanceContract);

    // Try claiming after contract has no tokens
    const salt = 22;
    const checkpoint = await getCheckPoint();
    const signature = await signDailyClaim(
      user1.address,
      hre.ethers.parseUnits('1000', 18),
      salt,
      checkpoint,
      onProver2,
    );

    await expect(
      contract.connect(user1).claimDaily(signature, hre.ethers.parseUnits('1000', 18), salt),
    ).to.be.revertedWith('ERC20: transfer amount exceeds balance');
  });
});
