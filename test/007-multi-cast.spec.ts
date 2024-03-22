import hre from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import Deployer from '../helpers/deployer';
import { Multicast } from '../typechain-types';

let deployer: Deployer, accounts: SignerWithAddress[], multiCast: Multicast;

describe('Multicast', () => {
  it('We should able to deploy Multicast contract', async () => {
    deployer = Deployer.getInstance(hre);
    accounts = await hre.ethers.getSigners();
    multiCast = <Multicast>await deployer.connect(accounts[0]).contractDeploy('orochi/Multicast', [], []);
  });

  it('We should able to call Multicast::multicast()', async () => {
    console.log(
      await multiCast.multicast(
        [multiCast, multiCast],
        [
          multiCast.interface.encodeFunctionData('state'),
          multiCast.interface.encodeFunctionData('nativeBalance', [[accounts[0].address, accounts[1].address]]),
        ],
      ),
    );
  });

  it('We should able to call Multicast::cast()', async () => {
    console.log(
      await multiCast.cast(multiCast, [
        multiCast.interface.encodeFunctionData('state'),
        multiCast.interface.encodeFunctionData('contractDigest', [[accounts[0].address, accounts[1].address]]),
      ]),
    );
  });

  it('We should able to call Multicast::contractDigest()', async () => {
    console.log(await multiCast.contractDigest([accounts[0], accounts[1]]));
  });

  it('We should able to call Multicast::eth()', async () => {
    console.log(await multiCast.nativeBalance([accounts[0], accounts[1]]));
  });
});
