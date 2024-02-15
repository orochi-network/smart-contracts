import hre from 'hardhat';
import chai, { expect } from 'chai';
import { BigO, OrosignV1, OrosignMasterV1 } from '../typechain-types';
import { ethers, getBytes } from 'ethers';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import Deployer from '../helpers/deployer';
import { dayToSec, printAllEvents } from '../helpers/functions';

// View permission only
const PERMISSION_OBSERVE = 1;
// Allowed to sign execute transaction message and vote a proposal
const PERMISSION_VOTE = 2;
// Permission to execute the proposal
const PERMISSION_EXECUTE = 4;
// Create a new proposal and do quick transfer
const PERMISSION_CREATE = 8;

const UNIT = 1000000000000000000n;

const ROLE_CREATOR = PERMISSION_CREATE | PERMISSION_OBSERVE;
const ROLE_VOTER = PERMISSION_VOTE | PERMISSION_OBSERVE;
const ROLE_EXECUTOR = PERMISSION_EXECUTE | PERMISSION_OBSERVE;
const PERMISSION_OBSERVER = PERMISSION_OBSERVE;
const ROLE_ADMIN = PERMISSION_CREATE | PERMISSION_EXECUTE | PERMISSION_VOTE | PERMISSION_OBSERVE;

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
let chainId: bigint;
let replayAttackParams: any;

function sortByAddress(data: { address: string; signature: string }[]): string[] {
  return data
    .sort((a, b) => {
      const c = BigInt(a.address);
      const d = BigInt(b.address);
      if (c > d) {
        return 1;
      } else if (c < d) {
        return -1;
      }
      return 0;
    })
    .map((e) => e.signature);
}

describe('OrosignV1', function () {
  it('OrosignV1 must be deployed correctly', async () => {
    const network = await hre.ethers.provider.getNetwork();
    chainId = network.chainId;
    accounts = await hre.ethers.getSigners();
    [deployerSigner, creator, voter, executor, viewer, admin1, admin2, admin3, nobody] = accounts;
    const deployer: Deployer = Deployer.getInstance(hre);
    deployer.connect(deployerSigner);
    contractBigO = await deployer.contractDeploy<BigO>('test/BigO', []);
    contractMultiSig = await deployer.contractDeploy<OrosignV1>('test/OrosignV1', []);

    await contractBigO.transfer(contractMultiSig, 10000n * UNIT);

    printAllEvents(
      await contractMultiSig.init(
        chainId,
        [creator, voter, executor, viewer, admin1, admin2, admin3],
        [ROLE_CREATOR, ROLE_VOTER, ROLE_EXECUTOR, PERMISSION_OBSERVER, ROLE_ADMIN, ROLE_ADMIN, ROLE_ADMIN],
        2,
      ),
    );

    expect((await contractMultiSig.getMetadata()).totalSigner).to.eq(4n);
  });

  it('permission should be correct', async () => {
    expect(await contractMultiSig.isActiveUser(admin3)).to.eq(true);
    expect(await contractMultiSig.isActivePermission(admin3, PERMISSION_CREATE | PERMISSION_EXECUTE)).to.eq(true);
    expect(await contractMultiSig.isActivePermission(admin3, PERMISSION_OBSERVE)).to.eq(true);
  });

  it('user list should be correct', async () => {
    const users = [creator, voter, executor, viewer, admin1, admin2, admin3].map((e) => e);
    const roles = [ROLE_CREATOR, ROLE_VOTER, ROLE_EXECUTOR, PERMISSION_OBSERVER, ROLE_ADMIN, ROLE_ADMIN, ROLE_ADMIN];
    const userList = await contractMultiSig.getAllUser();
    for (let i = 0; i < userList.length; i += 1) {
      let value = userList[i].toString(16).replace(/^0x/gi, '').padStart(64, '0');
      const permission = BigInt(`0x${value.substring(0, 24)}`);
      const address = `0x${value.substring(24, 64)}`;
      expect(Number(permission)).to.eq(roles[i]);
      expect((await users[i].getAddress()).toLowerCase()).to.eq(address);
    }
  });

  it('should able to deploy multisig master correctly', async () => {
    const deployer: Deployer = Deployer.getInstance(hre);
    contractMultiSigMaster = <OrosignMasterV1>(
      await deployer.contractDeploy('test/OrosignMasterV1', [], chainId, [deployerSigner], [6], contractMultiSig)
    );
  });

  it('anyone could able to create new signature from multi signature master', async () => {
    const deployer: Deployer = Deployer.getInstance(hre);

    printAllEvents(await contractMultiSigMaster.createWallet(1, [admin1, admin2], [ROLE_ADMIN, ROLE_ADMIN], 1));

    cloneMultiSig = <OrosignV1>(
      await deployer.contractAttach(
        'test/OrosignV1',
        await contractMultiSigMaster.predictWalletAddress(1, deployerSigner),
      )
    );
  });

  it('admin should able to perform execute transaction to transfer native token', async () => {
    const amount = BigInt(Math.round(Math.random() * 1000000));
    await deployerSigner.sendTransaction({
      to: cloneMultiSig,
      value: amount,
    });
    const beforeBalance = await hre.ethers.provider.getBalance(admin1);
    const tx = await contractMultiSig.encodePackedTransaction(chainId, 24 * 60 * 60, admin1, amount, '0x');

    printAllEvents(
      await cloneMultiSig.connect(admin2).executeTransaction(
        await admin1.signMessage(getBytes(tx)),
        sortByAddress([
          { address: admin1.address, signature: await admin1.signMessage(getBytes(tx)) },
          { address: admin2.address, signature: await admin2.signMessage(getBytes(tx)) },
        ]),
        tx,
      ),
    );
    const afterBalance = await hre.ethers.provider.getBalance(admin1);
    console.log(beforeBalance.toString(), afterBalance.toString());
    expect(afterBalance - beforeBalance).to.eq(amount);
  });

  it('admin should able to perform execute transaction to transfer ERC20 token', async () => {
    const amount = BigInt(Math.round(Math.random() * 1000000));
    await contractBigO.connect(deployerSigner).transfer(cloneMultiSig, amount);
    const beforeBalance = await contractBigO.balanceOf(admin1);
    const { chainId, nonce, totalSigner, threshold, securedTimeout, blockTimestamp } =
      await cloneMultiSig.getMetadata();
    console.log({ chainId, nonce, totalSigner, threshold, securedTimeout, blockTimestamp });
    const tx = await cloneMultiSig.encodePackedTransaction(
      chainId,
      24 * 60 * 60,
      contractBigO,
      0,
      contractBigO.interface.encodeFunctionData('transfer', [await admin1.getAddress(), amount]),
    );

    replayAttackParams = [
      await admin1.signMessage(getBytes(tx)),
      sortByAddress([
        { address: admin1.address, signature: await admin1.signMessage(getBytes(tx)) },
        { address: admin2.address, signature: await admin2.signMessage(getBytes(tx)) },
      ]),
      tx,
    ];

    printAllEvents(
      await cloneMultiSig.connect(admin2).executeTransaction(
        await admin1.signMessage(getBytes(tx)),
        sortByAddress([
          { address: admin1.address, signature: await admin1.signMessage(getBytes(tx)) },
          { address: admin2.address, signature: await admin2.signMessage(getBytes(tx)) },
        ]),
        tx,
      ),
    );
    const afterBalance = await contractBigO.balanceOf(admin1);
    expect(afterBalance - beforeBalance).to.eq(amount);
  });

  it('multisig should able to prevent replay attack', async () => {
    await expect(cloneMultiSig.connect(admin2).executeTransaction(...replayAttackParams)).to.revertedWithCustomError(
      cloneMultiSig,
      'ProofInvalidNonce',
    );
  });

  it('init() can not able to be called twice', async () => {
    await expect(
      contractMultiSig.connect(deployerSigner).init(
        chainId,
        [creator, voter, executor, viewer, admin1, admin2, admin3].map((e) => e),
        [ROLE_CREATOR, ROLE_VOTER, ROLE_EXECUTOR, PERMISSION_OBSERVER, ROLE_ADMIN, ROLE_ADMIN, ROLE_ADMIN],
        2,
      ),
    ).to.revertedWithCustomError(contractMultiSig, 'OnlyAbleToInitOnce');
  });

  it('user should able to transfer role', async () => {
    const roleVoter = await contractMultiSig.getRole(voter);
    expect(roleVoter.activeTime).eq(0);
    expect(roleVoter.role).eq(ROLE_VOTER);
    expect(roleVoter.index).eq(1);
    const roleNobody = await contractMultiSig.getRole(nobody);
    expect(roleNobody.activeTime).eq(0);
    expect(roleNobody.role).eq(0);
    expect(roleNobody.index).eq(0);
    await contractMultiSig.connect(voter).transferRole(nobody);
    const oldVoter = await contractMultiSig.getRole(voter);
    expect(oldVoter.activeTime).eq(0);
    expect(oldVoter.role).eq(0);
    expect(oldVoter.index).eq(0);
    const newVoter = await contractMultiSig.getRole(nobody);
    expect(newVoter.activeTime).gt(0);
    expect(newVoter.role).eq(ROLE_VOTER);
    expect(newVoter.index).eq(1);
    expect(await contractMultiSig.isActiveUser(nobody)).eq(false);
    expect(await contractMultiSig.isActiveUser(voter)).eq(false);
    await timeTravel(dayToSec(4));
    expect(await contractMultiSig.isActiveUser(nobody)).eq(true);
    expect(await contractMultiSig.isActiveUser(voter)).eq(false);
    expect(await contractMultiSig.isActivePermission(nobody, ROLE_VOTER)).eq(true);
    const roleList = [ROLE_CREATOR, ROLE_EXECUTOR, ROLE_ADMIN];
    for (let i = 0; i < roleList.length; i += 1) {
      expect(await contractMultiSig.isActivePermission(nobody, roleList[i])).eq(false);
    }
  });

  it('user should able to transfer back the role', async () => {
    const roleVoter = await contractMultiSig.getRole(voter);
    expect(roleVoter.activeTime).eq(0);
    expect(roleVoter.role).eq(0);
    expect(roleVoter.index).eq(0);
    const roleNobody = await contractMultiSig.getRole(nobody);
    expect(roleNobody.activeTime).gt(0);
    expect(roleNobody.role).eq(ROLE_VOTER);
    expect(roleNobody.index).eq(1);
    await contractMultiSig.connect(nobody).transferRole(voter);
    const oldVoter = await contractMultiSig.getRole(voter);
    expect(oldVoter.activeTime).gt(0);
    expect(oldVoter.role).eq(ROLE_VOTER);
    expect(oldVoter.index).eq(1);
    const newVoter = await contractMultiSig.getRole(nobody);
    expect(newVoter.activeTime).eq(0);
    expect(newVoter.role).eq(0);
    expect(newVoter.index).eq(0);
    expect(await contractMultiSig.isActiveUser(nobody)).eq(false);
    expect(await contractMultiSig.isActiveUser(voter)).eq(false);
    await timeTravel(dayToSec(4));
    expect(await contractMultiSig.isActiveUser(nobody)).eq(false);
    expect(await contractMultiSig.isActiveUser(voter)).eq(true);
    expect(await contractMultiSig.isActivePermission(voter, ROLE_VOTER)).eq(true);
    const roleList = [ROLE_CREATOR, ROLE_EXECUTOR, ROLE_ADMIN];
    for (let i = 0; i < roleList.length; i += 1) {
      expect(await contractMultiSig.isActivePermission(voter, roleList[i])).eq(false);
    }
  });

  it('none user should not able to transfer role', async () => {
    await expect(contractMultiSig.connect(nobody).transferRole(nobody)).to.revertedWithCustomError(
      contractMultiSig,
      'OnlyUserAllowed',
    );
  });

  it('user should not able to transfer role to another user', async () => {
    await expect(contractMultiSig.connect(admin1).transferRole(admin2)).to.revertedWithCustomError(
      contractMultiSig,
      'InvalidReceiver',
    );
  });
});
