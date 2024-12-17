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

  // Test case: Refund excess ETH to the sender (2 recipients)
  it('Should refund excess ETH to the sender (3 recipients with gas cost)', async () => {
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
  
    // Calculate the total required amount to fulfill recipient deficits
    const recipientDeficits = [
      hre.ethers.parseEther('0.5'), // Recipient 1 needs 0.5 ETH
      hre.ethers.parseEther('0.8'), // Recipient 2 needs 0.8 ETH
      hre.ethers.parseEther('0.7'), // Recipient 3 needs 0.7 ETH
    ];
  
    // Calculate total required ETH
    const totalRequired = recipientDeficits.reduce((acc, curr) => acc + curr, 0n); // Total required = 2 ETH
  
    const excessAmount = hre.ethers.parseEther('1.5'); // Extra 1.5 ETH sent
    const totalSent = totalRequired + excessAmount; // Total sent = 3.5 ETH
  
    // Record sender's initial balance
    const senderInitialBalance = await hre.ethers.provider.getBalance(deployerSigner.address);
  
    // Execute the multiSend transaction
    const tx = await contract.connect(deployerSigner).multiSend(recipient, amountPerRecipient, { value: totalSent });
    const receipt = await tx.wait();
    
    // Ensure receipt is not null
    if (!receipt) {
      throw new Error('Transaction receipt is null');
    }
  
    // Calculate gas cost
    const gasUsed = receipt.gasUsed;
    const gasPrice = tx.gasPrice || hre.ethers.parseUnits('1', 'gwei'); // Fallback to 1 gwei if undefined
    const totalGasCost = gasUsed * gasPrice;
  
    // Record sender's final balance
    const senderFinalBalance = await hre.ethers.provider.getBalance(deployerSigner.address);
  
    // Calculate expected refund and final balance
    const expectedRefund = totalSent - totalRequired; // Expected refund = 1.5 ETH
    const expectedFinalBalance = senderInitialBalance - totalRequired - totalGasCost; // Final balance after deductions
  
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

   
  
});
