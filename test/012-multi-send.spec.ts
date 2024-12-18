import hre from 'hardhat';
import { expect } from 'chai';
import { MultiSend } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import Deployer from '../helpers/deployer';
import { parseEther } from 'ethers';

let account: SignerWithAddress[];
let deployerSigner: SignerWithAddress;
let recipient1: SignerWithAddress;
let recipient2: SignerWithAddress;
let recipient3: SignerWithAddress;
let recipient4: SignerWithAddress;
let recipient5: SignerWithAddress;

let contract: MultiSend;

describe('MultiSend', function () {
  // Deploy the contract and set up accounts before each test
  beforeEach(async () => {
    account = await hre.ethers.getSigners();
    [deployerSigner, recipient1, recipient2, recipient3, recipient4, recipient5] = account;

    const deployer: Deployer = Deployer.getInstance(hre);
    deployer.connect(deployerSigner);
    contract = await deployer.contractDeploy<MultiSend>('MultiSend/MultiSend', []);
  });

  

  // Handle empty recipient list gracefully
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

    // Ensure receipt is not null
    if (!receipt) {
      throw new Error('Transaction receipt is null');
    }

    // Calculate gas used
    const gasUsed = receipt.gasUsed;
    const gasPrice = tx.gasPrice || hre.ethers.parseUnits('1', 'gwei'); // Fallback to 1 gwei if undefined
    const totalGasCost = gasUsed * gasPrice;

    // Record sender's final balance
    const senderFinalBalance = await hre.ethers.provider.getBalance(deployerSigner.address);

    // Verify sender's final balance only reflects gas deduction
    expect(senderFinalBalance).to.equal(senderInitialBalance - totalGasCost);
  });

  // insufficient amount
  it('Should revert with InsufficientFund error if not enough balance for third recipient, rollback', async () => {
    const recipient = [recipient1.address, recipient2.address, recipient3.address];
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
      `0x${hre.ethers.parseUnits('0.3', 'ether').toString(16)}`, // Recipient 3 starts with 0.3 ETH
    ]);

    // Calculate the total amount to be sent (only enough to cover 2 recipients)
    const totalSent = hre.ethers.parseEther('1.3'); // 1.3 ETH total

    // Record sender's initial balance
    const senderInitialBalance = await hre.ethers.provider.getBalance(deployerSigner.address);

    // Record initial balances of recipients
    const recipient1InitialBalance = await hre.ethers.provider.getBalance(recipient1.address);
    const recipient2InitialBalance = await hre.ethers.provider.getBalance(recipient2.address);
    const recipient3InitialBalance = await hre.ethers.provider.getBalance(recipient3.address);

    // Execute the multiSend transaction and expect it to revert
    const txPromise = contract.connect(deployerSigner).multiSend(recipient, amountPerRecipient, { value: totalSent });

    // Expect the transaction to revert with custom error
    await expect(txPromise).to.be.revertedWithCustomError(contract, 'InsufficientFund');

    // After revert, record sender's final balance
    const senderFinalBalance = await hre.ethers.provider.getBalance(deployerSigner.address);

    // Ensure that the sender's balance has decreased by the gas cost (but no funds were transferred)
    expect(senderFinalBalance).to.be.below(senderInitialBalance); // Sender's balance should decrease by the gas fee

    // After revert, check that recipient balances have not changed
    const recipient1FinalBalance = await hre.ethers.provider.getBalance(recipient1.address);
    const recipient2FinalBalance = await hre.ethers.provider.getBalance(recipient2.address);
    const recipient3FinalBalance = await hre.ethers.provider.getBalance(recipient3.address);

    // Verify no change in recipient balances
    expect(recipient1FinalBalance).to.equal(recipient1InitialBalance);
    expect(recipient2FinalBalance).to.equal(recipient2InitialBalance);
    expect(recipient3FinalBalance).to.equal(recipient3InitialBalance);
  });

  // excess send amount
  it('Should return the excess funds to sender if more ETH is sent than needed and send correct eth to all recipient', async () => {
    const recipient = [
      recipient1.address,
      recipient2.address,
      recipient5.address,
      recipient3.address,
      recipient4.address,
    ];
    const amountPerRecipient = hre.ethers.parseEther('1'); // 1 ETH per recipient

    await hre.ethers.provider.send('hardhat_setBalance', [
      deployerSigner.address,
      `0x${hre.ethers.parseUnits('10', 'ether').toString(16)}`, // Sender starts with 10 ETH
    ]);
    // Set initial balances for recipients
    await hre.ethers.provider.send('hardhat_setBalance', [
      recipient1.address,
      `0x${hre.ethers.parseUnits('0.6', 'ether').toString(16)}`, // Recipient 1 starts with 0.6 ETH
    ]);

    await hre.ethers.provider.send('hardhat_setBalance', [
      recipient2.address,
      `0x${hre.ethers.parseUnits('0.2', 'ether').toString(16)}`, // Recipient 2 starts with 0.2 ETH
    ]);

    await hre.ethers.provider.send('hardhat_setBalance', [
      recipient3.address,
      `0x${hre.ethers.parseUnits('0.3', 'ether').toString(16)}`, // Recipient 3 starts with 0.3 ETH
    ]);

    await hre.ethers.provider.send('hardhat_setBalance', [
      recipient4.address,
      `0x${hre.ethers.parseUnits('0.6', 'ether').toString(16)}`, // Recipient 4 starts with 0.6 ETH
    ]);

    await hre.ethers.provider.send('hardhat_setBalance', [
      recipient5.address,
      `0x${hre.ethers.parseUnits('0.9', 'ether').toString(16)}`, // Recipient 5 starts with 0.9 ETH
    ]);

    // Calculate the total amount to be sent
    const totalSent = hre.ethers.parseEther('5'); // Sending 5 ETH total, 1 ETH per recipient

    // Record sender's initial balance before transaction
    const senderInitialBalance = await hre.ethers.provider.getBalance(deployerSigner.address);

    // Execute the multiSend transaction
    const tx = await contract.connect(deployerSigner).multiSend(recipient, amountPerRecipient, { value: totalSent });

    // Wait for transaction receipt 
    const receipt = await tx.wait();
    if (receipt == null) {
      throw new Error('Can not return receipt');
    }
    const gasPrice = receipt.gasPrice;

    // Record the sender's final balance after the transaction
    const senderFinalBalance = await hre.ethers.provider.getBalance(deployerSigner.address);

    // Log balances
    console.log('Sender Initial Balance: ', senderInitialBalance.toString());
    console.log('Sender Final Balance: ', senderFinalBalance.toString());

    // Check if receipt is available
    if (!receipt) {
      throw new Error('Transaction receipt is null');
    }

    // Calculate gas used and refund logic
    const gasUsed = receipt.gasUsed;
    const gasCost = gasUsed * gasPrice; // Multiply gas used by gas price to get the total cost of gas
    console.log('Gas Used: ', gasUsed.toString());
    console.log('Gas Cost: ', gasCost.toString());

    // Refund 2.6 ethers
    const expectedSenderFinalBalance = senderInitialBalance - hre.ethers.parseEther('2.4') - gasCost;
    console.log('Expected Sender Final Balance after refund and gas: ', expectedSenderFinalBalance.toString());

    // Check that the sender's final balance is correct
    expect(senderFinalBalance).to.equal(expectedSenderFinalBalance);

    // After transaction, check that recipient balances have been updated correctly
    const recipient1FinalBalance = await hre.ethers.provider.getBalance(recipient1.address);
    const recipient2FinalBalance = await hre.ethers.provider.getBalance(recipient2.address);
    const recipient3FinalBalance = await hre.ethers.provider.getBalance(recipient3.address);
    const recipient4FinalBalance = await hre.ethers.provider.getBalance(recipient4.address);
    const recipient5FinalBalance = await hre.ethers.provider.getBalance(recipient5.address);

    // Log recipient balances
    console.log('Recipient 1 Final Balance: ', recipient1FinalBalance.toString());
    console.log('Recipient 2 Final Balance: ', recipient2FinalBalance.toString());
    console.log('Recipient 3 Final Balance: ', recipient3FinalBalance.toString());
    console.log('Recipient 4 Final Balance: ', recipient4FinalBalance.toString());
    console.log('Recipient 5 Final Balance: ', recipient5FinalBalance.toString());

    // Verify that each recipient's balance has been updated correctly
    expect(recipient1FinalBalance).to.equal(amountPerRecipient);
    expect(recipient2FinalBalance).to.equal(amountPerRecipient);
    expect(recipient3FinalBalance).to.equal(amountPerRecipient);
    expect(recipient4FinalBalance).to.equal(amountPerRecipient);
    expect(recipient5FinalBalance).to.equal(amountPerRecipient);
  });

  // Enough send amount
  it('Should send the correct amount to each recipient with Sufficient amount', async () => {
    const recipient = [
      recipient1.address,
      recipient2.address,
      recipient5.address,
      recipient3.address,
      recipient4.address,
    ];
    const amountPerRecipient = hre.ethers.parseEther('1'); // 1 ETH per recipient

    await hre.ethers.provider.send('hardhat_setBalance', [
      deployerSigner.address,
      `0x${hre.ethers.parseUnits('10', 'ether').toString(16)}`, // Sender starts with 10 ETH
    ]);
    // Set initial balances for recipients
    await hre.ethers.provider.send('hardhat_setBalance', [
      recipient1.address,
      `0x${hre.ethers.parseUnits('0.6', 'ether').toString(16)}`, // Recipient 1 starts with 0.6 ETH
    ]);

    await hre.ethers.provider.send('hardhat_setBalance', [
      recipient2.address,
      `0x${hre.ethers.parseUnits('0.2', 'ether').toString(16)}`, // Recipient 2 starts with 0.2 ETH
    ]);

    await hre.ethers.provider.send('hardhat_setBalance', [
      recipient3.address,
      `0x${hre.ethers.parseUnits('0.3', 'ether').toString(16)}`, // Recipient 3 starts with 0.3 ETH
    ]);

    await hre.ethers.provider.send('hardhat_setBalance', [
      recipient4.address,
      `0x${hre.ethers.parseUnits('0.8', 'ether').toString(16)}`, // Recipient 4 starts with 0.6 ETH
    ]);

    await hre.ethers.provider.send('hardhat_setBalance', [
      recipient5.address,
      `0x${hre.ethers.parseUnits('0.9', 'ether').toString(16)}`, // Recipient 5 starts with 0.9 ETH
    ]);

    // Calculate the total amount to be sent
    const totalSent = hre.ethers.parseEther('2.2'); // Sending 2.2 ETH total, 1 ETH per recipient

    // Record sender's initial balance before transaction
    const senderInitialBalance = await hre.ethers.provider.getBalance(deployerSigner.address);

    // Execute the multiSend transaction
    const tx = await contract.connect(deployerSigner).multiSend(recipient, amountPerRecipient, { value: totalSent });

    // Wait for transaction receipt 
    const receipt = await tx.wait();
    if (receipt == null) {
      throw new Error('Can not return receipt');
    }
    const gasPrice = receipt.gasPrice;

    // Record the sender's final balance after the transaction
    const senderFinalBalance = await hre.ethers.provider.getBalance(deployerSigner.address);

    // Log balances
    console.log('Sender Initial Balance: ', senderInitialBalance.toString());
    console.log('Sender Final Balance: ', senderFinalBalance.toString());

    // Check if receipt is available
    if (!receipt) {
      throw new Error('Transaction receipt is null');
    }

    // Calculate gas used and refund logic
    const gasUsed = receipt.gasUsed;
    const gasCost = gasUsed * gasPrice; // Multiply gas used by gas price to get the total cost of gas
    console.log('Gas Used: ', gasUsed.toString());
    console.log('Gas Cost: ', gasCost.toString());

    // Refund 2.6 ethers
    const expectedSenderFinalBalance = senderInitialBalance - totalSent - gasCost;
    console.log('Expected Sender Final Balance after refund and gas: ', expectedSenderFinalBalance.toString());

    // Check that the sender's final balance is correct
    expect(senderFinalBalance).to.equal(expectedSenderFinalBalance);

    // After transaction, check that recipient balances have been updated correctly
    const recipient1FinalBalance = await hre.ethers.provider.getBalance(recipient1.address);
    const recipient2FinalBalance = await hre.ethers.provider.getBalance(recipient2.address);
    const recipient3FinalBalance = await hre.ethers.provider.getBalance(recipient3.address);
    const recipient4FinalBalance = await hre.ethers.provider.getBalance(recipient4.address);
    const recipient5FinalBalance = await hre.ethers.provider.getBalance(recipient5.address);

    // Log recipient balances
    console.log('Recipient 1 Final Balance: ', recipient1FinalBalance.toString());
    console.log('Recipient 2 Final Balance: ', recipient2FinalBalance.toString());
    console.log('Recipient 3 Final Balance: ', recipient3FinalBalance.toString());
    console.log('Recipient 4 Final Balance: ', recipient4FinalBalance.toString());
    console.log('Recipient 5 Final Balance: ', recipient5FinalBalance.toString());

    // Verify that each recipient's balance has been updated correctly
    expect(recipient1FinalBalance).to.equal(amountPerRecipient);
    expect(recipient2FinalBalance).to.equal(amountPerRecipient);
    expect(recipient3FinalBalance).to.equal(amountPerRecipient);
    expect(recipient4FinalBalance).to.equal(amountPerRecipient);
    expect(recipient5FinalBalance).to.equal(amountPerRecipient);
  });
});
