import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import hre, { ethers } from 'hardhat';
import Deployer from '../helpers/deployer';
import { XOroV2 } from '../typechain-types';
import { expect } from 'chai';

const METADATA_API = 'https://metadata.orochi.network/x-oro-v2/{id}.json';
const NEW_METADATA_API = 'https://metadata.orochi.network/x-oro-v3/{id}.json';
const TOKEN_ID = 1n;
const NEW_TOKEN_ID = 2n;
const ANOTHER_TOKEN_ID = 3n;

let accounts: SignerWithAddress[];
let deployerSigner: SignerWithAddress;
let player01: SignerWithAddress;
let player02: SignerWithAddress;
let player03: SignerWithAddress;
let newOwner: SignerWithAddress;
let operator1: SignerWithAddress;
let operator2: SignerWithAddress;
let operator3: SignerWithAddress;
let fakeOperator: SignerWithAddress;

let contract: XOroV2;

const packData = (amount: bigint, address: string): bigint => (amount << 160n) | BigInt(address);

describe('Soulbound token', function () {
  it('Souldbound token must be deployed correctly', async () => {
    accounts = await hre.ethers.getSigners();
    [deployerSigner, player01, player02, player03, newOwner, operator1, operator2, fakeOperator, operator3] = accounts;
    const deployer: Deployer = Deployer.getInstance(hre);
    deployer.connect(deployerSigner);
    contract = await deployer.contractDeploy<XOroV2>('orochi/XOroV2', [], METADATA_API, [
      operator1.address,
      operator2.address,
    ]);
    const packedData = [];
    const data = [
      {
        to: player01.address,
        amount: 20n,
      },
      {
        to: player02.address,
        amount: 1n,
      },
      {
        to: player03.address,
        amount: 15n,
      },
      {
        to: deployerSigner.address,
        amount: 20n,
      },
    ];

    expect(await contract.owner()).eq(deployerSigner.address);
    expect(await contract.isOperator(operator1)).eq(true);
    expect(await contract.isOperator(operator2)).eq(true);
    expect(await contract.isOperator(operator3)).eq(false);
    expect(await contract.uri(TOKEN_ID)).eq(METADATA_API);
    expect(await contract.uri(NEW_TOKEN_ID)).eq(METADATA_API);
    expect(await contract.uri(ANOTHER_TOKEN_ID)).eq(METADATA_API);
    for (let i = 0; i < data.length; i += 1) {
      packedData.push(packData(data[i].amount, data[i].to));
    }
    await contract.connect(operator1).batchMint(TOKEN_ID, [...packedData]);
  });

  it('All player must have their correct token amount', async () => {
    expect(await contract.balanceOf(player01, TOKEN_ID)).eq(20n);
    expect(await contract.balanceOf(player02, TOKEN_ID)).eq(1n);
    expect(await contract.balanceOf(player03, TOKEN_ID)).eq(15n);
  });

  it('Only operator can mint token', async () => {
    await expect(
      contract.connect(newOwner).batchMint(TOKEN_ID, [packData(100n, player01.address)]),
    ).to.revertedWithCustomError(contract, 'InvalidOperator');
    expect(await contract.balanceOf(player01, TOKEN_ID)).eq(20n);
  });

  it("Player 1 can approve operator to act with player's 1 token", async () => {
    // await contract.connect(player01).setApprovalForAll(operator1, true);
    await expect(contract.connect(player01).setApprovalForAll(operator1, true)).revertedWithCustomError(
      contract,
      'AccessDenied',
    );
  });

  it("Player 1 can't transfer token to player 2", async () => {
    await expect(
      contract.connect(player01).safeTransferFrom(player01, player02, TOKEN_ID, '5', ethers.toUtf8Bytes('')),
    ).to.revertedWithCustomError(contract, 'AccessDenied');
    expect(await contract.balanceOf(player01, TOKEN_ID)).eq(20n);
    expect(await contract.balanceOf(player02, TOKEN_ID)).eq(1n);
  });

  it("Contract owner can't transfer token to player 1", async () => {
    await expect(
      contract.connect(deployerSigner).safeTransferFrom(deployerSigner, player01, TOKEN_ID, 5n, ethers.toUtf8Bytes('')),
    ).to.revertedWithCustomError(contract, 'AccessDenied');
    expect(await contract.balanceOf(player01, TOKEN_ID)).eq(20n);
    expect(await contract.balanceOf(player02, TOKEN_ID)).eq(1n);
    expect(await contract.balanceOf(deployerSigner, TOKEN_ID)).eq(20n);
  });

  it("Player 1 can't batch transfer to player 2", async () => {
    await expect(
      contract.connect(player01).safeBatchTransferFrom(player01, player02, [TOKEN_ID], [12n], ethers.toUtf8Bytes('')),
    ).to.revertedWithCustomError(contract, 'AccessDenied');
  });

  it('Current owner can transfer ownership to another owner', async () => {
    await contract.connect(deployerSigner).transferOwnership(newOwner);
    expect(await contract.owner()).eq(newOwner.address);
  });

  it('New Owner can add/ remove operator correctly', async () => {
    expect(await contract.isOperator(operator3)).eq(false);
    await contract.connect(newOwner).addOperator(operator3.address);
    expect(await contract.isOperator(operator3)).eq(true);
    await expect(contract.connect(deployerSigner).addOperator(fakeOperator.address)).to.revertedWith(
      'Ownable: caller is not the owner',
    );
    await contract.connect(newOwner).removeOperator(operator2.address);
    expect(await contract.isOperator(operator2)).eq(false);
  });

  it("Old operator can't mint token anymore", async () => {
    await expect(
      contract.connect(operator2).batchMint(TOKEN_ID, [packData(10n, player01.address)]),
    ).to.revertedWithCustomError(contract, 'InvalidOperator');

    expect(await contract.balanceOf(player01, TOKEN_ID)).eq(20n);
    await contract.connect(operator1).batchMint(TOKEN_ID, [packData(15n, player02.address)]);

    await contract.connect(newOwner).transferOwnership(deployerSigner);
    expect(await contract.owner()).eq(deployerSigner);
    expect(await contract.balanceOf(player02, TOKEN_ID)).eq(16n);
  });

  it('Token can call balanceOfBatch correctly', async () => {
    console.log(await contract.balanceOfBatch([player01, player02, player03], [TOKEN_ID, TOKEN_ID, TOKEN_ID]));
    expect(await contract.balanceOfBatch([player01, player02, player03], [TOKEN_ID, TOKEN_ID, TOKEN_ID])).to.deep.eq([
      20n,
      16n,
      15n,
    ]);
  });

  it('Only operator can run batchMint', async () => {
    const packedData = [];
    const data = [
      { amount: 2n, to: player01.address },
      { amount: 5n, to: player02.address },
      { amount: 100n, to: player03.address },
    ];
    for (let i = 0; i < data.length; i += 1) {
      const amount = data[i].amount << 160n;
      packedData.push(amount | BigInt(data[i].to));
    }
    await expect(contract.connect(operator2).batchMint(TOKEN_ID, [...packedData])).to.revertedWithCustomError(
      contract,
      'InvalidOperator',
    );
    await contract.connect(operator1).batchMint(TOKEN_ID, [...packedData]);

    expect(await contract.balanceOf(player01, TOKEN_ID)).eq(22n);
    expect(await contract.balanceOf(player02, TOKEN_ID)).eq(21n);
    expect(await contract.balanceOf(player03, TOKEN_ID)).eq(115n);
  });

  it('Only operator can mint other tokenId', async () => {
    await expect(
      contract.connect(operator2).batchMint(NEW_TOKEN_ID, [packData(100n, player01.address)]),
    ).to.revertedWithCustomError(contract, 'InvalidOperator');
    await expect(
      contract.connect(operator2).batchMint(ANOTHER_TOKEN_ID, [packData(100n, player01.address)]),
    ).to.revertedWithCustomError(contract, 'InvalidOperator');

    await contract.connect(operator1).batchMint(NEW_TOKEN_ID, [packData(100n, player01.address)]);

    await contract.connect(operator3).batchMint(NEW_TOKEN_ID, [packData(1n, player02.address)]);

    expect(
      await contract.balanceOfBatch([player01, player02, player03], [NEW_TOKEN_ID, NEW_TOKEN_ID, NEW_TOKEN_ID]),
    ).to.deep.eq([100n, 1n, 0n]);

    expect(await contract.balanceOfBatch([player01, player02, player03], [TOKEN_ID, TOKEN_ID, TOKEN_ID])).to.deep.eq([
      22n,
      21n,
      115n,
    ]);

    expect(
      await contract.balanceOfBatch(
        [player01, player02, player03],
        [ANOTHER_TOKEN_ID, ANOTHER_TOKEN_ID, ANOTHER_TOKEN_ID],
      ),
    ).to.deep.eq([0n, 0n, 0n]);
  });

  it('Only operator can run batch mint and it should works correctly with another tokenId', async () => {
    const packedData = [];
    const data = [
      { amount: 4n, to: player01.address },
      { amount: 5n, to: player02.address },
      { amount: 10n, to: player03.address },
    ];
    for (let i = 0; i < data.length; i += 1) {
      packedData.push(packData(data[i].amount, data[i].to));
    }
    await expect(contract.connect(operator2).batchMint(NEW_TOKEN_ID, [...packedData])).to.revertedWithCustomError(
      contract,
      'InvalidOperator',
    );
    await contract.connect(operator1).batchMint(NEW_TOKEN_ID, [...packedData]);
    expect(
      await contract.balanceOfBatch([player01, player02, player03], [NEW_TOKEN_ID, NEW_TOKEN_ID, NEW_TOKEN_ID]),
    ).to.deep.eq([104n, 6n, 10n]);
    expect(
      await contract.balanceOfBatch(
        [player01, player02, player03],
        [ANOTHER_TOKEN_ID, ANOTHER_TOKEN_ID, ANOTHER_TOKEN_ID],
      ),
    ).to.deep.eq([0n, 0n, 0n]);
  });

  it('Operator can burn token', async () => {
    await contract.connect(operator1).batchBurn(TOKEN_ID, [packData(12n, player01.address)]);
    await contract.connect(operator3).batchBurn(NEW_TOKEN_ID, [packData(1n, player02.address)]);
    expect(await contract.balanceOf(player01, TOKEN_ID)).to.eq(10n);
    expect(await contract.balanceOf(player02, NEW_TOKEN_ID)).to.eq(5n);
  });

  it('Only owner can set new metadata url', async () => {
    await contract.connect(deployerSigner).setURI(NEW_METADATA_API);
    expect(await contract.uri(TOKEN_ID)).eq(NEW_METADATA_API);
    await expect(contract.connect(operator1).setURI(METADATA_API)).to.revertedWith('Ownable: caller is not the owner');
    await expect(contract.connect(newOwner).setURI(METADATA_API)).to.revertedWith('Ownable: caller is not the owner');
  });
});
