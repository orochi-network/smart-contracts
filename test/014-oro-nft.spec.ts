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

let guaranteedStart: number;
let guaranteedEnd: number;
let fcfsStart: number;
let fcfsEnd: number;
let publicStart: number;

describe('OroNft Contract', function () {
  before(async () => {
    accounts = await hre.ethers.getSigners();
    [deployerSigner, user01, user02, user03, user04, user05] = accounts;

    const block = await hre.ethers.provider.getBlock('latest');
    if (!block) {
      throw new Error('Block not found');
    }
    const now = block.timestamp;

    // Initial schedule
    guaranteedStart = now + 10;
    guaranteedEnd = now + 100;
    fcfsStart = now + 101;
    fcfsEnd = now + 200;
    publicStart = now + 300;

    // Deploy the contract once
    const OroNft = await hre.ethers.getContractFactory('OroNft');
    contract = await OroNft.deploy(
      'https://baseuri.com/',
      guaranteedStart,
      guaranteedEnd,
      fcfsStart,
      fcfsEnd,
      publicStart,
      "OroNft",
      "ORO",
    );
  });

  // =====================================================
  // 0) Initial checks
  // =====================================================
  it('Should validate initial contract state', async () => {
    expect(await contract.maxSupplyGet()).to.equal(3000);
    expect(await contract.guaranteedSupplyGet()).to.equal(1600);
    expect(await contract.fcfsSupplyGet()).to.equal(1400);
  });

  // =====================================================
  // 1) Guaranteed Phase tests
  // =====================================================

  it('Not in guaranteed phase yet => guaranteedMint should fail', async () => {
    await expect(contract.connect(user01).guaranteedMint()).to.be.revertedWith('Not in Guaranteed Phase');
  });

  it('We can adjust times freely if guaranteed not started yet', async () => {
    // Pushing guaranteedStart +5, etc., is valid as long as guaranteed hasn't begun
    await contract.salePhaseSetTimes(
      guaranteedStart + 5,
      guaranteedEnd + 5,
      fcfsStart + 5,
      fcfsEnd + 5,
      publicStart + 5,
    );
    guaranteedStart += 5;
    guaranteedEnd += 5;
    fcfsStart += 5;
    fcfsEnd += 5;
    publicStart += 5;

    expect(await contract.guaranteedStartTimeGet()).to.equal(guaranteedStart);
  });

  it('Advance time into Guaranteed Phase and allow user01 to mint', async () => {
    const block = await hre.ethers.provider.getBlock('latest');
    if (!block) throw new Error('Block not found');
    const now = block.timestamp;

    // Jump to guaranteedStart
    const diff = guaranteedStart - now + 1;
    await hre.ethers.provider.send('evm_increaseTime', [diff]);
    await hre.ethers.provider.send('evm_mine', []);

    // Add user01 to Guarantee
    await contract.guaranteeAdd([user01.address]);

    // Mint
    await contract.connect(user01).guaranteedMint();
    expect(await contract.tokenIndexGet(user01.address)).to.equal(1);
  });

  it("Can't modify guaranteedStart once Guaranteed has begun", async () => {
    await expect(
      contract.salePhaseSetTimes(
        guaranteedStart + 10, // not allowed
        guaranteedEnd,
        fcfsStart,
        fcfsEnd,
        publicStart,
      ),
    ).to.be.revertedWith('Cannot modify guaranteedStart because Guaranteed has begun');
  });

  it('FCFS mint fails if not in FCFS phrase yet', async () => {
    // We are currently just after guaranteedEnd but not necessarily in fcfsStart
    // Add user03 to FCFS
    await contract.fcfsAdd([user03.address]);
    await expect(contract.connect(user03).fcfsMint({ value: hre.ethers.parseEther('0.05') })).to.be.revertedWith(
      'Not in FCFS Phase',
    );
  });
  it('Should allow extending guaranteedEnd while still in Guaranteed phase', async () => {
    // Extend guaranteedEnd by 10
    await contract.salePhaseSetTimes(
      guaranteedStart,
      guaranteedEnd + 10,
      fcfsStart + 10,
      fcfsEnd + 10,
      publicStart + 10,
    );

    expect(await contract.guaranteedEndTimeGet()).to.equal(guaranteedEnd + 10);
    guaranteedEnd += 10;
    fcfsStart += 10;
    fcfsEnd += 10;
    publicStart += 10;
  });

  it('Add user02 to Guarantee and let them mint before guaranteedEnd passes', async () => {
    // user02 not in Guarantee yet => fails if they try
    await expect(contract.connect(user02).guaranteedMint()).to.be.revertedWith('Not in Guarantee');

    // Add user02
    await contract.guaranteeAdd([user02.address]);
    await contract.connect(user02).guaranteedMint();
    expect(await contract.tokenIndexGet(user02.address)).to.equal(2);
  });

  it('After guaranteedEnd => guaranteedMint fails', async () => {
    const block = await hre.ethers.provider.getBlock('latest');
    if (!block) throw new Error('No block');
    const now = block.timestamp;
    await contract.guaranteeAdd([user05.address]);

    // push time beyond guaranteedEnd
    await hre.ethers.provider.send('evm_increaseTime', [guaranteedEnd - now + 1]);
    await hre.ethers.provider.send('evm_mine', []);

    await expect(contract.connect(user05).guaranteedMint()).to.be.revertedWith('Not in Guaranteed Phase');
  });

  it('No changing guaranteed times after Guaranteed ended', async () => {
    console.log('guaranteedEnd:', guaranteedEnd);
    console.log('fcfsStart:', fcfsStart);
    await expect(
      contract.salePhaseSetTimes(guaranteedStart, guaranteedEnd + 20, fcfsStart + 20, fcfsEnd + 20, publicStart + 20),
    ).to.be.revertedWith('Cannot modify Guaranteed times after Guaranteed phase finished');
  });

  // =====================================================
  // 2) FCFS Phase
  // =====================================================

  it('We can still modify fcfsStart/fcfsEnd if FCFS not started yet', async () => {
    // If the current time hasn't reached fcfsStart, we can shift it
    const block = await hre.ethers.provider.getBlock('latest');
    if (!block) throw new Error('No block');
    const now = block.timestamp;

    if (now < fcfsStart) {
      await contract.salePhaseSetTimes(guaranteedStart, guaranteedEnd, fcfsStart + 5, fcfsEnd + 5, publicStart);
      fcfsStart += 5;
      fcfsEnd += 5;
      expect(await contract.fcfsStartTimeGet()).to.equal(fcfsStart);
    }
  });

  it('Enter FCFS => user03 mints successfully', async () => {
    const block = await hre.ethers.provider.getBlock('latest');
    if (!block) throw new Error('No block');
    const now = block.timestamp;

    // push time to fcfsStart
    if (now < fcfsStart) {
      await hre.ethers.provider.send('evm_increaseTime', [fcfsStart - now + 1]);
      await hre.ethers.provider.send('evm_mine', []);
    }

    // Mint
    await contract.connect(user03).fcfsMint({ value: hre.ethers.parseEther('0.05') });
    expect(await contract.tokenIndexGet(user03.address)).to.equal(3);
  });

  it("Can't modify fcfsStart once FCFS has begun", async () => {
    await expect(
      contract.salePhaseSetTimes(
        guaranteedStart,
        guaranteedEnd,
        fcfsStart + 10, // locked
        fcfsEnd,
        publicStart,
      ),
    ).to.be.revertedWith('Cannot modify fcfsStart because FCFS has begun');
  });

  it('Can extend fcfsEnd during FCFS window', async () => {
    // Extend fcfsEnd by 10
    await contract.salePhaseSetTimes(guaranteedStart, guaranteedEnd, fcfsStart, fcfsEnd + 10, publicStart);
    fcfsEnd += 10;
    expect(await contract.fcfsEndTimeGet()).to.equal(fcfsEnd);
  });

  it('user04 tries fcfsMint with insufficient ETH => revert', async () => {
    await contract.fcfsAdd([user04.address]);
    await expect(contract.connect(user04).fcfsMint({ value: hre.ethers.parseEther('0.01') })).to.be.revertedWith(
      'Insufficient ETH',
    );
  });

  it('After fcfsEnd => fcfsMint fails', async () => {
    const block = await hre.ethers.provider.getBlock('latest');
    if (!block) throw new Error('No block');
    const now = block.timestamp;

    await hre.ethers.provider.send('evm_increaseTime', [fcfsEnd - now + 1]);
    await hre.ethers.provider.send('evm_mine', []);

    await expect(contract.connect(user04).fcfsMint({ value: hre.ethers.parseEther('0.05') })).to.be.revertedWith(
      'Not in FCFS Phase',
    );
  });

  it('Cannot modify fcfs times after FCFS ended', async () => {
    console.log('fcfsEnd:', fcfsEnd);
    console.log('publicStart:', publicStart);
    await expect(
      contract.salePhaseSetTimes(guaranteedStart, guaranteedEnd, fcfsStart, fcfsEnd + 50, publicStart),
    ).to.be.revertedWith('Cannot modify FCFS times after FCFS phase finished');
  });

  // =====================================================
  // 3) Public Phase
  // =====================================================
  it('Public mint fails if not at publicStart yet', async () => {
    await expect(contract.connect(user04).publicMint({ value: hre.ethers.parseEther('0.1') })).to.be.revertedWith(
      'Not in Public Phase',
    );
  });

  it('Move into public => user04 mint successfully', async () => {
    const block = await hre.ethers.provider.getBlock('latest');
    if (!block) throw new Error('No block');
    const now = block.timestamp;

    if (now < publicStart) {
      await hre.ethers.provider.send('evm_increaseTime', [publicStart - now + 1]);
      await hre.ethers.provider.send('evm_mine', []);
    }

    await contract.connect(user04).publicMint({ value: hre.ethers.parseEther('0.1') });
    expect(await contract.tokenIndexGet(user04.address)).to.equal(4);
  });

  it("Can't modify publicStart after public has begun", async () => {
    await expect(
      contract.salePhaseSetTimes(guaranteedStart, guaranteedEnd, fcfsStart, fcfsEnd, publicStart + 100),
    ).to.be.revertedWith('Cannot modify publicStart because Public has begun');
  });

  // =====================================================
  // 4) Additional checks
  // =====================================================
  it('setGuaranteedSupply after Guaranteed ended => revert', async () => {
    await expect(contract.guaranteedSupplySet(1700)).to.be.revertedWith(
      'Cannot change Guaranteed supply after the phase ends',
    );
  });

  it('Transfer ownership to user01', async () => {
    await contract.connect(deployerSigner).transferOwnership(user01.address);
    expect(await contract.owner()).to.equal(user01.address);
  });
});
