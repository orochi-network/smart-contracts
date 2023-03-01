import hre from 'hardhat';
import chai, { expect } from 'chai';
import { BigO, OrosignV1, OrosignMasterV1 } from '../typechain-types';
import { utils, BigNumber, ethers } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import Deployer from '../helpers/deployer';
import { dayToSec, printAllEvents } from '../helpers/functions';

// View permission only
const PERMISSION_OBSERVER = 1;
// Allowed to sign execute transaction message and vote a proposal
const PERMISSION_VOTE = 2;
// Permission to execute the proposal
const PERMISSION_EXECUTE = 4;
// Create a new proposal and do quick transfer
const PERMISSION_CREATE = 8;

const UNIT = '1000000000000000000';

const ROLE_CREATOR = PERMISSION_CREATE | PERMISSION_OBSERVER;
const ROLE_VOTER = PERMISSION_VOTE | PERMISSION_OBSERVER;
const ROLE_EXECUTOR = PERMISSION_EXECUTE | PERMISSION_OBSERVER;
const ROLE_VIEWER = PERMISSION_OBSERVER;
const ROLE_ADMIN = PERMISSION_CREATE | PERMISSION_EXECUTE | PERMISSION_VOTE | PERMISSION_OBSERVER;

async function timeTravel(secs: number) {
  await hre.network.provider.request({
    method: 'evm_increaseTime',
    params: [secs],
  });

  await hre.network.provider.request({
    method: 'evm_mine',
    params: [],
  });
}

async function shouldFailed(asyncFunction: () => Promise<any>): Promise<boolean> {
  let error = false;
  try {
    await asyncFunction();
    error = false;
  } catch (e) {
    console.log((e as Error).message);
    error = true;
  }
  return error;
}

let accounts: SignerWithAddress[],
  contractMultiSig: OrosignV1,
  cloneMultiSig: OrosignV1,
  contractBigO: BigO,
  contractMultiSigMaster: OrosignMasterV1;
let deployerSigner: SignerWithAddress,
  creator: SignerWithAddress,
  voter: SignerWithAddress,
  executor: SignerWithAddress,
  viewer: SignerWithAddress,
  admin1: SignerWithAddress,
  admin2: SignerWithAddress,
  admin3: SignerWithAddress,
  nobody: SignerWithAddress;
let chainId: number;
let replayAttackParams: any[];

describe('OrosignV1', function () {
  it('OrosignV1 must be deployed correctly', async () => {
    const network = await hre.ethers.provider.getNetwork();
    chainId = network.chainId;
    accounts = await hre.ethers.getSigners();
    [deployerSigner, creator, voter, executor, viewer, admin1, admin2, admin3, nobody] = accounts;
    const deployer: Deployer = Deployer.getInstance(hre);
    deployer.connect(deployerSigner);
    contractBigO = <BigO>await deployer.contractDeploy('test/BigO', []);
    contractMultiSig = <OrosignV1>await deployer.contractDeploy('test/OrosignV1', []);

    await contractBigO.transfer(contractMultiSig.address, BigNumber.from(10000).mul(UNIT));

    printAllEvents(
      await contractMultiSig.init(
        chainId,
        [creator, voter, executor, viewer, admin1, admin2, admin3].map((e) => e.address),
        [ROLE_CREATOR, ROLE_VOTER, ROLE_EXECUTOR, ROLE_VIEWER, ROLE_ADMIN, ROLE_ADMIN, ROLE_ADMIN],
        2,
      ),
    );

    expect((await contractMultiSig.getMetadata()).totalSigner.toNumber()).to.eq(4);
  });

  it('permission should be correct', async () => {
    expect(await contractMultiSig.isActiveUser(admin3.address)).to.eq(true);
    expect(await contractMultiSig.isActivePermission(admin3.address, PERMISSION_CREATE | PERMISSION_EXECUTE)).to.eq(
      true,
    );
    expect(await contractMultiSig.isActivePermission(admin3.address, PERMISSION_OBSERVER)).to.eq(true);
  });

  it('user list should be correct', async () => {
    const users = [creator, voter, executor, viewer, admin1, admin2, admin3].map((e) => e.address);
    const roles = [ROLE_CREATOR, ROLE_VOTER, ROLE_EXECUTOR, ROLE_VIEWER, ROLE_ADMIN, ROLE_ADMIN, ROLE_ADMIN];
    const userList = await contractMultiSig.getAllUser();
    for (let i = 0; i < userList.length; i += 1) {
      let value = userList[i].toHexString().replace(/^0x/gi, '').padStart(64, '0');
      const permission = BigNumber.from(`0x${value.substring(0, 24)}`);
      const address = `0x${value.substring(24, 64)}`;
      expect(permission.toNumber()).to.eq(roles[i]);
      expect(users[i].toLowerCase()).to.eq(address);
    }
  });

  it('should able to deploy multisig master correctly', async () => {
    const deployer: Deployer = Deployer.getInstance(hre);
    contractMultiSigMaster = <OrosignMasterV1>(
      await deployer.contractDeploy(
        'test/OrosignMasterV1',
        [],
        chainId,
        [deployerSigner.address, deployerSigner.address],
        [1, 2],
        contractMultiSig.address,
        1000,
      )
    );
  });

  it('anyone could able to create new signature from multi signature master', async () => {
    const deployer: Deployer = Deployer.getInstance(hre);
    printAllEvents(
      await contractMultiSigMaster.createWallet(1, [admin1.address, admin2.address], [ROLE_ADMIN, ROLE_ADMIN], 1, {
        value: await contractMultiSigMaster.getFee(),
      }),
    );

    cloneMultiSig = <OrosignV1>(
      await deployer.contractAttach(
        'test/OrosignV1',
        await contractMultiSigMaster.predictWalletAddress(1, deployerSigner.address),
      )
    );
  });

  it('operator should able to set fee', async () => {
    await contractMultiSigMaster.setFee(0);
    expect((await contractMultiSigMaster.getFee()).toNumber()).to.eq(0);
  });

  it('admin should able to perform execute transaction to transfer native token', async () => {
    const amount = Math.round(Math.random() * 1000000);
    await deployerSigner.sendTransaction({
      to: cloneMultiSig.address,
      value: amount,
    });
    const beforeBalance = await admin1.getBalance();
    const tx = await contractMultiSig.encodePackedTransaction(chainId, 24 * 60 * 60, admin1.address, amount, '0x');
    printAllEvents(
      await cloneMultiSig
        .connect(admin2)
        .executeTransaction(
          await admin1.signMessage(utils.arrayify(tx)),
          [await admin1.signMessage(utils.arrayify(tx)), await admin2.signMessage(utils.arrayify(tx))],
          tx,
        ),
    );
    const afterBalance = await admin1.getBalance();
    console.log(beforeBalance.toString(), afterBalance.toString());
    expect(afterBalance.sub(beforeBalance).toNumber()).to.eq(amount);
  });

  it('admin should able to perform execute transaction to transfer ERC20 token', async () => {
    const amount = Math.round(Math.random() * 1000000);
    await contractBigO.connect(deployerSigner).transfer(cloneMultiSig.address, amount);
    const beforeBalance = await contractBigO.balanceOf(admin1.address);
    const tx = await cloneMultiSig.encodePackedTransaction(
      chainId,
      24 * 60 * 60,
      contractBigO.address,
      0,
      contractBigO.interface.encodeFunctionData('transfer', [admin1.address, amount]),
    );
    replayAttackParams = [
      await admin1.signMessage(utils.arrayify(tx)),
      [await admin1.signMessage(utils.arrayify(tx)), await admin2.signMessage(utils.arrayify(tx))],
      tx,
    ];
    printAllEvents(
      await cloneMultiSig
        .connect(admin2)
        .executeTransaction(
          await admin1.signMessage(utils.arrayify(tx)),
          [await admin1.signMessage(utils.arrayify(tx)), await admin2.signMessage(utils.arrayify(tx))],
          tx,
        ),
    );
    const afterBalance = await contractBigO.balanceOf(admin1.address);
    expect(afterBalance.sub(beforeBalance).toNumber()).to.eq(amount);
  });

  it('multisig should able to prevent replay attack', async () => {
    expect(
      await shouldFailed(async () =>
        // @ts-ignore
        cloneMultiSig.connect(admin2).executeTransaction(...(replayAttackParams as any[])),
      ),
    ).eq(true);
  });

  it('init() can not able to be called twice', async () => {
    expect(
      await shouldFailed(async () =>
        contractMultiSig.connect(deployerSigner).init(
          chainId,
          [creator, voter, executor, viewer, admin1, admin2, admin3].map((e) => e.address),
          [ROLE_CREATOR, ROLE_VOTER, ROLE_EXECUTOR, ROLE_VIEWER, ROLE_ADMIN, ROLE_ADMIN, ROLE_ADMIN],
          2,
        ),
      ),
    ).to.eq(true);
  });

  it('user should able to transfer role', async () => {
    const roleVoter = await contractMultiSig.getRole(voter.address);
    expect(roleVoter.activeTime).eq(0);
    expect(roleVoter.role).eq(ROLE_VOTER);
    expect(roleVoter.index).eq(1);
    const roleNobody = await contractMultiSig.getRole(nobody.address);
    expect(roleNobody.activeTime).eq(0);
    expect(roleNobody.role).eq(0);
    expect(roleNobody.index).eq(0);
    await contractMultiSig.connect(voter).transferRole(nobody.address);
    const oldVoter = await contractMultiSig.getRole(voter.address);
    expect(oldVoter.activeTime).eq(0);
    expect(oldVoter.role).eq(0);
    expect(oldVoter.index).eq(0);
    const newVoter = await contractMultiSig.getRole(nobody.address);
    expect(newVoter.activeTime).gt(0);
    expect(newVoter.role).eq(ROLE_VOTER);
    expect(newVoter.index).eq(1);
    expect(await contractMultiSig.isActiveUser(nobody.address)).eq(false);
    expect(await contractMultiSig.isActiveUser(voter.address)).eq(false);
    await timeTravel(dayToSec(4));
    expect(await contractMultiSig.isActiveUser(nobody.address)).eq(true);
    expect(await contractMultiSig.isActiveUser(voter.address)).eq(false);
    expect(await contractMultiSig.isActivePermission(nobody.address, ROLE_VOTER)).eq(true);
    const roleList = [ROLE_CREATOR, ROLE_EXECUTOR, ROLE_ADMIN];
    for (let i = 0; i < roleList.length; i += 1) {
      expect(await contractMultiSig.isActivePermission(nobody.address, roleList[i])).eq(false);
    }
  });

  it('user should able to transfer back the role', async () => {
    const roleVoter = await contractMultiSig.getRole(voter.address);
    expect(roleVoter.activeTime).eq(0);
    expect(roleVoter.role).eq(0);
    expect(roleVoter.index).eq(0);
    const roleNobody = await contractMultiSig.getRole(nobody.address);
    expect(roleNobody.activeTime).gt(0);
    expect(roleNobody.role).eq(ROLE_VOTER);
    expect(roleNobody.index).eq(1);
    await contractMultiSig.connect(nobody).transferRole(voter.address);
    const oldVoter = await contractMultiSig.getRole(voter.address);
    expect(oldVoter.activeTime).gt(0);
    expect(oldVoter.role).eq(ROLE_VOTER);
    expect(oldVoter.index).eq(1);
    const newVoter = await contractMultiSig.getRole(nobody.address);
    expect(newVoter.activeTime).eq(0);
    expect(newVoter.role).eq(0);
    expect(newVoter.index).eq(0);
    expect(await contractMultiSig.isActiveUser(nobody.address)).eq(false);
    expect(await contractMultiSig.isActiveUser(voter.address)).eq(false);
    await timeTravel(dayToSec(4));
    expect(await contractMultiSig.isActiveUser(nobody.address)).eq(false);
    expect(await contractMultiSig.isActiveUser(voter.address)).eq(true);
    expect(await contractMultiSig.isActivePermission(voter.address, ROLE_VOTER)).eq(true);
    const roleList = [ROLE_CREATOR, ROLE_EXECUTOR, ROLE_ADMIN];
    for (let i = 0; i < roleList.length; i += 1) {
      expect(await contractMultiSig.isActivePermission(voter.address, roleList[i])).eq(false);
    }
  });

  it('none user should not able to transfer role', async () => {
    expect(await shouldFailed(async () => contractMultiSig.connect(nobody).transferRole(nobody.address))).eq(true);
  });

  it('user should not able to transfer role to another user', async () => {
    expect(await shouldFailed(async () => contractMultiSig.connect(admin1).transferRole(admin2.address))).eq(true);
  });
});
