import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import hre, { ethers } from 'hardhat';
import Deployer from '../helpers/deployer';
import { XOroV2 } from '../typechain-types';
import { expect } from 'chai';

const API_METADATA = 'https://api.example.com/metadata/{id}.json';
const TOKEN_ID = '1';

let accounts: SignerWithAddress[];
let deployerSigner: SignerWithAddress;
let player01: SignerWithAddress;
let player02: SignerWithAddress;
let player03: SignerWithAddress;
let fakeOwner: SignerWithAddress;

let contract: XOroV2;

describe.only('Soulbound', function () {
  it('Souldbound must be deployed correctly', async () => {
    const network = await hre.ethers.provider.getNetwork();
    accounts = await hre.ethers.getSigners();
    [deployerSigner, player01, player02, player03, fakeOwner] = accounts;
    const deployer: Deployer = Deployer.getInstance(hre);
    deployer.connect(deployerSigner);
    contract = await deployer.contractDeploy<XOroV2>('orochi/XOroV2', []);
    expect(await contract.owner()).eq(deployerSigner.address);
    expect(await contract.TOKEN_ID()).eq(TOKEN_ID);
    const r = await contract.uri(1);
    console.log(r);

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
    await expect(contract.connect(fakeOwner).mint(player01, '100')).to.be.revertedWith(
      'Ownable: caller is not the owner',
    );
    expect(await contract.balance(player01)).eq('20');
  });

  it("Player 1 can't approve transfer token", async () => {
    await expect(contract.connect(player01).setApprovalForAll(player02, true)).to.revertedWith('Transfer not allowed');
  });

  it("Player 1 can't transfer token to player 2", async () => {
    await expect(
      contract.connect(player01).safeTransferFrom(player01, player02, TOKEN_ID, '5', ethers.toUtf8Bytes('')),
    ).to.revertedWith('Transfer not allowed');
    expect(await contract.balance(player01)).eq('20');
    expect(await contract.balance(player02)).eq('1');
  });

  it("Contract owner can't transfer token to player 1", async () => {
    await expect(
      contract
        .connect(deployerSigner)
        .safeTransferFrom(deployerSigner, player01, TOKEN_ID, '5', ethers.toUtf8Bytes('')),
    ).to.revertedWith('Transfer not allowed');
    expect(await contract.balance(player01)).eq('20');
    expect(await contract.balance(player02)).eq('1');
  });
});
