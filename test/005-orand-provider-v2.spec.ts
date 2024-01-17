import hre from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { OrandECDSAV2, OrandECVRFV2 } from '../typechain-types';
import { Deployer } from '../helpers';
import { OrandProviderV1 } from '../typechain-types/';
import { getAddress, getBytes, keccak256 } from 'ethers';

let deployerSigner: SignerWithAddress;
let orandECVRFV2: OrandECVRFV2;
let oradnEVDSAV2: OrandECDSAV2;
let orandProviderV1: OrandProviderV1;
let deployer: Deployer;
let somebody: SignerWithAddress;

const pk =
  '044c2abdb2dc3b03b927fab67aabf80af9d9d0a68681ea0647a455cce2ffd6ebd0bd08e6456ea6807d6f63735e108bd6b1188e2ee7caa0569153b98bd844b3f3a7';

const epochs = [
  {
    epoch: 3,
    alpha: '072013a9123b4041ec09212d163c9d3cd4796b057849b1338f9be150e8dedf81',
    gamma:
      '1ab0745d019e313c3970cb9fe388c82ef563ee7db85156991aedda097c3963c3fe6bf93bd05818e673721b9f43a747adcd44c88f93526df288d2a820a1dcd4a4',
    c: 'bcc7138173a847550a5d7b4f67912b7f2da232e330fd22918c23728d40d25bb9',
    s: '36b7fa9f91a3c387dccf0d0483c66aa493ef6ed2bd01ffd5b58e2e82aef7696e',
    y: 'aec7d4ce8990ce3fa7c681692a5e44876812ee909636200fe314c9d7d182df93',
    witnessAddress: 'a1841c0ffbc224df32683ca67b62f592a3571a7e',
    witnessGamma:
      'c5b6380edc8dedaf45eae0b190860ed852c81f4e2126f63a4498744bc60f5ccebe027d188bd75115c8c066971f88368c1efe9ccca4cff80569f4ab92eecf1259',
    witnessHash:
      'acf88d949d3c0a228ecfdc7faefd5c721c0e928c39834d179321161d6b9994ab51f05e1794d77594f24f676ebce4a61af58b7fb62790ff7011a51903d542275f',
    inverseZ: '73aa4945783de16499e3df9a2369953c0739a75ac7b92e19f85c4c7f2dc5a35b',
    signatureProof:
      'd79ba019f0c04b11aa3c73916bc9ee72e30b5458364f2f63e74e4a32099206e274ba0d7dab4250f75b6f48ec01e9a769813095d6e052735dcd963999150f50e01c0000000000000000000000040f53d56bce68dc724687a1c89eea793fd6778881aec7d4ce8990ce3fa7c681692a5e44876812ee909636200fe314c9d7d182df93',
    createdDate: '2024-01-16T07:26:07.680222',
  },
  {
    epoch: 4,
    alpha: 'aec7d4ce8990ce3fa7c681692a5e44876812ee909636200fe314c9d7d182df93',
    gamma:
      'deb60356c6ac91ec4314f3283a221b876cd310f52135a61cec75ceaf029e68ddc1fecb4277d599330bc0cef3d9a20cdb96d090b7a1a381f5285dcd7dbb921b35',
    c: '2e9e96a28c56772d964029e2ae09afa4d4ab2215297ef90770ba423baf472bb2',
    s: 'a876e16415a562c4b846e9a9d34aafb92974fa8aa7b8dbcfe078507e70e30ace',
    y: 'a345bdb1cd02513fd4f746bcb1ef05ba3bc9a555ffe50989f7effabe3bd63bae',
    witnessAddress: '51fd099c93eb18bde6bae1bf52695c72b00f8dec',
    witnessGamma:
      '0b23722e021673d62ab7accb9e5b8e11b1acc7c1b6837ca352c7275f726573db907f6b75acf67be7c755b91b9cc4645ffb6d4072e84fa8d2d9e7c5d022b3b0c5',
    witnessHash:
      'c9569be67b472c7ad51a77917b8d2214a349970be23821c7980f2621417e06831aa38f0980fe5888345d5bbd439a1d18999fa3f7981013a8e640f82053b181f2',
    inverseZ: 'c2039c0990c3af157a20c5cf7efc861b5112f41ed5cf625ab0b975bf5cbceb90',
    signatureProof:
      '0ead28ed93a91bb76105f803e9c7cb2d73eb1c0b4e55e837a9c002ca894f708007a31cf54b3b8ed7c94dd2d3e3870dd425220260f8fc9981ad51bb9aa1ae8bfc1b0000000000000000000000050f53d56bce68dc724687a1c89eea793fd6778881a345bdb1cd02513fd4f746bcb1ef05ba3bc9a555ffe50989f7effabe3bd63bae',
    createdDate: '2024-01-16T07:26:07.719118',
  },
  {
    epoch: 5,
    alpha: 'a345bdb1cd02513fd4f746bcb1ef05ba3bc9a555ffe50989f7effabe3bd63bae',
    gamma:
      'e1e6de484ada92c748586580f294bda6e3041ab08e5593bcb468db2945e1905aa4a119e851991922734a66e86f6754bd9c97a500f2d38b9ddecdb6a5310ebe69',
    c: '89709e538c639996b9a2f942c13d4f0e65642682ae731a9fe6804afe86c87524',
    s: '2ec834d839fabb73d10511b1d7f542df8648ec4ab0e5de69693350f80ec1627a',
    y: '1834b006206110bcac4ead74139695b85ea9d331bac95587c6c3faca6ad11423',
    witnessAddress: '51feebbaab9ef97338be93cb366a35c565cbdb6b',
    witnessGamma:
      '48c3c7094bfb0544b30730cfba1d7658e2b9d481eb800459afa1c8511f429354cc443086e2cd1d766de7c6a27d41833bc867821471d127ba94a1fd3be675e2b4',
    witnessHash:
      '0d46112c42028bd8f3ae5f65aba73325af094fb1e49603ba28dfa27ef4187e9b30d91f0325c80d1065633d4bb38a79f49119757abc55bcb2996295729f1a2db7',
    inverseZ: '787b652cc0cdb2141a617b7e8fd9f9c3031ffdccf7d4adcc9e272a7f33f6d18d',
    signatureProof:
      'd59c88e488fac2e2d24a895820d8654580bf959defcd6d84c13cd849cc9ce28f2186da095ef18f58e3772d905ab5a5f3b4d4422a921afbcf1bc5c9d4fb2374021c0000000000000000000000060f53d56bce68dc724687a1c89eea793fd67788811834b006206110bcac4ead74139695b85ea9d331bac95587c6c3faca6ad11423',
    createdDate: '2024-01-16T07:26:07.782973',
  },
  {
    epoch: 6,
    alpha: '1834b006206110bcac4ead74139695b85ea9d331bac95587c6c3faca6ad11423',
    gamma:
      '77d8d4b52fd2cc7be155859eb6351c63ea1ca53c1a38c31141d1155d92d42919f7ffb8e2e9a452288f557f3e412c9e0d7264492d56e10e3eb2bce8a4f4114912',
    c: '08a066525cb4ee54cd60f62bb659d656d06d62d548507a6c885639609dbbc298',
    s: '8619a2b76107fc33a0691d1f05b8971d49e0c749ab563967ca61653057b0d2f1',
    y: '7378487c9aaf61645845425b172e0c709ffdcc25f17f377dc72bf77eb470ec95',
    witnessAddress: '59be623a9c4d9925d7652104878b69957c84809a',
    witnessGamma:
      '7ca29580e74c4dc71898cc4fa92b6ddd7f5995a2bbfe7c1884b9e939581a4ffc123c065af8db558184fe073fc5f5bff21ceabded1df16d1f9eb434e796022823',
    witnessHash:
      '9da06ab077169eb662c95c168151ec6a27569448348e499efa28871ad6a54d0474639a9e0c33c1a94bcb5c6f82d6db97031c7e84e5a7b5df6fd340d737d2d880',
    inverseZ: 'c58e709b5e466d45b0ab30dd2c0f974e0f3c3023df3702c929378429a7bc49ac',
    signatureProof:
      '849cdd558add78ddd83d26fbf88380dade1372bbab0bb49ef0ce6bf61a800c23283e1b4568d9e49a261898f0d6e96b7a7f0c5f3ca94f936f3b6503e31be37e2b1b0000000000000000000000070f53d56bce68dc724687a1c89eea793fd67788817378487c9aaf61645845425b172e0c709ffdcc25f17f377dc72bf77eb470ec95',
    createdDate: '2024-01-16T07:26:07.851503',
  },
  {
    epoch: 7,
    alpha: '7378487c9aaf61645845425b172e0c709ffdcc25f17f377dc72bf77eb470ec95',
    gamma:
      'c8dd94eb90feea83c75cff8c883354295e71d5a99f49a437992c2c6c5960274dcc4902d90fe13f77a8f9b96fc716070f7b195184d7bc7a036569cf5817986146',
    c: '1eb5dfc82943318ea0f2846d19f3ed110929b63c99f2f76a3aedf764d9adf088',
    s: 'e1e4d8c9eed1799b1bdc54846c0a1a9aa839a301693105b073fae56d864e7fbf',
    y: '71107fbfcc1cb0a81952505572fb28d4e500e60e6b2ff1d2a39eee628e78b0c3',
    witnessAddress: '78b872aa39ef5667494a6dde304b60489f0c069c',
    witnessGamma:
      '3fd40ef0ec1cc9e6b9aaaaf4a4b39fd779d6370b0d7b88eff386b71ab9a570a413f70f8b1815ab63c5c0bfc1741ccfc4efb34bc8db637107c67d6666af498b74',
    witnessHash:
      '39804b22b3f5120654c902292b100a20619f13ab360acaa44f373d3ff95243ff4b880cafeb3a8a626f5f17ddcf86b5c82129d92707cb45b242749baae6fa5f22',
    inverseZ: '0a057cd5984020b9c2b9d79704c1fe36906287847c87bb5bcde3153189939cb5',
    signatureProof:
      '02714c679ceb681fa4926796f48f323db558fad197002f79fe2186042b0380ac3560077140f4f2f0c5d5a3c3dcf87f7bdf7d45c478fcb5a4af9ab4702e1347211c0000000000000000000000080f53d56bce68dc724687a1c89eea793fd677888171107fbfcc1cb0a81952505572fb28d4e500e60e6b2ff1d2a39eee628e78b0c3',
    createdDate: '2024-01-16T07:26:07.918627',
  },
  {
    epoch: 8,
    alpha: '71107fbfcc1cb0a81952505572fb28d4e500e60e6b2ff1d2a39eee628e78b0c3',
    gamma:
      '3b5900c9a528a78d42f7c96feed2905ae05ef387fda962c84ee187fbb8234b8af7b6f7388fb51024e09ed2f9d8ddd44942618938f9dae655dd683fab136057d2',
    c: '0a7ab99e1cae5a729bc86aed33b3555737009b09f27a4d0b88b6a848458f6cea',
    s: '2ac1c565d27377fccdd3f7e4f400c17b25a4c0726da737e2344e55ace741e6ee',
    y: '8a7ccf95a5b0d9d0e1fcb380250836b9a656131942e5b29bb8cc02edd98684ee',
    witnessAddress: '7cb9c0299b5c272ccfe37401692cfe949cb9b245',
    witnessGamma:
      '2297d545e5414f61f2a475d7c85860c26fcd43ad43b43e9e6f0a32bc202124448c17bd64bd953b2f081b5448b1e62b94b4f8c8785a6f6c2e39bfd6a8ae8824fa',
    witnessHash:
      '6a331730157208e9cdf03144f2eae4a52b84797f485bd995a931b9518b1226f5e7b946ec07f5542e968aef7ed644585a4df333a5e468e5cf98be3e9b1431307e',
    inverseZ: '6ae7e8cf9a6e7002849e813122fb431373cb6be9bacd8d01fc727f0693e9e020',
    signatureProof:
      'e47d228b4d1b512357397f85d244938b6b44192cf7424d5f3539f9e1ca50614c6c0ac6e1bf6ff3c190edc94b38be56453258b6320f3ca2442117acaa91f95bfa1c0000000000000000000000090f53d56bce68dc724687a1c89eea793fd67788818a7ccf95a5b0d9d0e1fcb380250836b9a656131942e5b29bb8cc02edd98684ee',
    createdDate: '2024-01-16T07:26:07.983887',
  },
  {
    epoch: 9,
    alpha: '8a7ccf95a5b0d9d0e1fcb380250836b9a656131942e5b29bb8cc02edd98684ee',
    gamma:
      '8140a817f558e825d7908359ec2a809a12f3de3323fd1101a458e8ce4be88b5554521596647f7261dde158ed3dd38f9d5787cf5203706fb133587b04502238ba',
    c: '675ea36044f4779e44cbfd129e70a581abf4f74b95b370478d67fb0cd76a4833',
    s: '99f5d664d67d02044856e51327d3391a8b33ab18856169b25f5a457c12a78380',
    y: '06836ebdd5108b12bef3993dff6d29ffe671019f01147b2d9a53ba27a03effb5',
    witnessAddress: '9b8f20e16b17c2d33c008742ec4ef54e19697e4e',
    witnessGamma:
      'f6c8c7f2999ee96c164f056ac6c8fa6f5496183d775a968f84a0a0ee0dfd0efc6684a8e54cded9df35dc3d8fc2cde8724f12eb9f26c3fd79fabb6b532f0b9a47',
    witnessHash:
      '9e20b63b3d022dfea8fcae67108d5ac2d4fed4f20b3511e987ca72fb34548dab4b30dfe3530488a5bf7b1a9ca9b3984f59be775305643758bed56d79aab0c944',
    inverseZ: '62f363686e2b24c764e1d4ad1977b5d359a63a0a03f0246b9b03583aa0799561',
    signatureProof:
      'a9b61213468910979a0787ce4bbbf197ff66c64217db4796b6a64e55cf03752e13da0422b42eb8ef5cd03dbef1650d1f88fc3a328549e6710e458f86a8367c151c00000000000000000000000a0f53d56bce68dc724687a1c89eea793fd677888106836ebdd5108b12bef3993dff6d29ffe671019f01147b2d9a53ba27a03effb5',
    createdDate: '2024-01-16T07:26:08.049018',
  },
  {
    epoch: 10,
    alpha: '06836ebdd5108b12bef3993dff6d29ffe671019f01147b2d9a53ba27a03effb5',
    gamma:
      '9bd38ded94930014ef73cc0b1a6fe162a4c7215e538816e7143c618226ad101a253c882bdb90f084756ed7987054b21ff447c2b2bda3d387cd3d01a41dfcf903',
    c: 'cf2e7c927fcc303f206ab23d9a7133ed13ab61ef3ef29354b117dfcbe840d989',
    s: 'ef3d7f8de4513563d42b0899c8d033cdd3c928d4cf66295c08e3d3ae67eef414',
    y: '64f89a848266714a4301f509eb4bd97b1ff8ae16623fb183a9050be6ff2957b1',
    witnessAddress: 'a3aa870f859cd198023e6099184e1bcf5d81a265',
    witnessGamma:
      '9f91ad99f18f863cb54678065f508d0d667cee20685efb05c309f4ac4a43fb98ba871066755e010579d3e59afa7b9c5362e1dfe21b5dc69f5abed19bb0a6a5f6',
    witnessHash:
      '2bf48913e23d2fb2263e2b068b890facacac2ae1a2db729f2c56dbdcf3d219fcfdf73736915c5bf010c636e59be9bf3aff4d5aa0fa04b57e3c45042795349ead',
    inverseZ: '79f221a9d7f1772292a9ceafb1bb4bd865b2b2d06bd7cb3992c5becead319396',
    signatureProof:
      '33972298682f0ce4e0b5fbde5d169b504f4f4d487fdf6e8538f1115d2aa5007704db256883ca619c9970ad158b2ed7814a2fe2a6c0a4a4b08ee6849d1fbf6f6b1b00000000000000000000000b0f53d56bce68dc724687a1c89eea793fd677888164f89a848266714a4301f509eb4bd97b1ff8ae16623fb183a9050be6ff2957b1',
    createdDate: '2024-01-16T07:26:08.113696',
  },
  {
    epoch: 11,
    alpha: '64f89a848266714a4301f509eb4bd97b1ff8ae16623fb183a9050be6ff2957b1',
    gamma:
      'e2d2dbe6e62c162d0727a4e46b3663b9005877bb61ed5e8c24d147235c6a2382ab835192866e68eca6ccfd752888ab5d9698c7d50dc8c8767127a330482e44fd',
    c: '505e735e2d761d347353c9869d63b48cb3064addd1eb6cea3b60f687ee5d93e1',
    s: 'cb2ac33210773734532fca1691a0f839bf579a68043fd73cd5e9a2ba8c7f93a7',
    y: 'bcc9ec6624482b3c8cfc4ded24692b6b2baff4b7e75e99b880f57fb8765c7d7d',
    witnessAddress: '3a72f2c9d6fe4453682adb74677b87f202501073',
    witnessGamma:
      'd7b2ce9aad7f47f479e9ec9bb286fc6a505d3b697022395676f8c908e385ac3c700a333fa794e80288696a3677971ed5c792a296810ccc4e03f67452d0284a5a',
    witnessHash:
      '2f37dabd99fb4840360d5c8b4570e0cc8ad11e2cd1971a751b4dbe281252b819c2e817428361341bc95ee8e45b53f941905a3eced45bf381d458db524d5f0145',
    inverseZ: 'b7f33668868d50e30ffae26e7ff29a5af24cf1f3735fc54c2e077fcbe9079392',
    signatureProof:
      'd79e09104e2991d95948fbdad9e672bca9b8f45122a20de77de5feb31da6c73d6257f6632029aa1f824543d1f2fac9930096737a5e9297a46d04e2f1e55977311c00000000000000000000000c0f53d56bce68dc724687a1c89eea793fd6778881bcc9ec6624482b3c8cfc4ded24692b6b2baff4b7e75e99b880f57fb8765c7d7d',
    createdDate: '2024-01-16T07:26:08.178299',
  },
  {
    epoch: 12,
    alpha: 'bcc9ec6624482b3c8cfc4ded24692b6b2baff4b7e75e99b880f57fb8765c7d7d',
    gamma:
      'fb5b208451eb36261af9d491d6f25956874b129278af9ddf1226b8186ee5a8ab3fb958a45149e18134b7e50e0ae6873996b63f4db11f551c486258c7c4ff3dff',
    c: 'd5dc069830ce5d5d4c02e232f5ed6a961ecd7fd88c72ec2e4bb03c1a0ebb9a28',
    s: '34a760e3aaac7fdaf427f9e5f320942091b08d8bfab2cf2d6e2b31b7aa67da4a',
    y: 'aa49e27b4acc14fe62e921dd76aabf36f9c7ddb00033def010ffb0eef7de98a3',
    witnessAddress: '07bc7d9528d6ad27fafedcecd85b104ee2f2eab6',
    witnessGamma:
      'd94c72e4e8d99c17e938a9313823a3744c53836038b08049de74b14ed5607e363e0c2c909ac3214dbb991d42f454e7cbff5772f2f447159b82a1758fdb453683',
    witnessHash:
      'f6b6c6eeb956951f05cee58ae07c5903dbfbfae26290d1967bb7ebdb0398500de8477b39208b97e91c2e734b3877bee7f6bdd359b9800769e8cd1e20d9893fa8',
    inverseZ: 'bea140a5fe885b18813bc1b9cf41ca88968b6ca130e10fcf6dda1d01d09f0f7a',
    signatureProof:
      '612bfceaf418d2b50e5c08d3ed7f0316502e1c307cf5fa73195ac6e0813f619f53f777decc45e2870799ad2912d86f383224a86098f8901d83246ef64958e95c1b00000000000000000000000d0f53d56bce68dc724687a1c89eea793fd6778881aa49e27b4acc14fe62e921dd76aabf36f9c7ddb00033def010ffb0eef7de98a3',
    createdDate: '2024-01-16T07:26:08.244137',
  },
];

const toEcvrfProof = (e: any) => {
  return <any>{
    pk: [`0x${pk.substring(2, 66)}`, `0x${pk.substring(66, 130)}`] as [string, string],
    gamma: [`0x${e.gamma.substring(0, 64)}`, `0x${e.gamma.substring(64, 128)}`] as [string, string],
    alpha: `0x${e.alpha}`,
    c: `0x${e.c}`,
    s: `0x${e.s}`,
    y: `0x${e.y}`,
    uWitness: `0x${e.witnessAddress}`,
    cGammaWitness: [`0x${e.witnessGamma.substring(0, 64)}`, `0x${e.witnessGamma.substring(64, 128)}`] as [
      string,
      string,
    ],
    sHashWitness: [`0x${e.witnessHash.substring(0, 64)}`, `0x${e.witnessHash.substring(64, 128)}`] as [string, string],
    zInv: `0x${e.inverseZ}`,
  };
};

const toPackedProof = (e: any) => {
  return `0x${[
    pk.substring(2, 130),
    e.gamma,
    e.c,
    e.s,
    e.alpha,
    e.witnessAddress,
    e.witnessGamma,
    e.witnessHash,
    e.inverseZ,
  ].join('')}`;
};

describe('OrandProviderV2', function () {
  it('orand-v2 must be deployed correctly', async () => {
    [deployerSigner, somebody] = await hre.ethers.getSigners();
    deployer = Deployer.getInstance(hre).connect(deployerSigner);
    // 0x0c615654ff38f4fcee71dc2e8cb6715b9ce1d90d
    let correspondingAddress = getAddress(`0x${keccak256(`0x${pk.substring(2, 130)}`).substring(26, 66)}`);
    console.log(`\tCorresponding address: ${correspondingAddress}`);
    orandECVRFV2 = <OrandECVRFV2>await deployer.contractDeploy('OrandV2/OrandECVRFV2', []);
    oradnEVDSAV2 = await deployer.contractDeploy<OrandECDSAV2>('OrandV2/OrandECDSAV2', [], correspondingAddress);
  });

  it('should able to verify ECDSA proof', async () => {
    const [signer, receiverNonce, receiverAddress, y] = await oradnEVDSAV2.checkProofSigner(
      `0x${epochs[0].signatureProof}`,
    );
    let correspondingAddress = getAddress(`0x${keccak256(`0x${pk.substring(2, 130)}`).substring(26, 66)}`);
    console.log({
      signer,
      receiverNonce,
      receiverAddress,
      y,
    });
    expect(signer.toLowerCase()).to.eq(correspondingAddress.toLowerCase());
  });

  it('should able to verify ECDSA proof', async () => {
    for (let i = 0; i < epochs.length; i += 1) {
      const { pk, alpha, gamma, s, c, cGammaWitness, sHashWitness, zInv, y, uWitness } = toEcvrfProof(epochs[i]);
      const result = await orandECVRFV2.verifyECVRFProof(
        pk,
        gamma,
        c,
        s,
        alpha,
        uWitness,
        cGammaWitness,
        sHashWitness,
        zInv,
      );
      expect(BigInt(y)).to.eq(result);
      console.log(
        '\tGas cost:',
        await orandECVRFV2.verifyECVRFProof.estimateGas(
          pk,
          gamma,
          c,
          s,
          alpha,
          uWitness,
          cGammaWitness,
          sHashWitness,
          zInv,
        ),
      );
    }
  });
});
