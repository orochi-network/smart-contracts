import hre from 'hardhat';
import { expect } from 'chai';
import { MultiSendFixedAmount } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import Deployer from '../helpers/deployer';

let accounts: SignerWithAddress[];
let deployerSigner: SignerWithAddress;
let recipient1: SignerWithAddress;
let recipient2: SignerWithAddress;
let recipient3: SignerWithAddress;

let contract: MultiSendFixedAmount;

describe('MultiSendFixedAmount', function () {
  // Deploy the contract and set up accounts before each test
  beforeEach(async () => {
    accounts = await hre.ethers.getSigners();
    [deployerSigner, recipient1, recipient2, recipient3] = accounts;

    const deployer: Deployer = Deployer.getInstance(hre);
    deployer.connect(deployerSigner);
    contract = await deployer.contractDeploy<MultiSendFixedAmount>('MultiSendFixedAmount/MultiSendFixedAmount', []);
  });

  it('Should distribute the correct amount to all recipients', async () => {
    // Prepare recipient addresses and calculate the total amount
    const recipients = [recipient1.address, recipient2.address, recipient3.address];
    const amountPerRecipient = hre.ethers.parseEther('1'); // 1 ETH per recipient
    const totalAmount = amountPerRecipient * BigInt(recipients.length);

    // Record the initial balances of recipients
    const initialBalances = await Promise.all(recipients.map((recipient) => hre.ethers.provider.getBalance(recipient)));

    // Execute the multiSend function to distribute ETH
    await contract.connect(deployerSigner).multiSend(recipients, amountPerRecipient, {
      value: totalAmount,
    });

    // Record the final balances of recipients after the transfer
    const finalBalances = await Promise.all(recipients.map((recipient) => hre.ethers.provider.getBalance(recipient)));

    // Verify that each recipient received the correct amount
    for (let i = 0; i < recipients.length; i++) {
      const receivedAmount = BigInt(finalBalances[i]) - BigInt(initialBalances[i]);
      expect(receivedAmount).to.equal(amountPerRecipient);
    }
  });

  it('Should refund excess ETH to the sender', async () => {
    // Prepare recipients and calculate required and excess ETH
    const recipients = [recipient1.address, recipient2.address];
    const amountPerRecipient = hre.ethers.parseEther('1'); // 1 ETH per recipient
    const totalRequired = amountPerRecipient * BigInt(recipients.length);
    const excessAmount = hre.ethers.parseEther('0.5'); // 0.5 ETH extra
    const totalSent = totalRequired + excessAmount;

    // Record the sender's initial balance
    const senderInitialBalance = await hre.ethers.provider.getBalance(deployerSigner.address);

    // Execute the multiSend function with excess ETH
    const tx = await contract.connect(deployerSigner).multiSend(recipients, amountPerRecipient, { value: totalSent });
    const receipt = await tx.wait();

    // Ensure receipt and gasUsed are defined
    if (receipt && receipt.gasUsed) {
      const gasUsed = BigInt(receipt.gasUsed.toString()) * hre.ethers.parseUnits('1', 'gwei');
      const senderFinalBalance = await hre.ethers.provider.getBalance(deployerSigner.address);

      // Verify that the excess ETH was refunded to the sender
      expect(senderFinalBalance).to.equal(senderInitialBalance - totalRequired - gasUsed);
    } else {
      throw new Error('Receipt or gasUsed is not defined.');
    }
  });

  it('Should handle empty recipient list gracefully', async () => {
    // Prepare an empty list of recipients
    const recipients: string[] = [];
    const amountPerRecipient = hre.ethers.parseEther('1');

    // Record the sender's initial balance
    const senderInitialBalance = await hre.ethers.provider.getBalance(deployerSigner.address);

    // Execute the multiSend function with an empty recipient list
    const tx = await contract.connect(deployerSigner).multiSend(recipients, amountPerRecipient, {
      value: hre.ethers.parseEther('0'),
    });
    const receipt = await tx.wait();

    // Ensure receipt and gasUsed are defined
    if (receipt && receipt.gasUsed) {
      const gasUsed = BigInt(receipt.gasUsed.toString()) * hre.ethers.parseUnits('1', 'gwei');
      const senderFinalBalance = await hre.ethers.provider.getBalance(deployerSigner.address);

      // Verify that only gas fees were deducted
      expect(senderFinalBalance).to.equal(senderInitialBalance - gasUsed);
    } else {
      throw new Error('Receipt or gasUsed is not defined.');
    }
  });

  it('Should revert if insufficient ETH is sent', async () => {
    // Prepare recipients and calculate the required amount
    const recipients = [recipient1.address, recipient2.address];
    const amountPerRecipient = hre.ethers.parseEther('1'); // 1 ETH per recipient
    const totalRequired = amountPerRecipient * BigInt(recipients.length);

    // Attempt to execute multiSend with insufficient ETH and expect a revert
    await expect(
      contract.connect(deployerSigner).multiSend(recipients, amountPerRecipient, {
        value: totalRequired - hre.ethers.parseEther('0.5'), // 0.5 ETH short
      }),
    ).to.be.revertedWith('Not enough gas provided.');
  });
});
