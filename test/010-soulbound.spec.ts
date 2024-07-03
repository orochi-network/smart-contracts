import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import hre, { ethers } from 'hardhat';
import Deployer from '../helpers/deployer';
import { XOroV2 } from '../typechain-types';
import { expect } from 'chai';

const METADATA_API = 'https://metadata.orochi.network/x-oro-v2/{id}.json';
const TOKEN_ID = 1n;
const NEW_TOKEN_ID = 2n;
const ANOTHER_TOKEN_ID = 3n;

let accounts: SignerWithAddress[];
let deployerSigner: SignerWithAddress;
let player01: SignerWithAddress;
let player02: SignerWithAddress;
let player03: SignerWithAddress;
let fakeOwner: SignerWithAddress;

let contract: XOroV2;

describe('Soulbound token', function () {
  it('Souldbound token must be deployed correctly', async () => {
    const network = await hre.ethers.provider.getNetwork();
    accounts = await hre.ethers.getSigners();
    [deployerSigner, player01, player02, player03, fakeOwner] = accounts;
    const deployer: Deployer = Deployer.getInstance(hre);
    deployer.connect(deployerSigner);
    contract = await deployer.contractDeploy<XOroV2>('orochi/XOroV2', []);
    expect(await contract.owner()).eq(deployerSigner.address);
    expect(await contract.uri(TOKEN_ID)).eq(METADATA_API);
    expect(await contract.uri(NEW_TOKEN_ID)).eq(METADATA_API);
    expect(await contract.uri(ANOTHER_TOKEN_ID)).eq(METADATA_API);

    await contract.mint(player01.address, 1n, 20n);
    await contract.mint(deployerSigner.address, 1n, 20n);
    await contract.mint(player02.address, 1n, 1n);
    await contract.mint(player03.address, 1n, 15n);
  });

  it('All player must have their correct token amount', async () => {
    expect(await contract.balanceOf(player01, TOKEN_ID)).eq(20n);
    expect(await contract.balanceOf(player02, TOKEN_ID)).eq(1n);
    expect(await contract.balanceOf(player03, TOKEN_ID)).eq(15n);
  });

  it('Only owner can mint token', async () => {
    await expect(contract.connect(fakeOwner).mint(player01, TOKEN_ID, 100n)).to.revertedWith(
      'Ownable: caller is not the owner',
    );
    expect(await contract.balanceOf(player01, TOKEN_ID)).eq(20n);
  });

  it("Player 1 can't approve transfer token", async () => {
    await expect(contract.connect(player01).setApprovalForAll(player02, true)).to.revertedWithCustomError(
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
    await contract.connect(deployerSigner).transferOwnership(fakeOwner);
    expect(await contract.owner()).eq(fakeOwner.address);
  });

  it("Old owner can't mint token anymore", async () => {
    await expect(contract.connect(deployerSigner).mint(player01, TOKEN_ID, 10n)).to.revertedWith(
      'Ownable: caller is not the owner',
    );
    expect(await contract.balanceOf(player01, TOKEN_ID)).eq(20n);
    await contract.connect(fakeOwner).mint(player02, TOKEN_ID, 15n);
    await contract.connect(fakeOwner).transferOwnership(deployerSigner);
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

  it('Only owner can run batchMint', async () => {
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
    await expect(contract.connect(fakeOwner).batchMint(TOKEN_ID, [...packedData])).to.revertedWith(
      'Ownable: caller is not the owner',
    );
    await contract.connect(deployerSigner).batchMint(TOKEN_ID, [...packedData]);

    expect(await contract.balanceOf(player01, TOKEN_ID)).eq(22n);
    expect(await contract.balanceOf(player02, TOKEN_ID)).eq(21n);
    expect(await contract.balanceOf(player03, TOKEN_ID)).eq(115n);
  });

  it('Only owner can mint other tokenId', async () => {
    await expect(contract.connect(fakeOwner).mint(player01, NEW_TOKEN_ID, 100n)).to.revertedWith(
      'Ownable: caller is not the owner',
    );
    await expect(contract.connect(fakeOwner).mint(player01, ANOTHER_TOKEN_ID, 100n)).to.revertedWith(
      'Ownable: caller is not the owner',
    );
    await contract.connect(deployerSigner).mint(player01, NEW_TOKEN_ID, 100n);
    await contract.connect(deployerSigner).mint(player02, NEW_TOKEN_ID, 1n);

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

  it('Only owner can run batch mint and it should works correctly with another tokenId', async () => {
    const packedData = [];
    const data = [
      { amount: 4n, to: player01.address },
      { amount: 5n, to: player02.address },
      { amount: 10n, to: player03.address },
    ];
    for (let i = 0; i < data.length; i += 1) {
      const amount = data[i].amount << 160n;
      packedData.push(amount | BigInt(data[i].to));
    }
    await expect(contract.connect(fakeOwner).batchMint(NEW_TOKEN_ID, [...packedData])).to.revertedWith(
      'Ownable: caller is not the owner',
    );
    await contract.connect(deployerSigner).batchMint(NEW_TOKEN_ID, [...packedData]);
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
});
