import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import hre, { ethers } from 'hardhat';
import Deployer from '../helpers/deployer';
import { XOroV2 } from '../typechain-types';
import { expect } from 'chai';

const METADATA_API = 'https://metadata.orochi.network/x-oro-v2/{id}.json';
const TOKEN_ID = '1';

let accounts: SignerWithAddress[];
let deployerSigner: SignerWithAddress;
let player01: SignerWithAddress;
let player02: SignerWithAddress;
let player03: SignerWithAddress;
let fakeOwner: SignerWithAddress;

let contract: XOroV2;

describe.only('Soulbound token', function () {
  it('Souldbound token must be deployed correctly', async () => {
    const network = await hre.ethers.provider.getNetwork();
    accounts = await hre.ethers.getSigners();
    [deployerSigner, player01, player02, player03, fakeOwner] = accounts;
    const deployer: Deployer = Deployer.getInstance(hre);
    deployer.connect(deployerSigner);
    contract = await deployer.contractDeploy<XOroV2>('orochi/XOroV2', []);
    expect(await contract.owner()).eq(deployerSigner.address);
    expect(await contract.TOKEN_ID()).eq(TOKEN_ID);
    expect(await contract.uri(TOKEN_ID)).eq(METADATA_API);

    await contract.mint(player01.address, '20');
    await contract.mint(deployerSigner.address, '20');
    await contract.mint(player02.address, '1');
    await contract.mint(player03.address, '15');
  });

  it('All player must have their correct token amount', async () => {
    expect(await contract.balance(player01)).eq('20');
    expect(await contract.balance(player02)).eq('1');
    expect(await contract.balance(player03)).eq('15');
  });

  it('Only owner can mint token', async () => {
    await expect(contract.connect(fakeOwner).mint(player01, '100')).to.revertedWith('Ownable: caller is not the owner');
    expect(await contract.balance(player01)).eq('20');
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
    expect(await contract.balance(player01)).eq('20');
    expect(await contract.balance(player02)).eq('1');
  });

  it("Contract owner can't transfer token to player 1", async () => {
    await expect(
      contract
        .connect(deployerSigner)
        .safeTransferFrom(deployerSigner, player01, TOKEN_ID, '5', ethers.toUtf8Bytes('')),
    ).to.revertedWithCustomError(contract, 'AccessDenied');
    expect(await contract.balance(player01)).eq('20');
    expect(await contract.balance(player02)).eq('1');
    expect(await contract.balance(deployerSigner)).eq('20');
  });

  it("Player 1 can't batch transfer to player 2", async () => {
    await expect(
      contract.connect(player01).safeBatchTransferFrom(player01, player02, [TOKEN_ID], ['12'], ethers.toUtf8Bytes('')),
    ).to.revertedWithCustomError(contract, 'AccessDenied');
  });

  it('Current owner can transfer ownership to another owner', async () => {
    await contract.connect(deployerSigner).transferOwnership(fakeOwner);
    expect(await contract.owner()).eq(fakeOwner.address);
  });

  it("Old owner can't mint token anymore", async () => {
    await expect(contract.connect(deployerSigner).mint(player01, '10')).to.revertedWith(
      'Ownable: caller is not the owner',
    );
    expect(await contract.balance(player01)).eq('20');
    await contract.connect(fakeOwner).mint(player02, '15');
    await contract.connect(fakeOwner).transferOwnership(deployerSigner);
    expect(await contract.owner()).eq(deployerSigner);
    expect(await contract.balance(player02)).eq('16');
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
      { amount: 2n, beneficiary: player01.address },
      { amount: 5n, beneficiary: player02.address },
      { amount: 100n, beneficiary: player03.address },
    ];
    for (let i = 0; i < data.length; i += 1) {
      const amount = data[i].amount << 160n;
      packedData.push(amount | BigInt(data[i].beneficiary));
    }
    await expect(contract.connect(fakeOwner).batchMint([...packedData])).to.revertedWith(
      'Ownable: caller is not the owner',
    );
    await contract.connect(deployerSigner).batchMint([...packedData]);

    expect(await contract.balance(player01)).eq(22);
    expect(await contract.balance(player02)).eq(21);
    expect(await contract.balance(player03)).eq(115);
  });
});
