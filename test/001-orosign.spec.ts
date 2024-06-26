import hre from 'hardhat';
import { expect } from 'chai';
import { BigO, OrosignV1, OrosignMasterV1 } from '../typechain-types';
import { getBytes } from 'ethers';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import Deployer from '../helpers/deployer';
import { dayToSec, printAllEvents } from '../helpers/functions';
import { OrosignEncoding } from '@orochi-network/utilities';

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
const ROLE_SIGNER = PERMISSION_VOTE | PERMISSION_OBSERVE;
const ROLE_EXECUTOR = PERMISSION_EXECUTE | PERMISSION_OBSERVE;
const ROLE_OBSERVER = PERMISSION_OBSERVE;
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
let replayAttackParams: any;

describe('OrosignV1', function () {
  it('OrosignV1 must be deployed correctly', async () => {
    const network = await hre.ethers.provider.getNetwork();
    accounts = await hre.ethers.getSigners();
    [deployerSigner, creator, voter, executor, viewer, admin1, admin2, admin3, nobody] = accounts;
    const deployer: Deployer = Deployer.getInstance(hre);
    deployer.connect(deployerSigner);
    contractBigO = await deployer.contractDeploy<BigO>('test/BigO', []);
    contractMultiSig = await deployer.contractDeploy<OrosignV1>('test/OrosignV1', []);

    await contractBigO.transfer(contractMultiSig, 10000n * UNIT);

    const userList = OrosignEncoding.sortByAddress([
      {
        address: await creator.getAddress(),
        data: ROLE_CREATOR,
      },
      {
        address: await voter.getAddress(),
        data: ROLE_SIGNER,
      },
      {
        address: await executor.getAddress(),
        data: ROLE_EXECUTOR,
      },
      {
        address: await viewer.getAddress(),
        data: ROLE_OBSERVER,
      },
      {
        address: await admin1.getAddress(),
        data: ROLE_ADMIN,
      },
      {
        address: await admin2.getAddress(),
        data: ROLE_ADMIN,
      },
      {
        address: await admin3.getAddress(),
        data: ROLE_ADMIN,
      },
    ]);

    printAllEvents(
      await contractMultiSig.init(
        userList.map((e) => e.address),
        userList.map((e) => e.data),
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
    const checkList = OrosignEncoding.sortByAddress([
      {
        address: await creator.getAddress(),
        data: ROLE_CREATOR,
      },
      {
        address: await voter.getAddress(),
        data: ROLE_SIGNER,
      },
      {
        address: await executor.getAddress(),
        data: ROLE_EXECUTOR,
      },
      {
        address: await viewer.getAddress(),
        data: ROLE_OBSERVER,
      },
      {
        address: await admin1.getAddress(),
        data: ROLE_ADMIN,
      },
      {
        address: await admin2.getAddress(),
        data: ROLE_ADMIN,
      },
      {
        address: await admin3.getAddress(),
        data: ROLE_ADMIN,
      },
    ]);
    const users = checkList.map((e) => e.address);
    const roles = checkList.map((e) => e.data);
    const userList = await contractMultiSig.getAllUser();
    for (let i = 0; i < userList.length; i += 1) {
      let value = userList[i].toString(16).replace(/^0x/gi, '').padStart(64, '0');
      const permission = BigInt(`0x${value.substring(0, 24)}`);
      const address = `0x${value.substring(24, 64)}`;
      expect(Number(permission)).to.eq(roles[i]);
      expect(users[i].toLowerCase()).to.eq(address);
    }
  });

  it('should able to deploy multisig master correctly', async () => {
    const deployer: Deployer = Deployer.getInstance(hre);
    contractMultiSigMaster = <OrosignMasterV1>(
      await deployer.contractDeploy('test/OrosignMasterV1', [], contractMultiSig, deployerSigner)
    );
  });

  it('anyone could able to create new multisig from multi signature master', async () => {
    const deployer: Deployer = Deployer.getInstance(hre);

    const list = OrosignEncoding.sortByAddress([
      {
        address: admin1.address,
        data: ROLE_ADMIN,
      },
      {
        address: admin2.address,
        data: ROLE_ADMIN,
      },
    ]);

    printAllEvents(
      await contractMultiSigMaster.createWallet(
        1,
        list.map((e) => e.address),
        list.map((e) => e.data),
        1,
      ),
    );

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
    const tx = await cloneMultiSig.encodePackedTransaction(24 * 60 * 60, admin1, amount, '0x');

    printAllEvents(
      await cloneMultiSig.connect(admin2).executeTransaction(
        await admin1.signMessage(getBytes(tx)),
        OrosignEncoding.sortByAddress([
          { address: admin1.address, data: await admin1.signMessage(getBytes(tx)) },
          { address: admin2.address, data: await admin2.signMessage(getBytes(tx)) },
        ]).map((e) => e.data),
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
    const { totalSigner, threshold, securedTimeout, blockTimestamp } = await cloneMultiSig.getMetadata();

    const tx = await cloneMultiSig.encodePackedTransaction(
      24 * 60 * 60,
      contractBigO,
      0,
      contractBigO.interface.encodeFunctionData('transfer', [await admin1.getAddress(), amount]),
    );

    console.log('Cloned OrosignV1:', await cloneMultiSig.getAddress(), tx);

    const { chainId, votingDeadline, nonce, currentBlockTime, target, value, orosignAddress, data } =
      await cloneMultiSig.decodePackedTransaction(tx);
    console.log('Decode transaction:', {
      chainId,
      votingDeadline,
      nonce,
      currentBlockTime,
      target,
      value,
      orosignAddress,
      data,
    });

    replayAttackParams = [
      await admin1.signMessage(getBytes(tx)),
      OrosignEncoding.sortByAddress([
        { address: admin1.address, data: await admin1.signMessage(getBytes(tx)) },
        { address: admin2.address, data: await admin2.signMessage(getBytes(tx)) },
      ]).map((e) => e.data),
      tx,
    ];

    printAllEvents(
      await cloneMultiSig.connect(admin2).executeTransaction(
        await admin1.signMessage(getBytes(tx)),
        OrosignEncoding.sortByAddress([
          { address: admin1.address, data: await admin1.signMessage(getBytes(tx)) },
          { address: admin2.address, data: await admin2.signMessage(getBytes(tx)) },
        ]).map((e) => e.data),
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
    const userList = OrosignEncoding.sortByAddress([
      {
        address: await creator.getAddress(),
        data: ROLE_CREATOR,
      },
      {
        address: await voter.getAddress(),
        data: ROLE_SIGNER,
      },
      {
        address: await executor.getAddress(),
        data: ROLE_EXECUTOR,
      },
      {
        address: await viewer.getAddress(),
        data: ROLE_OBSERVER,
      },
      {
        address: await admin1.getAddress(),
        data: ROLE_ADMIN,
      },
      {
        address: await admin2.getAddress(),
        data: ROLE_ADMIN,
      },
      {
        address: await admin3.getAddress(),
        data: ROLE_ADMIN,
      },
    ]);
    await expect(
      contractMultiSig.connect(deployerSigner).init(
        userList.map((e) => e.address),
        userList.map((e) => e.data),
        2,
      ),
    ).to.revertedWithCustomError(contractMultiSig, 'OnlyAbleToInitOnce');
  });

  it('user should able to transfer role', async () => {
    const roleSigner = await contractMultiSig.getRole(voter);
    expect(roleSigner.activeTime).eq(0);
    expect(roleSigner.role).eq(ROLE_SIGNER);
    const roleNobody = await contractMultiSig.getRole(nobody);
    expect(roleNobody.activeTime).eq(0);
    expect(roleNobody.role).eq(0);
    await contractMultiSig.connect(voter).transferRole(nobody);
    const oldSigner = await contractMultiSig.getRole(voter);
    expect(oldSigner.activeTime).eq(0);
    expect(oldSigner.role).eq(0);
    const newSigner = await contractMultiSig.getRole(nobody);
    expect(newSigner.activeTime).gt(0);
    expect(newSigner.role).eq(ROLE_SIGNER);
    expect(await contractMultiSig.isActiveUser(nobody)).eq(false);
    expect(await contractMultiSig.isActiveUser(voter)).eq(false);
    await timeTravel(dayToSec(4));
    expect(await contractMultiSig.isActiveUser(nobody)).eq(true);
    expect(await contractMultiSig.isActiveUser(voter)).eq(false);
    expect(await contractMultiSig.isActivePermission(nobody, ROLE_SIGNER)).eq(true);
    const roleList = [ROLE_CREATOR, ROLE_EXECUTOR, ROLE_ADMIN];
    for (let i = 0; i < roleList.length; i += 1) {
      expect(await contractMultiSig.isActivePermission(nobody, roleList[i])).eq(false);
    }
  });

  it('user should able to transfer back the role', async () => {
    const roleSigner = await contractMultiSig.getRole(voter);
    expect(roleSigner.activeTime).eq(0);
    expect(roleSigner.role).eq(0);
    expect(roleSigner.index).eq(0);
    const roleNobody = await contractMultiSig.getRole(nobody);
    expect(roleNobody.activeTime).gt(0);
    expect(roleNobody.role).eq(ROLE_SIGNER);
    await contractMultiSig.connect(nobody).transferRole(voter);
    const oldSigner = await contractMultiSig.getRole(voter);
    expect(oldSigner.activeTime).gt(0);
    expect(oldSigner.role).eq(ROLE_SIGNER);
    const newSigner = await contractMultiSig.getRole(nobody);
    expect(newSigner.activeTime).eq(0);
    expect(newSigner.role).eq(0);
    expect(await contractMultiSig.isActiveUser(nobody)).eq(false);
    expect(await contractMultiSig.isActiveUser(voter)).eq(false);
    await timeTravel(dayToSec(4));
    expect(await contractMultiSig.isActiveUser(nobody)).eq(false);
    expect(await contractMultiSig.isActiveUser(voter)).eq(true);
    expect(await contractMultiSig.isActivePermission(voter, ROLE_SIGNER)).eq(true);
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
