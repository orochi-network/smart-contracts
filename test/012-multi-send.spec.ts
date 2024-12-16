import hre from 'hardhat';
import { expect } from 'chai';
import { MultiSend } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import Deployer from '../helpers/deployer';

let account: SignerWithAddress[];
let deployerSigner: SignerWithAddress;
let recipient1: SignerWithAddress;
let recipient2: SignerWithAddress;
let recipient3: SignerWithAddress;

let contract: MultiSend;

describe('MultiSend', function () {
  // Deploy the contract and set up accounts before each test
  beforeEach(async () => {
    account = await hre.ethers.getSigners();
    [deployerSigner, recipient1, recipient2, recipient3] = account;

    const deployer: Deployer = Deployer.getInstance(hre);
    deployer.connect(deployerSigner);
    contract = await deployer.contractDeploy<MultiSend>('MultiSend/MultiSend', []);
  });

  // Test case: Refund excess ETH to the sender
  it('Should refund excess ETH to the sender', async () => {
    const recipient = [recipient1.address, recipient2.address];
    const amountPerRecipient = hre.ethers.parseEther('1'); // 1 ETH per recipient

    // Set initial balances for recipients (as hexadecimal strings with "0x" prefix)
    await hre.ethers.provider.send('hardhat_setBalance', [
      recipient1.address,
      `0x${hre.ethers.parseUnits('0.5', 'ether').toString(16)}`, // Recipient 1 starts with 0.5 ETH
    ]);
    await hre.ethers.provider.send('hardhat_setBalance', [
      recipient2.address,
      `0x${hre.ethers.parseUnits('0.2', 'ether').toString(16)}`, // Recipient 2 starts with 0.2 ETH
    ]);

    // Calculate the total required amount to fulfill recipient deficits
    const recipientDeficits = [
      hre.ethers.parseEther('0.5'), // Recipient 1 needs 0.5 ETH
      hre.ethers.parseEther('0.8'), // Recipient 2 needs 0.8 ETH
    ];
    const totalRequired = recipientDeficits.reduce((acc, curr) => acc + curr, BigInt(0)); // Total required = 1.3 ETH

    const excessAmount = hre.ethers.parseEther('1.2'); // Extra 1.2 ETH sent
    const totalSent = totalRequired + excessAmount; // Total sent = 2.5 ETH

    // Record sender's initial balance
    const senderInitialBalance = await hre.ethers.provider.getBalance(deployerSigner.address);

    // Execute the multiSend transaction
    const tx = await contract.connect(deployerSigner).multiSend(recipient, amountPerRecipient, { value: totalSent });
    const receipt = await tx.wait();

    // Check if receipt is null
    if (!receipt) {
      throw new Error('Transaction receipt is null');
    }

    // Calculate gas used
    const gasUsed = BigInt(receipt.gasUsed.toString()) * hre.ethers.parseUnits('1', 'gwei');

    // Record sender's final balance
    const senderFinalBalance = await hre.ethers.provider.getBalance(deployerSigner.address);

    // Calculate expected refund and final balance
    const expectedRefund = totalSent - totalRequired; // Expected refund = 1.2 ETH
    const expectedFinalBalance = senderInitialBalance - totalRequired - gasUsed; // Final balance after deductions

    // Verify sender's final balance matches the expected value
    expect(senderFinalBalance).to.equal(expectedFinalBalance);
  });

  // Test case: Handle empty recipient list gracefully
  it('Should handle empty recipient list gracefully', async () => {
    const recipient: string[] = [];
    const amountPerRecipient = hre.ethers.parseEther('1'); // 1 ETH per recipient

    // Record sender's initial balance
    const senderInitialBalance = await hre.ethers.provider.getBalance(deployerSigner.address);

    // Execute multiSend with an empty recipient list
    const tx = await contract.connect(deployerSigner).multiSend(recipient, amountPerRecipient, {
      value: hre.ethers.parseEther('0'), // No ETH sent
    });
    const receipt = await tx.wait();

    // Check if receipt is null
    if (!receipt) {
      throw new Error('Transaction receipt is null');
    }

    // Calculate gas used
    const gasUsed = BigInt(receipt.gasUsed.toString()) * hre.ethers.parseUnits('1', 'gwei');

    // Record sender's final balance
    const senderFinalBalance = await hre.ethers.provider.getBalance(deployerSigner.address);

    // Verify sender's final balance only reflects gas deduction
    expect(senderFinalBalance).to.equal(senderInitialBalance - gasUsed);
  });

  // Test case: Revert when insufficient ETH is sent
  it('Should revert if insufficient ETH is sent', async () => {
    const recipient = [recipient1.address, recipient2.address];
    const amountPerRecipient = hre.ethers.parseEther('1'); // 1 ETH per recipient

    // Set initial balances for recipients
    await hre.ethers.provider.send('hardhat_setBalance', [
      recipient1.address,
      `0x${hre.ethers.parseUnits('0.5', 'ether').toString(16)}`, // Recipient 1 starts with 0.5 ETH
    ]);
    await hre.ethers.provider.send('hardhat_setBalance', [
      recipient2.address,
      `0x${hre.ethers.parseUnits('0.2', 'ether').toString(16)}`, // Recipient 2 starts with 0.2 ETH
    ]);

    const totalRequired = hre.ethers.parseEther('1.3'); // Total required = 1.3 ETH
    const insufficientValue = hre.ethers.parseEther('1.0'); // Only 1.0 ETH sent

    // Expect the transaction to revert with a custom error
    await expect(
      contract.connect(deployerSigner).multiSend(recipient, amountPerRecipient, { value: insufficientValue }),
    ).to.be.revertedWithCustomError(contract, 'InsufficientValue')
      .withArgs(insufficientValue, totalRequired); // Check custom error details
  });

  // Test case: Validate balances after successful distribution
  it('Should distribute ETH correctly and validate all balances', async () => {
    const recipients = [recipient1.address, recipient2.address, recipient3.address];
    const amountPerRecipient = hre.ethers.parseEther('1'); // 1 ETH per recipient

    // Set initial balances for recipients
    await hre.ethers.provider.send('hardhat_setBalance', [
      recipient1.address,
      `0x${hre.ethers.parseUnits('0.5', 'ether').toString(16)}`, // Recipient 1 starts with 0.5 ETH
    ]);
    await hre.ethers.provider.send('hardhat_setBalance', [
      recipient2.address,
      `0x${hre.ethers.parseUnits('0.2', 'ether').toString(16)}`, // Recipient 2 starts with 0.2 ETH
    ]);
    await hre.ethers.provider.send('hardhat_setBalance', [
      recipient3.address,
      `0x${hre.ethers.parseUnits('0', 'ether').toString(16)}`, // Recipient 3 starts with 0 ETH
    ]);

    const recipientDeficits = [
      hre.ethers.parseEther('0.5'), // Recipient 1 needs 0.5 ETH
      hre.ethers.parseEther('0.8'), // Recipient 2 needs 0.8 ETH
      hre.ethers.parseEther('1'),   // Recipient 3 needs 1 ETH
    ];
    const totalRequired = recipientDeficits.reduce((acc, curr) => acc + curr, BigInt(0)); // Total required = 2.3 ETH
    const excessAmount = hre.ethers.parseEther('1'); // Extra 1 ETH sent
    const totalSent = totalRequired + excessAmount; // Total sent = 3.3 ETH

    // Record initial balances
    const senderInitialBalance = await hre.ethers.provider.getBalance(deployerSigner.address);
    const initialRecipientBalances = await Promise.all(
      recipients.map((addr) => hre.ethers.provider.getBalance(addr))
    );

    // Execute multiSend transaction
    const tx = await contract.connect(deployerSigner).multiSend(recipients, amountPerRecipient, { value: totalSent });
    const receipt = await tx.wait();

    // Ensure receipt is not null
    if (!receipt) {
      throw new Error('Transaction receipt is null');
    }

    // Calculate gas used
    const gasUsed = BigInt(receipt.gasUsed.toString()) * hre.ethers.parseUnits('1', 'gwei');
    const senderFinalBalance = await hre.ethers.provider.getBalance(deployerSigner.address);

    // Record final recipient balances
    const finalRecipientBalances = await Promise.all(
      recipients.map((addr) => hre.ethers.provider.getBalance(addr))
    );

    // Verify each recipient received the expected deficit
    for (let i = 0; i < recipients.length; i++) {
      const receivedAmount = BigInt(finalRecipientBalances[i]) - BigInt(initialRecipientBalances[i]);
      expect(receivedAmount).to.equal(recipientDeficits[i]);
    }

    // Verify sender's final balance after deductions
    const expectedFinalBalance = senderInitialBalance - totalRequired - gasUsed; // Expected final balance
    expect(senderFinalBalance).to.equal(expectedFinalBalance);
  });
});
