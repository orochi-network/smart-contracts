import hre from "hardhat";
import { expect } from "chai";
import { MultiSendFixedAmount } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import Deployer from "../helpers/deployer";

let accounts: SignerWithAddress[];
let deployerSigner: SignerWithAddress;
let recipient1: SignerWithAddress;
let recipient2: SignerWithAddress;
let recipient3: SignerWithAddress;

let contract: MultiSendFixedAmount;

describe("MultiSendFixedAmount", function () {
  beforeEach(async () => {
    accounts = await hre.ethers.getSigners();
    [deployerSigner, recipient1, recipient2, recipient3] = accounts;

    const deployer: Deployer = Deployer.getInstance(hre);
    deployer.connect(deployerSigner);
    contract = await deployer.contractDeploy<MultiSendFixedAmount>(
      "MultiSendFixedAmount/MultiSendFixedAmount",
      []
    );
  });

  it("Should distribute the correct amount to all recipients", async () => {
    const recipients = [recipient1.address, recipient2.address, recipient3.address];
    const amountPerRecipient = hre.ethers.parseEther("1"); // 1 ETH per recipient
    const totalAmount = amountPerRecipient * BigInt(recipients.length);
  
    // Track initial balances
    const initialBalances = await Promise.all(
      recipients.map((recipient) => hre.ethers.provider.getBalance(recipient))
    );
  
    // Send ETH to all recipients
    await contract.connect(deployerSigner).multiSend(recipients, amountPerRecipient, {
      value: totalAmount,
    });
  
    // Check that each recipient received the correct amount
    const finalBalances = await Promise.all(
      recipients.map((recipient) => hre.ethers.provider.getBalance(recipient))
    );
  
    for (let i = 0; i < recipients.length; i++) {
      const receivedAmount = BigInt(finalBalances[i]) - BigInt(initialBalances[i]);
      expect(receivedAmount).to.equal(amountPerRecipient);
    }
  });
  

  it("Should refund excess ETH to the sender", async () => {
    const recipients = [recipient1.address, recipient2.address];
    const amountPerRecipient = hre.ethers.parseEther("1");
    const totalRequired = amountPerRecipient * BigInt(recipients.length);
    const excessAmount = hre.ethers.parseEther("0.5");
    const totalSent = totalRequired + excessAmount;

    const senderInitialBalance = await hre.ethers.provider.getBalance(deployerSigner.address);

    const tx = await contract
      .connect(deployerSigner)
      .multiSend(recipients, amountPerRecipient, { value: totalSent });
    const receipt = await tx.wait();

    if (receipt && receipt.gasUsed) {
      const gasUsed = BigInt(receipt.gasUsed.toString()) * hre.ethers.parseUnits("1", "gwei");
      const senderFinalBalance = await hre.ethers.provider.getBalance(deployerSigner.address);

      expect(senderFinalBalance).to.equal(senderInitialBalance - totalRequired - gasUsed);
    } else {
      throw new Error("Receipt or gasUsed is not defined.");
    }
  });

  it("Should handle empty recipient list gracefully", async () => {
    const recipients: string[] = [];
    const amountPerRecipient = hre.ethers.parseEther("1");

    const senderInitialBalance = await hre.ethers.provider.getBalance(deployerSigner.address);

    const tx = await contract
      .connect(deployerSigner)
      .multiSend(recipients, amountPerRecipient, {
        value: hre.ethers.parseEther("0"),
      });
    const receipt = await tx.wait();

    if (receipt && receipt.gasUsed) {
      const gasUsed = BigInt(receipt.gasUsed.toString()) * hre.ethers.parseUnits("1", "gwei");
      const senderFinalBalance = await hre.ethers.provider.getBalance(deployerSigner.address);

      expect(senderFinalBalance).to.equal(senderInitialBalance - gasUsed);
    } else {
      throw new Error("Receipt or gasUsed is not defined.");
    }
  });

  it("Should revert if insufficient ETH is sent", async () => {
    const recipients = [recipient1.address, recipient2.address];
    const amountPerRecipient = hre.ethers.parseEther("1");
    const totalRequired = amountPerRecipient * BigInt(recipients.length);

    await expect(
      contract.connect(deployerSigner).multiSend(recipients, amountPerRecipient, {
        value: totalRequired - hre.ethers.parseEther("0.5"),
      })
    ).to.be.revertedWith("Not enough gas provided.");
  });
});
