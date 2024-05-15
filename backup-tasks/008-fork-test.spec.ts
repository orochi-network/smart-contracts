import hre from 'hardhat';
import { OrandProviderV2 } from '../typechain-types';
import { Deployer } from '../helpers';
import { HexString, OrandEncoding } from '@orochi-network/utilities';
import { getAddress } from 'ethers';

const epoch = {
  epoch: 215,
  alpha: 'e5aad376cc630c673fb6e2e65b87aa0022e9deb727c4a9e4c69f15ca2f5def74',
  gamma:
    'd0ff0ece7130d3d767324e2015d774adb2c5a8123098a03d624b089ec2d0d16859d0e01bcc08e3ad407f787c3eccf18c6aba70718878059fccb35e9d794db324',
  c: 'a80e5e604817b097ed29addebb28cded5742dc044fffe4918b9f63092c640738',
  s: '4bc43cbc90587eed963e7d01a42448e5fd12b7409e7577416389480a223da15a',
  y: 'd6ee83038491a857a501801d2b4a7aaf77c0e43b7ae85132c2bbf90bf56c70bb',
  witnessAddress: 'dc906e7afdfa1968536708af0cf459557448bd12',
  witnessGamma:
    '294b44bf03bafed1714fffe156e320abae03e566c2195cf19de2f787e250f0ce12abaeb8a0ab0d99294b9ee801b76071b728564c9219f4aba5605a19053e8cd3',
  witnessHash:
    'd9e960489f59aa32722a8d1b0dc3559591d5cfc57a36a2490c6f38762fcef997d079d6d7bf7457616d9b5a803236dd840ed6cc3e65d6cdb421391ecb37235305',
  inverseZ: '3870ff3e2f97576a24919b946dbed77974b1b2248ab262b839b34afd0faf46cf',
  signatureProof:
    'e914347dd746e80f057e69fe515c2ec10c706e9d473157d3a7d4975711e5d7b722e68ee582b8fd4f29ed7605370e9e217b0a69575b8eb05a3c70e5512857bc691b0000000000000000000000d776085252b9ad210f0ef5bf8852d1452d113627d643fa56a22336e217e44a10e911978845d64ff42b3356e79a3679a9d16c5b3d91',
  createdDate: '2024-05-08T17:53:39.456206',
};

const toEcvrfProof = (e: typeof epoch) => {
  return <any>{
    gamma: OrandEncoding.toAffine(HexString.hexPrefixAdd(e.gamma)),
    alpha: OrandEncoding.toScalar(HexString.hexPrefixAdd(e.alpha)),
    c: OrandEncoding.toScalar(HexString.hexPrefixAdd(e.c)),
    s: OrandEncoding.toScalar(HexString.hexPrefixAdd(e.s)),
    y: OrandEncoding.toScalar(HexString.hexPrefixAdd(e.y)),
    uWitness: getAddress(e.witnessAddress),
    cGammaWitness: OrandEncoding.toAffine(HexString.hexPrefixAdd(e.witnessGamma)),
    sHashWitness: OrandEncoding.toAffine(HexString.hexPrefixAdd(e.witnessHash)),
    zInv: OrandEncoding.toScalar(HexString.hexPrefixAdd(e.inverseZ)),
  };
};

describe('OrandProviderV2', function () {
  it('orand-v2 must be execute correctly', async () => {
    const [account] = await hre.ethers.getSigners();

    const deployer = Deployer.getInstance(hre).connect(account);
    const orandProviderV2 = await deployer.contractAttach<OrandProviderV2>(
      'OrandV2/OrandProviderV2',
      '0x5778CE57f49A5487D2127fd39a060D75aF694e8c',
    );
    console.log(
      orandProviderV2.interface
        .parseError(
          '0x71cb092ad5bcefdb1c3ccf3f0c8ac43c43fbb87c386ec8e822d6f99cd67961f3a814a588e5aad376cc630c673fb6e2e65b87aa0022e9deb727c4a9e4c69f15ca2f5def74',
        )
        ?.args.map((e) => `0x${e.toString(16)}`),
    );
    await orandProviderV2.publish.estimateGas('0x76085252b9aD210F0eF5bF8852D1452D113627d6', toEcvrfProof(epoch));
  });
});
