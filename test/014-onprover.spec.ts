import { expect } from 'chai';
import hre from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { ONProver, OrochiNetworkToken } from '../typechain-types';
import { ByteBuffer, THexString } from '@orochi-network/utilities';
import { keccak256, getBytes } from 'ethers';

let deployer: SignerWithAddress;
let operator: SignerWithAddress;
let newOperator: SignerWithAddress;
let user01: SignerWithAddress;
let user02: SignerWithAddress;
let user03: SignerWithAddress;
let user04: SignerWithAddress;
let onProver: ONProver;
let token: OrochiNetworkToken;

const DAILY_LIMIT = hre.ethers.parseUnits('5000', 18);

/**
 * Get the latest block timestamp from the blockchain.
 *
 * @returns Current timestamp of the latest block.
 * @throws Error if the latest block cannot be fetched.
 */
const getNow = async (): Promise<number> => {
  const block = await hre.ethers.provider.getBlock('latest');
  if (!block) throw new Error('Block not found');
  return block.timestamp;
};

/**
 * Get the current nonce of a user.
 *
 * @param user - The user address to fetch nonce for.
 * @returns Current nonce as bigint.
 */
const getUserNonce = async (user: SignerWithAddress): Promise<bigint> => {
  const nonce = await onProver.getUserNonce(user.address);
  return BigInt(nonce);
};

/**
 * Build the raw proof payload to be signed.
 *
 * The proof structure is:
 * - to (address)
 * - nonce (uint96)
 * - timestamp (uint64)
 * - value (uint128)
 * - total 56 bytes
 *
 * @param to - Target address (user address).
 * @param nonce - User's current nonce.
 * @param timestamp - Timestamp to validate time-sensitive claims.
 * @param value - Token amount to be claimed.
 * @returns Encoded proof as hex string. (65 + 56 bytes = 121 bytes)
 */
const buildProof = (to: THexString, nonce: bigint, timestamp: bigint, value: bigint): `0x${string}` => {
  return ByteBuffer.getInstance()
    .writeAddress(to) // write user address
    .writeUint96(nonce) // write user nonce
    .writeUint64(timestamp) // write timestamp
    .writeUint128(value) // write claim amount
    .invoke(); // finalize and get hex string
};

/**
 * Sign the proof with the operator's private key.
 *
 * Process:
 * 1. Build raw proof data.
 * 2. Hash the proof using keccak256.
 * 3. Sign the hash.
 * 4. Concatenate signature + raw proof to form final signed proof.
 *
 * @param to - Target address (user address).
 * @param nonce - User's current nonce.
 * @param timestamp - Timestamp for the claim.
 * @param value - Amount of tokens to claim.
 * @param signer - Operator's signer instance to sign the proof.
 * @returns Final signed proof (signature + raw data) as hex string.
 */
const signProof = async (
  to: string,
  nonce: bigint,
  timestamp: bigint,
  value: bigint,
  signer: SignerWithAddress,
): Promise<`0x${string}`> => {
  const rawProof = buildProof(to as `0x${string}`, nonce, timestamp, value);
  const signature = await signer.signMessage(getBytes(rawProof));
  return ByteBuffer.getInstance()
    .writeBytes(signature as `0x${string}`) // write signature
    .writeBytes(rawProof) // append raw proof
    .invoke(); // finalize and get final hex
};

before(async () => {
  // Retrieve all signer accounts
  const accounts = await hre.ethers.getSigners();
  [deployer, operator, newOperator, user01, user02, user03, user04] = accounts;

  // Deploy OrochiNetworkToken and assign operator as the minter
  const TokenFactory = await hre.ethers.getContractFactory('OrochiNetworkToken');
  token = await TokenFactory.deploy('Orochi Network Token', 'ONT', [operator.address]);
  await token.waitForDeployment();

  // Deploy ONProver contract with campaign start and end time
  const ONProverFactory = await hre.ethers.getContractFactory('ONProver');
  const now = await getNow();
  onProver = await ONProverFactory.deploy(
    {
      maxDailyLimit: DAILY_LIMIT,
      timeStart: now - 3600, // start 1 hour ago
      timeEnd: now + 86400 * 7, // end after 7 days
      tokenContract: token.target,
    },
    [operator.address],
  );
  await onProver.waitForDeployment();

  // Authorize ONProver to mint/burn OrochiNetworkToken
  await token.connect(deployer).addOperator(onProver.target);
});

it('should add and remove operator', async () => {
  // Add new operator and expect no revert
  await expect(onProver.connect(deployer).addOperator(newOperator.address)).to.not.be.reverted;

  // Remove operator and expect no revert
  await expect(onProver.connect(deployer).removeOperator(newOperator.address)).to.not.be.reverted;
});

it('should update configuration successfully', async () => {
  // Update configuration with new limit and extended end time
  const now = await getNow();
  await expect(
    onProver.connect(deployer).setConfiguration({
      maxDailyLimit: DAILY_LIMIT * 2n,
      timeStart: now,
      timeEnd: now + 86400 * 10, // new 10-day campaign
      tokenContract: token.target,
    }),
  ).to.not.be.reverted;
});

it('should allow user01 to make a normal claim', async () => {
  // User01 retrieves their current nonce
  const nonce = await getUserNonce(user01);

  // Define claim amount
  const amount = hre.ethers.parseUnits('1000', 18);

  // Build and sign proof
  const proof = await signProof(user01.address, nonce, 0n, amount, operator);

  // Perform claim and expect correct event emission
  await expect(onProver.connect(user01).claim(proof)).to.emit(onProver, 'TokenClaim').withArgs(user01.address, amount);
});

it('should reject invalid signature', async () => {
  // Build a proof signed by wrong signer (user03 instead of operator)
  const nonce = await getUserNonce(user02);
  const amount = hre.ethers.parseUnits('500', 18);
  const proof = await signProof(user02.address, nonce, 0n, amount, user03);

  // Claim should revert due to invalid signature
  await expect(onProver.connect(user02).claim(proof)).to.be.revertedWithCustomError(onProver, 'InvalidProofSignature');
});

it('should reject reused nonce', async () => {
  // Try to reuse an already used nonce
  const reusedNonce = 0n;
  const amount = hre.ethers.parseUnits('200', 18);
  const proof = await signProof(user01.address, reusedNonce, 0n, amount, operator);

  // Expect claim to fail due to nonce reuse
  await expect(onProver.connect(user01).claim(proof)).to.be.revertedWithCustomError(onProver, 'InvalidUserNonce');
});

it('should reject wrong recipient', async () => {
  // Build proof for wrong user (user03) but use user02 to claim
  const nonce = await getUserNonce(user02);
  const amount = hre.ethers.parseUnits('300', 18);
  const proof = await signProof(user03.address, nonce, 0n, amount, operator);

  // Expect revert due to recipient mismatch
  await expect(onProver.connect(user02).claim(proof)).to.be.revertedWithCustomError(onProver, 'InvalidRecipient');
});

it('should allow daily claim within daily limit', async () => {
  // User02 makes a daily claim within allowed daily limit
  const nonce = await getUserNonce(user02);
  const timestamp = BigInt(await getNow());
  const amount = hre.ethers.parseUnits('1500', 18);
  const proof = await signProof(user02.address, nonce, timestamp, amount, operator);

  // Expect daily claim event to be emitted
  await expect(onProver.connect(user02).claim(proof)).to.emit(onProver, 'TokenClaimDaily');
});

it('should reject daily claim exceeding limit', async () => {
  // User03 attempts to claim more than daily limit
  const nonce = await getUserNonce(user03);
  const timestamp = BigInt(await getNow());
  const amount = hre.ethers.parseUnits('10000', 18);
  const proof = await signProof(user03.address, nonce, timestamp, amount, operator);

  // Expect claim to revert due to exceeding limit
  await expect(onProver.connect(user03).claim(proof)).to.be.revertedWithCustomError(onProver, 'ExceedDailyLimit');
});

it('should allow daily claim after 1 day', async () => {
  // Fast forward time by 1 day
  await hre.network.provider.send('evm_increaseTime', [86401]);
  await hre.network.provider.send('evm_mine');

  // User02 claims again for new day
  const nonce = await getUserNonce(user02);
  const timestamp = BigInt(await getNow());
  const amount = hre.ethers.parseUnits('800', 18);
  const proof = await signProof(user02.address, nonce, timestamp, amount, operator);

  // Expect daily claim event
  await expect(onProver.connect(user02).claim(proof)).to.emit(onProver, 'TokenClaimDaily');
});

it('should reject claim with outdated timestamp', async () => {
  // Build proof with outdated timestamp
  const nonce = await getUserNonce(user03);
  const timestamp = BigInt((await getNow()) - 2 * 86400);
  const amount = hre.ethers.parseUnits('400', 18);
  const proof = await signProof(user03.address, nonce, timestamp, amount, operator);

  // Expect claim to revert due to old timestamp
  await expect(onProver.connect(user03).claim(proof)).to.be.revertedWithCustomError(
    onProver,
    'InvalidTransactionTimestamp',
  );
});

it('should return correct total claim amount for user01', async () => {
  // Verify total amount user01 has claimed so far
  const claimed = await onProver.getTotalClaim(user01.address);
  const expected = hre.ethers.parseUnits('1000', 18);
  expect(claimed).to.equal(expected);
});

it('should return correct current day', async () => {
  // Verify current day number since campaign started
  const now = await getNow();
  const config = await onProver.getConfig();
  const expectedDay = BigInt(Math.floor((now - Number(config.timeStart)) / 86400));
  const day = await onProver.getCurrentDay();
  expect(day).to.equal(expectedDay);
});

it('should return today’s correct metrics', async () => {
  // Check today's metrics (total claimed and user count)
  const metric = await onProver.getMetricToday();
  expect(metric.claimed).to.be.gte(0n);
  expect(metric.userCount).to.be.gte(0n);
});

it('should return correct user nonce after claim', async () => {
  // Verify user01 nonce has been incremented after claiming
  const nonce = await onProver.getUserNonce(user01.address);
  expect(nonce).to.equal(1n);
});

it('should allow user04 to claim normal and daily', async () => {
  // User04 makes a normal claim
  const normalNonce = await getUserNonce(user04);
  const normalAmount = hre.ethers.parseUnits('600', 18);
  const normalProof = await signProof(user04.address, normalNonce, 0n, normalAmount, operator);
  await expect(onProver.connect(user04).claim(normalProof)).to.emit(onProver, 'TokenClaim');

  // User04 makes a daily claim right after
  const dailyNonce = await getUserNonce(user04);
  const timestamp = BigInt(await getNow());
  const dailyAmount = hre.ethers.parseUnits('4000', 18);
  const dailyProof = await signProof(user04.address, dailyNonce, timestamp, dailyAmount, operator);
  await expect(onProver.connect(user04).claim(dailyProof)).to.emit(onProver, 'TokenClaimDaily');
});

it('should reject claim with wrong nonce (future nonce)', async () => {
  // Try to claim with a future nonce (wrong nonce)
  const nonce = (await getUserNonce(user01)) + 5n;
  const amount = hre.ethers.parseUnits('100', 18);
  const proof = await signProof(user01.address, nonce, 0n, amount, operator);

  // Expect revert due to nonce mismatch
  await expect(onProver.connect(user01).claim(proof)).to.be.revertedWithCustomError(onProver, 'InvalidUserNonce');
});

it('should allow continuous normal claims and update totalClaim correctly', async () => {
  // User01 makes two normal claims sequentially
  const nonce1 = await getUserNonce(user01);
  const amount1 = hre.ethers.parseUnits('200', 18);
  const proof1 = await signProof(user01.address, nonce1, 0n, amount1, operator);
  await expect(onProver.connect(user01).claim(proof1)).to.emit(onProver, 'TokenClaim');

  const nonce2 = await getUserNonce(user01);
  const amount2 = hre.ethers.parseUnits('300', 18);
  const proof2 = await signProof(user01.address, nonce2, 0n, amount2, operator);
  await expect(onProver.connect(user01).claim(proof2)).to.emit(onProver, 'TokenClaim');

  // Verify total claimed amount
  const claimed = await onProver.getTotalClaim(user01.address);
  const expected = hre.ethers.parseUnits('1500', 18);
  expect(claimed).to.equal(expected);
});

it('should allow updating config and reflect new values', async () => {
  // Update config with new larger daily limit
  const now = await getNow();
  const newLimit = DAILY_LIMIT * 3n;
  await onProver.connect(deployer).setConfiguration({
    maxDailyLimit: newLimit,
    timeStart: now,
    timeEnd: now + 86400 * 30,
    tokenContract: token.target,
  });

  // Verify config has been updated
  const config = await onProver.getConfig();
  expect(config.maxDailyLimit).to.equal(newLimit);
});

it('should reject claim after campaign expired', async () => {
  // Fast forward time to after campaign end
  await hre.network.provider.send('evm_increaseTime', [86400 * 40]);
  await hre.network.provider.send('evm_mine');

  // User02 tries to claim after campaign ended
  const nonce = await getUserNonce(user02);
  const timestamp = BigInt(await getNow());
  const amount = hre.ethers.parseUnits('500', 18);
  const proof = await signProof(user02.address, nonce, timestamp, amount, operator);

  // Expect revert due to inactive campaign
  await expect(onProver.connect(user02).claim(proof)).to.be.revertedWithCustomError(onProver, 'InactivatedCampaign');
});

it('should emit correct TokenClaim event', async () => {
  // Rewind time back into campaign
  await hre.network.provider.send('evm_increaseTime', [-86400 * 40]);
  await hre.network.provider.send('evm_mine');

  // User03 makes a claim successfully
  const nonce = await getUserNonce(user03);
  const amount = hre.ethers.parseUnits('100', 18);
  const proof = await signProof(user03.address, nonce, 0n, amount, operator);

  // Expect TokenClaim event emitted correctly
  await expect(onProver.connect(user03).claim(proof)).to.emit(onProver, 'TokenClaim');
});

it('should allow operator to burn tokens', async () => {
  const balanceBefore = await token.balanceOf(user04.address);
  expect(balanceBefore).to.equal(hre.ethers.parseUnits('4600', 18));
  const totalSupplyBefore = await token.totalSupply();
  expect(totalSupplyBefore).to.equal(hre.ethers.parseUnits('8500', 18));
  // Operator burns tokens from user04
  const burnAmount = hre.ethers.parseUnits('2000', 18);
  await expect(token.connect(operator).burn(user04.address, burnAmount)).to.not.be.reverted;

  // Verify user04's balance after burn
  const balance = await token.balanceOf(user04.address);
  expect(balance).to.equal(hre.ethers.parseUnits('2600', 18));

  // Verify total supply after burn
  const totalSupply = await token.totalSupply();
  expect(totalSupply).to.equal(hre.ethers.parseUnits('6500', 18));
});

it('should burn to zero', async () => {
  // User04 burns all their tokens
  const balanceBefore = await token.balanceOf(user04.address);
  expect(balanceBefore).to.equal(hre.ethers.parseUnits('2600', 18));
  const totalSupplyBefore = await token.totalSupply();
  expect(totalSupplyBefore).to.equal(hre.ethers.parseUnits('6500', 18));

  // User04 burns all their tokens
  await expect(token.connect(operator).burn(user04.address, balanceBefore)).to.not.be.reverted;

  // Verify user04's balance after burn
  const balance = await token.balanceOf(user04.address);
  expect(balance).to.equal(0n);

  // Verify total supply after burn
  const totalSupply = await token.totalSupply();
  expect(totalSupply).to.equal(hre.ethers.parseUnits('3900', 18));
});

it('should batch mint tokens to multiple users', async () => {
  // Check initial total supply
  const totalSupplyBefore = await token.totalSupply();
  expect(totalSupplyBefore).to.equal(hre.ethers.parseUnits('3900', 18));

  // Prepare packed mint data
  const mintAmount1 = hre.ethers.parseUnits('1000', 18);
  const mintAmount2 = hre.ethers.parseUnits('500', 18);
  const packed1 = (BigInt(mintAmount1) << 160n) + BigInt(user01.address);
  const packed2 = (BigInt(mintAmount2) << 160n) + BigInt(user02.address);

  // Perform batch mint
  await expect(token.connect(operator).batchMint([packed1, packed2])).to.not.be.reverted;

  // Check balances
  expect(await token.balanceOf(user01.address)).to.equal(hre.ethers.parseUnits('2500', 18)); // 1200 + 1000
  expect(await token.balanceOf(user02.address)).to.equal(hre.ethers.parseUnits('2800', 18)); // 300 + 500

  // Check new total supply
  const totalSupplyAfter = await token.totalSupply();
  expect(totalSupplyAfter).to.equal(hre.ethers.parseUnits('5400', 18));
});

it('should batch burn tokens from multiple users', async () => {
  // Check initial total supply
  const totalSupplyBefore = await token.totalSupply();
  expect(totalSupplyBefore).to.equal(hre.ethers.parseUnits('5400', 18));

  // Prepare burn data
  const burnAmount1 = hre.ethers.parseUnits('200', 18);
  const burnAmount2 = hre.ethers.parseUnits('100', 18);
  const packed1 = (BigInt(burnAmount1) << 160n) + BigInt(user01.address);
  const packed2 = (BigInt(burnAmount2) << 160n) + BigInt(user02.address);

  // Perform batch burn
  await expect(token.connect(operator).batchBurn([packed1, packed2])).to.not.be.reverted;

  // Check balances
  expect(await token.balanceOf(user01.address)).to.equal(hre.ethers.parseUnits('2300', 18)); // 2200 - 200
  expect(await token.balanceOf(user02.address)).to.equal(hre.ethers.parseUnits('2700', 18)); // 800 - 100

  // Check new total supply
  const totalSupplyAfter = await token.totalSupply();
  expect(totalSupplyAfter).to.equal(hre.ethers.parseUnits('5100', 18));
});

it('should prevent all token operations when paused (lock token)', async () => {
  const amount = hre.ethers.parseUnits('1000', 18);
  const packed = (BigInt(amount) << 160n) + BigInt(user01.address);

  // Mint some token first to user01
  await expect(token.connect(operator).mint(user01.address, amount)).to.not.be.reverted;

  // Pause the contract
  await token.connect(deployer).pause();
  expect(await token.paused()).to.equal(true);

  // All actions below should revert due to pause (i.e., token is "locked")

  // Mint
  await expect(token.connect(operator).mint(user02.address, amount)).to.be.revertedWith('Pausable: paused');

  // Burn
  await expect(token.connect(operator).burn(user01.address, amount)).to.be.revertedWith('Pausable: paused');

  // Transfer
  await expect(token.connect(user01).transfer(user02.address, amount)).to.be.revertedWith('Pausable: paused');

  // batchMint
  await expect(token.connect(operator).batchMint([packed])).to.be.revertedWith('Pausable: paused');

  // batchBurn
  await expect(token.connect(operator).batchBurn([packed])).to.be.revertedWith('Pausable: paused');
});

it('should allow all token operations after unpause', async () => {
  const amount = hre.ethers.parseUnits('1000', 18);
  const packed = (BigInt(amount) << 160n) + BigInt(user01.address);

  await token.connect(deployer).unpause();

  await expect(token.connect(operator).mint(user01.address, amount)).to.not.be.reverted;
  await expect(token.connect(operator).burn(user01.address, amount)).to.not.be.reverted;
  await expect(token.connect(operator).batchMint([packed])).to.not.be.reverted;
  await expect(token.connect(operator).batchBurn([packed])).to.not.be.reverted;
  await expect(token.connect(user01).transfer(user02.address, amount)).to.not.be.reverted;
});
