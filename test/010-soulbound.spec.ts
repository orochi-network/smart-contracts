import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import hre from 'hardhat';
import Deployer from '../helpers/deployer';
import { XORO } from '../typechain-types';
import { expect } from 'chai';

const TOKEN_NAME = 'ORC [Beta Token]';
const TOKEN_SYMBOL = 'XORO';
const MAX_AMOUNT_APPROVAL = Number.MAX_SAFE_INTEGER;

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

let contract: XORO;

const packData = (amount: bigint, address: string): bigint => (amount << 160n) | BigInt(address);

describe.only('XORO token', function () {
  it('XORO token must be deployed correctly', async () => {
    accounts = await hre.ethers.getSigners();
    [deployerSigner, player01, player02, player03, newOwner, operator1, operator2, fakeOperator, operator3] = accounts;
    const deployer: Deployer = Deployer.getInstance(hre);
    deployer.connect(deployerSigner);
    contract = await deployer.contractDeploy<XORO>('token/XORO', [], TOKEN_NAME, TOKEN_SYMBOL, [
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
    expect(await contract.decimals()).eq(0n);
    expect(await contract.isOperator(operator1)).eq(true);
    expect(await contract.isOperator(operator2)).eq(true);
    expect(await contract.isOperator(operator3)).eq(false);
    for (let i = 0; i < data.length; i += 1) {
      packedData.push(packData(data[i].amount, data[i].to));
    }
    await contract.connect(operator1).batchMint([...packedData]);
  });

  it('All player must have their correct token amount', async () => {
    expect(await contract.balanceOf(player01)).eq(20n);
    expect(await contract.balanceOf(player02)).eq(1n);
    expect(await contract.balanceOf(player03)).eq(15n);
  });

  it('Only operator can mint token', async () => {
    await expect(contract.connect(newOwner).batchMint([packData(100n, player01.address)])).to.revertedWithCustomError(
      contract,
      'InvalidOperator',
    );
    expect(await contract.balanceOf(player01)).eq(20n);
  });

  it("Player 1 can't approve operator to act with player's 1 token", async () => {
    await expect(contract.connect(player01).approve(operator1.address, MAX_AMOUNT_APPROVAL)).revertedWithCustomError(
      contract,
      'AccessDenied',
    );
  });

  it("Player 1 can't transfer token to player 2", async () => {
    await expect(contract.connect(player01).transfer(player02, '5')).to.revertedWithCustomError(
      contract,
      'AccessDenied',
    );
    expect(await contract.balanceOf(player01)).eq(20n);
    expect(await contract.balanceOf(player02)).eq(1n);
  });

  it("Contract owner can't transfer token to player 1", async () => {
    await expect(contract.connect(deployerSigner).transfer(player01, 5n)).to.revertedWithCustomError(
      contract,
      'AccessDenied',
    );
    expect(await contract.balanceOf(player01)).eq(20n);
    expect(await contract.balanceOf(player02)).eq(1n);
    expect(await contract.balanceOf(deployerSigner)).eq(20n);
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
    await expect(contract.connect(operator2).batchMint([packData(10n, player01.address)])).to.revertedWithCustomError(
      contract,
      'InvalidOperator',
    );

    expect(await contract.balanceOf(player01)).eq(20n);
    await contract.connect(operator1).batchMint([packData(15n, player02.address)]);

    await contract.connect(newOwner).transferOwnership(deployerSigner);
    expect(await contract.owner()).eq(deployerSigner);
    expect(await contract.balanceOf(player02)).eq(16n);
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
    await expect(contract.connect(operator2).batchMint([...packedData])).to.revertedWithCustomError(
      contract,
      'InvalidOperator',
    );
    await contract.connect(operator1).batchMint([...packedData]);

    expect(await contract.balanceOf(player01)).eq(22n);
    expect(await contract.balanceOf(player02)).eq(21n);
    expect(await contract.balanceOf(player03)).eq(115n);
  });

  it('Operator can burn token', async () => {
    await contract.connect(operator1).batchBurn([packData(12n, player01.address)]);
    expect(await contract.balanceOf(player01)).to.eq(10n);
  });
});
