/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { OrandProviderV2 } from '../typechain-types';
import { Deployer } from '../helpers';
import { HexString, OrandEncoding } from '@orochi-network/utilities';

const toEcvrfProof = (e: typeof epoch) => {
  return <any>{
    gamma: OrandEncoding.toAffine(HexString.hexPrefixAdd(e.gamma)),
    alpha: OrandEncoding.toScalar(HexString.hexPrefixAdd(e.alpha)),
    c: OrandEncoding.toScalar(HexString.hexPrefixAdd(e.c)),
    s: OrandEncoding.toScalar(HexString.hexPrefixAdd(e.s)),
    y: OrandEncoding.toScalar(HexString.hexPrefixAdd(e.y)),
    uWitness: `0x${e.witnessAddress}`,
    cGammaWitness: OrandEncoding.toAffine(HexString.hexPrefixAdd(e.witnessGamma)),
    sHashWitness: OrandEncoding.toAffine(HexString.hexPrefixAdd(e.witnessHash)),
    zInv: OrandEncoding.toScalar(HexString.hexPrefixAdd(e.inverseZ)),
  };
};

const epoch = {
  epoch: 1,
  alpha: '3136df4561e95a7f8ccf9ec4a1cee0aecbe8c5d8cfc340c60d7caf37ae152f68',
  gamma:
    '655d87feebcf1e5736985d77b3469a33706df3fbcb0ba9ee4ef84f519737afcbe013a109a2ce784e11336f8366499703d2bb93bbaaf1a207335e89975c4f94a1',
  c: 'c5b03a2bc4d1d92172d74907f72df077efae897cd8116e3c72d2a854b387bf71',
  s: '29e41361a7537adfd141ce2b2eccec93638657d091446e85a97192cdd8177cce',
  y: '3b1c748b6b5b35058be7962c43414387cebeaaddca8f43fc45b0709c601c5f6d',
  witnessAddress: '34215e2d8fb0b4c53f35c265ec813d9d8aa97722',
  witnessGamma:
    '3b6cecf701192b41ff91f0ae4f989f10fcae47e741b9b290ef86f42cb15e2b76eb6465f87d4d4dafba83b513fcadb238f8f066743270ff2ae2b46fb5060a37cd',
  witnessHash:
    '9a0f43013aaba62edaaa89d6a0ea0d53490e374710f562bfd00e34e9935206869d9f04193822b29f88e8289b8c33020a05c229d1ee1ea076f3d99b80a91057c6',
  inverseZ: '6b324f08036500c0e8865b4a20912ef7cfc72447a6170a41a61461c54b38b35d',
  signatureProof:
    '257b90d76eb25bdcdd57f706c8f467082f37bcb2ceceeec9bd1fcb0f70c0b19f1356e212ec58b899163f4727503dea88a61b5ace897ee0a5d70f575dc1847c401b00000000000000000000000176085252b9ad210f0ef5bf8852d1452d113627d694ddf40c7b36534ddc04d68567ee67c276212ad0abced16f8a41951c14515d2f',
  createdDate: '2024-04-22T11:02:33.146481',
};

task('test:call', 'Test vault').setAction(async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
  const account = (await hre.ethers.getSigners())[0];
  const deployer = Deployer.getInstance(hre).connect(account);
  const orand = await deployer.contractAttach<OrandProviderV2>(
    'orand/OrandProviderV2',
    '0x5778CE57f49A5487D2127fd39a060D75aF694e8c',
  );
  const { alpha, gamma, c, cGammaWitness, sHashWitness, zInv, uWitness, s } = toEcvrfProof(epoch);

  await orand.publish('0x76085252b9ad210f0ef5bf8852d1452d113627d6', {
    gamma,
    c,
    s,
    alpha,
    uWitness,
    cGammaWitness,
    sHashWitness,
    zInv,
  });
});
