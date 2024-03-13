import hre from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { DiceGame, OracleV1, OrandECVRFV2, OrandProviderV2 } from '../typechain-types';
import { Deployer } from '../helpers';
import { getAddress, keccak256 } from 'ethers';

let deployerSigner: SignerWithAddress;
let orandECVRFV2: OrandECVRFV2;
let orandProviderV2: OrandProviderV2;
let oracleV1: OracleV1;
let deployer: Deployer;
let somebody: SignerWithAddress;
let diceGame: DiceGame;

const pk =
  '042296393f4c4bfde812a53ed8bfa841c6251e9891fb0def611331b716a935ec91ad75abb573aada6599df5d3b34fa26853d9f5d89691aef7b811b8463c1561d5a';
const receiver = getAddress('0x0f53d56bce68dc724687a1c89eea793fd6778881');
const epochs = [
  {
    epoch: 19,
    alpha: 'b95e4e0540b2d20e8b8cdafd7268d030fcbc268f958bdb50f5512c909d233c21',
    gamma:
      '3b6bd7faafb18a648896e5cc4369a57efc65a8421105d406808a69bdca1784f732a22c6b9b18021a3f025f743e90e123a800822939cc55c7ee4f6217a4999914',
    c: '095c561352a88bb7b6a0d91f45e604c9a5e45e8b660e93d3244539a8e0ca0533',
    s: '1f94c308047b5a8764e184fe87747b30c0920658dcf6602a9c19b63702322669',
    y: 'c18406b8d7b43cc6d62edee0bfb927a83b5b20e885e9e1a3cd2b5afb880ae995',
    witnessAddress: '7308c25bf3f00f2d604617eb9f5f413b00bad13f',
    witnessGamma:
      'a951972010e105c81899e76d6272aece51cb0cc4d34d406e11f868d9c866b2f7ab80b5d2f1a2a4e0432d316bceffd5dbfbf6ba921fdfa32157f8bcf53631cfa5',
    witnessHash:
      '1c3ecf336546cb611668984b009a1c0a4c978dd6984101c035fb361053e4b1bcb3117478075fe760a35caf96468ce5cd8a4caaefcbc23c89e2a76e61d6b47b89',
    inverseZ: '7db377f008f751c5490c16daa74bd8d88a5177ec8e786a4be3c4eff6cebcc594',
    signatureProof:
      '67e84bdc10b305f917b0e524a2cb68c733ce35193a122a594c0a2dc6e7a8f0337e69e7b0211743ef0c9060a5e7e08ad2ab3c8650d5bc888afbd6af78f1f03d4f1c0000000000000000000000130f53d56bce68dc724687a1c89eea793fd677888153bdc955191939e27573c45f82696dd3bf09251f99f07c69711d2995bcba5fe2',
    createdDate: '2024-01-20T04:50:19.152396',
  },
  {
    epoch: 18,
    alpha: '32158c18e22c92bc2439731d16bf3372b250b4e7e50744af33fabc87946dc30d',
    gamma:
      '0505c824356a8d4eb84613456970d9d422a77b024c5560ee2f71b45f002a78f25334a159cbddce67cb3a5de5f779f9ece7ff9dcb1a1579b2c2f9d5a0347a72fe',
    c: '31931fc8c10d0608e6d2f54bacaed246fbb4b20dd3b0d32bb4b968094f23cb59',
    s: 'a23e196becbfe0ecc1c9013ef6b738eb6fde773f59e24a2ef711757424b6d4af',
    y: 'b95e4e0540b2d20e8b8cdafd7268d030fcbc268f958bdb50f5512c909d233c21',
    witnessAddress: '63a59a2e40d883dabdfb2cbcd28b5e73b3293e79',
    witnessGamma:
      'c29ab488f2c30b3d0397228a6a2dadc8727509b5ff6b57a16d551953d2e032543f9f7a03c1d98b2ed13652bf1bdf70354b88f52c9b8d89bd435d582c8cc3f0b5',
    witnessHash:
      '101e836a185f5cf49567d1a076e1d48ba165625d7dd2a2605fa52095a3fb1bb878558d70a2c61a286aa6263d7cd4609ba9391e0759448f886f9b9f7bb0da8bf7',
    inverseZ: 'eb48693e51d0387f5c5521fe91b40a341543094736577aa10377a005bfa9d4d2',
    signatureProof:
      'a2de271f0d67b449453d79b9b3b4187738f5adba0a0f2393dbabd00de7aa0316156cd01b15f5edd685050f7ebb900e6f333a128f9e67a17421ec9dec7b6b2eea1c0000000000000000000000120f53d56bce68dc724687a1c89eea793fd6778881e41ca7fb38b841778c9d181449aeaf854daa620da14fe52c97f092f2811d3f3f',
    createdDate: '2024-01-20T04:50:18.649624',
  },
  {
    epoch: 17,
    alpha: '6b5bd2ef75516ff55ca9dffc0422c44e3b1bfa8ed09bd9e651c2698e3fb65d12',
    gamma:
      '703b0038f08ad1cbf35b6284940f2a49305006c12a2b51dc73850ab25dbc349d576bc280be3f5cfd7964289006e98061ba352b570f22e0f50a5744c4b6f124e3',
    c: '13b480cf08a909114b608dd366beb378898f70081da4712095d261ee7f49f0cd',
    s: '5ab5b99a50b40c97b390e3508d8bb0da66ab640dff96c878011ffd755f07f687',
    y: '32158c18e22c92bc2439731d16bf3372b250b4e7e50744af33fabc87946dc30d',
    witnessAddress: '1ec97d38ed92ba1cdf59e3d6181b998ea6f702d5',
    witnessGamma:
      '76afa51e7daa51d4c6a2224e9a6e8fe03be81aa80dc5f5507be526dd5149a7db97cc68b65bcda1567a4b6ae1285315ecd461c2700f0d5062a8df6ba7ffca04b7',
    witnessHash:
      '42c81cc0ddd97b405969fee2ad2ddc422f6ec77667779b68689a75dc305a89e32928c2b543c83218b0680a0f034ec198695236870a101c989fb023e076139891',
    inverseZ: 'ef45358ff36efde05b2f51f08b0ee4a03605119ac9ef81124751f92105856c04',
    signatureProof:
      'b1260f925784ffd3a1f950f010926dcd735b52d6093ce430e847ee1626faeac2565548af39e6a86738dfea1bb5d35948b6151b8cc4da731710b5f09866362a171c0000000000000000000000110f53d56bce68dc724687a1c89eea793fd6778881cbc283083ec93a3b7848416a1c03b53c268a50f64bdd493fe798658bb1883f86',
    createdDate: '2024-01-20T04:50:18.173859',
  },
  {
    epoch: 16,
    alpha: 'a4df1652869246da937abee478cf3e52ff268dcb70090ca76787ff85a621af77',
    gamma:
      '4f2a87800137019b7caacf66fe71150f6a5f36475fc1caec43fab941098672fea2ed9f5a99125d5a5a0ae6c76bfd62401e3d2e6c3600262eb82f80cfc8c85649',
    c: '0eb5aae2796c7efce3e614d59656056318381fa2e512617bb204367087b4311c',
    s: '3949ed40a8b33753b28ae17b4538049b8d8f033bf5547296312effe97b5c8fde',
    y: '6b5bd2ef75516ff55ca9dffc0422c44e3b1bfa8ed09bd9e651c2698e3fb65d12',
    witnessAddress: '41538a369d956246a4b92be86145e40c8f502ac0',
    witnessGamma:
      'ac0d22d49f8ce3e1b11394f5f372030ccebb004a9f688d874e3f9e4de2cd5b46ab0b058ea6872b76e887fdd6d1c711803162ea91569e815f3ce717abfc69e71b',
    witnessHash:
      '022d64c3d04f33f8285bb446b18b706d1f269b6de623beeb7cfc3cd2bb2287ebbbb7e182e010e07cbc25e67d159666c9696103587ce2d2f544af0d24f5b52b81',
    inverseZ: '9f8a549ac8e13d36d98546233a78875c3065fd10862257ba892bed0d4246c481',
    signatureProof:
      'cbc79d319cc7f404793edac7f4fe34afbbd587f9353e28f5c74aef1974c75fe5701364a326f5110bfb7c4fca23b63abec6a0357fd690d5490558a71be19f7fe31c0000000000000000000000100f53d56bce68dc724687a1c89eea793fd67788812d809a96fdffb1e8fc188a366ef106a1b56f05d6d0d34e5a634c9b4162c4d98f',
    createdDate: '2024-01-20T04:50:17.673685',
  },
  {
    epoch: 15,
    alpha: '54ed87a7acefe0e75a4fc9a6ee926d0fe5ebd33a947414d9ed2446681ce5044e',
    gamma:
      'ea7acb7717a974a590ce7d515d04ea257aedd78cf82d5f4151e2014a6451bdc31a7e61bd954373ddcd590dfd478abc4d02c9aeba58405eeef60478b0cfc6a905',
    c: '74e8d96fd417e61f2b57de84540013452fa72afa2ba2cd4c23634f67b7743254',
    s: '3851214c882aa3712dc1d52557f276cae73542dddebdf0fe94d536c21ef3126f',
    y: 'a4df1652869246da937abee478cf3e52ff268dcb70090ca76787ff85a621af77',
    witnessAddress: '28b6b2dfb481b1f1b6b69aa698cc92ce6b0cc18e',
    witnessGamma:
      'd9a4e655a7d5111690bada28b83746db4c3a4e750a213932294cbbde6be0f73e05c031769055aa21cb9f3368402ec3a06dbc270d273ca0fee0222847286d68af',
    witnessHash:
      '941928f16271159f78c8d166cc36e7b61fa39dc14a6592113427ff2287b4eb99715c7564281e1824c80ed47eae39556d213787def65a4312cd00e8b05ac3673f',
    inverseZ: '280b69192e3417cc9665fa45f4537ec277081ec736226ce4857618a3b4e635ec',
    signatureProof:
      '95a46b61eb95b5ffefc8f5499176d1f9dedcebd2d113bdac34e97c47de94c3d502386167e2ab5b31fdb13a6d2028ecd99ae240fcf12f6a22a49ff8bcbb981aa41c00000000000000000000000f0f53d56bce68dc724687a1c89eea793fd6778881bce1d0a95a40da99f03257357017100474984495aeb7f09a0954687fcf07df73',
    createdDate: '2024-01-20T04:50:17.198344',
  },
  {
    epoch: 14,
    alpha: '0392f3cf305eb5ff7af32102f526e10793750dbc658b03d88654980a557dfb63',
    gamma:
      '78211ec7e18d4361721c4e7a1e07b073aa3d1f3177f05153147c1e3e2ceba0bbacba76351de2b0c342b15cb2bb9c57ece7dc9f4a2224f96d7810e794f8da9691',
    c: '9868cb596f5e7b221a50f6027d570db25f11e13408f700d29de841bdd85e81b7',
    s: '728afe24780502dc08e25cb95f294949cd2c170b0c1b9e873dd64f04fef8ea68',
    y: '54ed87a7acefe0e75a4fc9a6ee926d0fe5ebd33a947414d9ed2446681ce5044e',
    witnessAddress: '3ebe501e08ae850bcd6ffcf6fbbdbc3c9d80c31c',
    witnessGamma:
      'b3b7cfe461f1343800ea0c707aeffaa79b6e38261fc867976b75acceb69be8db7764215e357977272e89821e0740fdc4c69f5c33bbbe773ac1e00445d155b5ab',
    witnessHash:
      '0da34a52ceb4dd333132999c9548516d30a668a790fa37407e08467b6e6b79c4ad9e17fc8b59c2e14b8f345cb8c79a6f88cfadefc97e93ec3046a9713c6d939a',
    inverseZ: '36746579424de05fde6107d5130c8ca0a7d0412b9529217268bc6a4044b472ff',
    signatureProof:
      '4a17e2fc36208e50b18b8fe142d3287d5d3ac9f7ae5d1189ac06f7843bfe6e04188e3860fb7033119d16abd3e133ab64dfd9771c21432cf683154b5467568cd71b00000000000000000000000e0f53d56bce68dc724687a1c89eea793fd677888141ac48ca42c955fc5744c3ad7629c8d179134d524e653736045ffab6e6368d67',
    createdDate: '2024-01-20T04:50:16.702733',
  },
  {
    epoch: 13,
    alpha: '0b51c9418ad11876925698343c1014f894bf014c810235b65a6549c08110d7bd',
    gamma:
      'f32e9709a0a8f05183aed96e01522498c84d6beb4deab9f623a6d62de79c9ef22755a3b5f02af3afdacda21e8975139408d02efaa47d8eba5d1487f4c0880825',
    c: '1bc0a0b005bce24a3ccd36a12d862b264c5b76c89bd77680647d9792f1ed66bf',
    s: '9c2562fff16cc39e77af31291f060bf7118ce1466bc0c4294da937eee1eb0227',
    y: '0392f3cf305eb5ff7af32102f526e10793750dbc658b03d88654980a557dfb63',
    witnessAddress: 'fdb03dc833697e79463369ce2f38d164808efb2d',
    witnessGamma:
      'cb93072acbc69b57c4d1b83a8c004f0d2c0c200dcbec35481e9fa151f97daba9c69e92c24073d3984e29c5909a14f91605d55855678fd0ab27400ed2cc51a547',
    witnessHash:
      '79be8f0a9184a2c4a9a0a261ba1855a0c3d44dff6d756dfa86f66a13cf9e5c60cbf792575574040b22a1e3e7d05fe39f93dd76330e0b2602f4c2380084512bdf',
    inverseZ: 'f174bdd378b3d350420ebd07b6ebc3a2e8f188982408a4223db9e91441bdb68e',
    signatureProof:
      '124ab23c09deb004690a4b338cf6c53396b33d27da8d835cfd35a52967a975e5329dcfcfde76daae5e00641cc6c6daa01da962101c2e22bb8cca43005e2002bc1c00000000000000000000000d0f53d56bce68dc724687a1c89eea793fd67788811f936715e94f71d94a49a59c6fcb743408e5fe66f6f16d68ac49c3ba5e7691c2',
    createdDate: '2024-01-20T04:50:16.148023',
  },
  {
    epoch: 12,
    alpha: '78115caeef6969eba006f4ffea1d1f74c8f1e729d2bb442bf2e9bfe6d75c37c3',
    gamma:
      '55d065dfd52e7ca879affa034b7e9a3a39056c7afa1734b0e714f512509620930f1cec46aeea811e7bcf963a7cad78b26a9386c5880e7c07a0a81e8c1c229988',
    c: '15a7b150a1f4c77e77c692556dd11eed3e99ae79beead8860bc74d8786aae3f4',
    s: 'd527a43e7730b148a106b4208ff4bab3569561a14c0fe5cdc1c601e5362be157',
    y: '0b51c9418ad11876925698343c1014f894bf014c810235b65a6549c08110d7bd',
    witnessAddress: 'f924e9fb066bfd5de50a72d6fc0fd513f7509d04',
    witnessGamma:
      '26f1ede68da418357af800b996387df406f0ac5b310a2bf26d25900e3b7e6ba9da289ffb57b18e6bc875c8b31c072f3b9acc5906e8aa311f71c0093612648c8b',
    witnessHash:
      '26bcfedec254cf67bb51b573e72d6693fd230ecd3f559e3e7b8be7dfcda09c49f1579cba6b31fa5a34b4604f6b477b065bd1854832a22f4346ba4c74bf961ec2',
    inverseZ: 'ca17fc7ea2497294ba290f3b897185a42d9b21be037ab6f9e575621b0d9e16c1',
    signatureProof:
      '7cec57a8e5e3589ad800ae28bfb42fcf64a4d27d85fc927f76b9e3c8c1e06c2960d7fe45f1e6a88d33bea2500a57453384cde280841ab8e21cff66f2f9cfa0031b00000000000000000000000c0f53d56bce68dc724687a1c89eea793fd67788816b5012b6ef38d4cf5a1ce276bee23f4d5de2a459c04f624809497a2d5322633c',
    createdDate: '2024-01-20T04:50:15.311749',
  },
  {
    epoch: 11,
    alpha: '26b4a8692e4e286d42ae9ccafb309bda8d2884cd09044facb26482261de5b12e',
    gamma:
      '8904ef08ab464b78b36a1950ef2fb023ab99f18731f1ee12c51fc1a12f796fab5190804d602bcfd370739c1385b6fc58aed78333251b0d3a852a728742deb274',
    c: '517400c442b9f070adae630ffe6b5d4b7ee255debe9fa50c34760b68263f18e6',
    s: 'bb05ab7e024e34f7872ecb93fe7debefaa869854cbddb9d27499c96766527f0f',
    y: '78115caeef6969eba006f4ffea1d1f74c8f1e729d2bb442bf2e9bfe6d75c37c3',
    witnessAddress: '7cfea451a87665915fdc41ada4eb3381147450e6',
    witnessGamma:
      '2707374545c74de863cf1127d2a389d178ce9fd3ed57d9acf7fcc1351ef2713ed296651ca0e6019b80a144273c32bc33ae7fc69175aa09ec89890a2d79881201',
    witnessHash:
      'a99c59e34e46715bf273c9ec1229f5bf0f5c141ba2c726b55d4d9cbc122cec6cc177c6912c420dff1c7bad3c679927b0d54e0344e692785cc489f93d7e23a329',
    inverseZ: '44bf5b8142185fa3e2b8c268b7b8caee2339a463714338a7351599ae3c875d08',
    signatureProof:
      'c5ba818c36489ff17b43459a332b52ea78b7de639a0e9daa7a4388970be1a12e01571a34daf457b30af7a25d65f61a1b4ae5a8656209572ee07eb655d4f4a95e1c00000000000000000000000b0f53d56bce68dc724687a1c89eea793fd67788814268e2884db22925ef1ff251825158c553f6989e2953d4a2202e2c52a1e3788d',
    createdDate: '2024-01-20T04:50:13.258150',
  },
  {
    epoch: 10,
    alpha: '3007ce679a2bda82e0015685268be0ab36453c54be02ced0f7fff0d7f9bddf33',
    gamma:
      'abcc4ca74f80bc55b8fac825e231b8a2b2739356fa6d8635e5044bea50da73e14ee63c86795a9a3f36f992bcbf5f74363f726b19f6afdecfe9460253a1e7cec3',
    c: '5102d57739fce2177c14a3cf9c1d22b1c6de13746783213bc4d5c6a7fd8d6068',
    s: 'caba98d78838235e7685744005b056dcd1cde84e3e81ac58175680967a26faf3',
    y: '26b4a8692e4e286d42ae9ccafb309bda8d2884cd09044facb26482261de5b12e',
    witnessAddress: '5116080b5ba7ef8fc7c6301577745e684c067e56',
    witnessGamma:
      'd9834871cd9e8d5c263c08ee4bd3b996f45f19b35702ee43517449ecc61769e6edfd9dcc35817d26e63c5544fe9dc5c5df5c4451f5b5804e9c639580629ac41f',
    witnessHash:
      '34f5f5939690316e03dd15887f7fdcaf20b1ae5978804403c788508bd9d1316b42780f2522671a4185c6dd6c996c54d8072e47c90bb2f972b2c96171dd2196ce',
    inverseZ: '44a2a64edd0df9516ba47da17cd8517123d76e10dedc4212124188671570a021',
    signatureProof:
      '9fbaadf46c54df5a3cf171af5d6dc9c7cabc95f156031dc8548f1b5cc6fcef5a304ca9c13094dc651efadbe53326323206e5f93253d742165f1d45f6bea330151b00000000000000000000000a0f53d56bce68dc724687a1c89eea793fd6778881231dae5dcd66c8f8aded9f5fdee0aa29986288725603079db7055966ba651691',
    createdDate: '2024-01-20T04:50:12.304310',
  },
  {
    epoch: 9,
    alpha: 'd46a502f3e61bcfd71b8ffffbd914eb27937eddb14109616c9d1b50a7841225c',
    gamma:
      '99965dbe9db5e7eb385797dbe0b46275bf28075e24a0bcf849d86bb00fd7ceb7b8b4c0278c5898601d2c4acd2bae063d822a1f689959113f16965386c7cd6d16',
    c: 'a5908971b363e12ff6f9be2e3b2eeae558194a3ce061a12fdd7a31988adba879',
    s: '312137f32fd12e8f9dc715f80a47245276250e40e5aa908cec7d58223880d734',
    y: '3007ce679a2bda82e0015685268be0ab36453c54be02ced0f7fff0d7f9bddf33',
    witnessAddress: '7ccf576d01006a38cdf6fd1ee56dfec19b05be3a',
    witnessGamma:
      '6103c2a3a188736b09e073ed828e509609a106a91ce9de1975535da3a16e9f9a397c9fdb66c89ecc7e11fd63fbf8bd0e7add625a4ad6b7be240e50c37f5fa08c',
    witnessHash:
      '45897a0266fdf037cd10816c7ff519bbc91643f54e1b429c16c96b6793ed37418228392e92265592bb7d1ddbb5cdc57dbfbf8e2335c2bf73eec4fb5f4229b0ad',
    inverseZ: 'd733ec753423910fc0c1eab0f6db2150fc01ef69562db958e2c704d867ba8fbd',
    signatureProof:
      '660a4dff614e02a5a85b00a2dfed3915776f878fd06a5f2fa929b25de18d02557c54cac1f02490eead71dc97803c4fa5288568515e4a89a1e93e042c6ba4055a1c0000000000000000000000090f53d56bce68dc724687a1c89eea793fd677888121d6e266a7a710bb012095980c40f5ae49e9c8465666c0aec0017f33b53c1302',
    createdDate: '2024-01-20T04:50:10.037432',
  },
  {
    epoch: 8,
    alpha: 'dfb3c0bc8dbbca4874585993236c497aafd8f0b3e09e0e23c9fd61401e290ec9',
    gamma:
      'd9141661522ae36c7e6ab3ade3e41cd067a9c0d7e29f46eab656ad51c316a15d7f89e45d05c0085f4a73db287a694d58082c7cd08483287dd916982206e87c2d',
    c: 'd458bc03b919d362e8cc3a3b6857c7d56655118d82825b1f2a4677edaa83b323',
    s: '81ff3b849e477e0190504eded68da0610a146329351865716bba775a651aa7c3',
    y: 'd46a502f3e61bcfd71b8ffffbd914eb27937eddb14109616c9d1b50a7841225c',
    witnessAddress: 'ed55bd027c41fea5d71d4312e6562e9aab046a55',
    witnessGamma:
      'cc4556ff3efedd45bc0eeef2b2d92436d4abab39a202af7d81eee5033296670d6facb2f07a57be68aba5e3886065bf65ad4ae00703d68afe4ac8524538128389',
    witnessHash:
      '4ed1b367f3d4cf053e281658520cff94397b004dd4d7ff369d1efddf84d899a9fe27788d206a98020f8368f74f7b13bddcc24feb4bb983a3244540591cbd888c',
    inverseZ: 'd805e2e9902ca88ae23ffd6513664501078e461dc824ba4943cf1cd1fb415544',
    signatureProof:
      '95937ba88f32f6e03ccfc917578ab14f736a2a4fbdc8b012fd7d1993bd46517c13a044263c17ec004a0f1ba9e9ec5993b33481f2cd8a056d4ca2e97236f36a0d1c0000000000000000000000080f53d56bce68dc724687a1c89eea793fd67788816cdcee157f476d762d7ab263290fb13009a15918e1a19e1a9fa8302a3c240de8',
    createdDate: '2024-01-20T04:50:09.618168',
  },
  {
    epoch: 7,
    alpha: 'd720b9ac0ac80229a06389c21f4d4ee0684fe4dc027233a5709a65bb0c93e5a8',
    gamma:
      '4e754611a0b968e569d5246683f965c772f252d50d64615ae002d75f164d9c0ca525f49996e811414cb4a7827627df6b26e3abb1d490d07999d5546f72ffd5d1',
    c: '9f3f3fd08f2fce1b784fa4a3a8a17a38223636ed45153b450e0d81c76aed4b91',
    s: 'e14a8c98657c8f47c409f86e82db9d34024a26cb3147461d978435df301e5f1e',
    y: 'dfb3c0bc8dbbca4874585993236c497aafd8f0b3e09e0e23c9fd61401e290ec9',
    witnessAddress: '970ce0147fa00117b61aad044b57831a76a405c0',
    witnessGamma:
      'c99373252fdc175f3bdd8458f03a5c2602aa3a5d940a5fdae990779c298824fb7da9c9f2c0a3c16b7ccb88b96958ded7e36a23c2850f147ef43fb433969b38ff',
    witnessHash:
      'a1300e408b5d7e56c5292634c950010c3e1e939330efffb228a5ddb19a914c05551968f7ec6b8a8111c1e4c1dd67da489967e5f74d247cce616c3b96dea12a3d',
    inverseZ: '5236bb923590a0628872ac479ba4fde3d02a1d33dae6f11a7cf5c4b60a4de4b9',
    signatureProof:
      '4597a34d8ab442778b8e201fbdd2a9c864f1e58b2811486712666ad75c6c4044334e5a19c98a9f7b0b47e43803d339e8a76c6240332fb85ade84f0ab8e2579311c0000000000000000000000070f53d56bce68dc724687a1c89eea793fd6778881e3a1306644677a6be62940e0656e6f58c27e2706e49bf0368ab9d6a529e4b7eb',
    createdDate: '2024-01-20T04:50:09.175402',
  },
  {
    epoch: 6,
    alpha: '9a0ab68f53a8f67968b1676167ef3d39ec36c76446d15afd2f2f890867de3ffb',
    gamma:
      'f3e54c5fcf6ddc5479d94f6f37f60888f56f9a0c4e096eb971bcace1ad69a87895cc05225d2ab08b731eb1e83ad00111fa8c96210cdfcc0724d78d5ed987f56c',
    c: '13b2fa67d0e9c08954009869f59aef558d9fd77065079fab4de61f085df77b55',
    s: 'c80047cecbae7380923a99e2a21e212daea3b9f9bea0f084f9fdb1992447a5f7',
    y: 'd720b9ac0ac80229a06389c21f4d4ee0684fe4dc027233a5709a65bb0c93e5a8',
    witnessAddress: 'd0bfa017bc1538b044160681def6f513091a1e7f',
    witnessGamma:
      '3bf50a7e4b75d6d1fcfb8a43721be9e94b8c4e8a56ebd10dbc3c0c8b7d066316f030433ecc88a58465cfab0e29aefa2c29298848066f92bf0286551b7df63ff2',
    witnessHash:
      'ebfba78270748466048fab01a3df7b30182ef9260d840f72c06a7281bc3c8021089f0de30e65a202aa5d2164b9ea816f87609e8d4f1403c11e2757e85d0e62e2',
    inverseZ: '491b7d642b81cb832f31ccdfdb810c8f4f694cdab5b32fead98a3ebbf33297e5',
    signatureProof:
      'f2f4a049053740dff053ae05a57c9a0a4756f9573e23f489c229c13ee3b098337807dc499fbbf3a541f1796abfb3c93582a6a0f42da9bfe35df8440e7b339c301c0000000000000000000000060f53d56bce68dc724687a1c89eea793fd67788815e3f8ed68f8a2d9e977971ceabae30d86b0f3ef7af8d3767a6d018250e91f325',
    createdDate: '2024-01-20T04:50:08.566571',
  },
  {
    epoch: 5,
    alpha: '74fad03a45dd5efbe3553f9f089ae004206e2adc175efd8adb8c0a617cc0b460',
    gamma:
      '977c68108b7b917727c3af6708a80a6fec8a6b97fac63f0f96069c8800d6eeb6addd2d5f86556082ad02df225e159716af060b553a58a5fae7b3cded19b0a47f',
    c: '53dfb99d6752fee71e256cbf6618a8e56be9cfee6c92e3cdc23c9691ff527427',
    s: 'e67c13358b8004cf753a5841be3947837fa19429b715333760d4688ed1b38ed3',
    y: '9a0ab68f53a8f67968b1676167ef3d39ec36c76446d15afd2f2f890867de3ffb',
    witnessAddress: 'c36f6f84a2a99bfa0c5211199228b671e4245132',
    witnessGamma:
      '9ded583453ebb0ac26e303f398e7fa7eb362d1003a8e8c7e75ddb89f74316b32242e9f809d5abcb43726704520b43af42d95a8a8f06e79650b3be2c1cef734c7',
    witnessHash:
      '6ef901bed6ecf6e1c42899c0629bad1a52f485831edb26fb604923ec5cd3cf37c75a62144406ad2a1680b62d7654de404112b35085a6b423d20388d6e9127a7d',
    inverseZ: 'a08d12e802d397b2bb86c90f8de3b7a9ed002b665a7af4b0549b33ba756bb099',
    signatureProof:
      'fc31104f33cf66f2c2f961db88c0ed5d96cc088fbb9fec35520e0776b0b609015fd9bbf460684693d1e9c7633991d1480ccca8531cd80f769fe067c6c150a7031b0000000000000000000000050f53d56bce68dc724687a1c89eea793fd6778881ffbdaa8032ef2def70f08391eb5c306d20c2481eb424b4345337ccbdb4d9af27',
    createdDate: '2024-01-20T04:50:07.911099',
  },
  {
    epoch: 4,
    alpha: '784df929d2f3683e9d1cad6a08b59c2fadcb895a966cc36e7b18ef309ce0840d',
    gamma:
      'bc56e3ad45f46a88eb878e4ab87039edabc51a6ae74a7c1bcdb45b6b6834ad210f39cbb4485229d173da3868182511783ada9e9f015d99125bac740c5dd35ed7',
    c: '3b8fe6c8f01b93aa9204ba7a8f5b07b69b502cd28091f34b04df97c3825a3765',
    s: '7bf2630177def1e1824eb8c6743921ca4e5bd32621eda7bb3fa1af24f9ebbcee',
    y: '74fad03a45dd5efbe3553f9f089ae004206e2adc175efd8adb8c0a617cc0b460',
    witnessAddress: 'b03376abbeb054617b582a3fb48d5419ee935767',
    witnessGamma:
      '6ca35a8d7b221ebcebfc49dd032eeea1ead957a2329ca2d508935834aa3b03b9a31477b5ac4c1f6a5c670cc0e3c06cdafe41be99cad3d82b09b1ab2fe796a7b1',
    witnessHash:
      '8967e3d63be9869278a6557174b4c523f5bc0d7e72a83b1990073f4fda54b7a4a30020690988aa591850601d01be3eddb0e4b5b15f09839f556188c38503c1fc',
    inverseZ: '35e9925befec0d4daf12202a7bd91141693a75d56b6c0eba2409c72d4f0d1c1a',
    signatureProof:
      'bde1bd713ef9d90120bae25fa326bf25bab170c3b27875f829ac4699b93d506b038e345cd6708d3a1ce57f1801709d19856c0f511e558186988955b4bd7e37561b0000000000000000000000040f53d56bce68dc724687a1c89eea793fd6778881a72a106d121ab56e2f6a38abc8bfa1466ab8e21bdd79d2fb39e1c3ac85ee4e2c',
    createdDate: '2024-01-20T04:50:07.087664',
  },
  {
    epoch: 3,
    alpha: '88dcdb1daff87ce9ae6c85589f79c56546d0718e0a4070da4f9d95e43220ffed',
    gamma:
      '3e4fbf6acc53b587dffd3449d46a81a3725983c84104b4e27ef78aea5f799b05bfe75f6374a24bb0e8c2310ba47c45d56ad40719c06135ea9f6d3fd95ca2d9c8',
    c: 'd21cb425b1f5228c95c12e03711ddf34b1dbce8b9e21c29f96fcc87704aa3a7d',
    s: '37e468c9520bc7278e9791a94f955f10c602b4cfcc580094c4312b597934ad15',
    y: '784df929d2f3683e9d1cad6a08b59c2fadcb895a966cc36e7b18ef309ce0840d',
    witnessAddress: '467277fc2c98e8c34213570550a2d6616189f46a',
    witnessGamma:
      'cb8fb6b7959a4ad182a3395f519c1cd812ea8a78708d841c2f63873f0fccacdedc425a3fb8f9c8fabb29652b01cf13ac83f8ec219e414d5915ac785796c6c4bd',
    witnessHash:
      '7ed27ea92c89bf0dfb675118970dc64d2c04c9b701da62466049bfeebc6e4d6e838e3b069f8e4815a0102101de247e0c4eb7c95bd0a047aa495a254029961758',
    inverseZ: '976c4298e9d1a2fd3f40eb67b2b9c4fcdd074903dd33865648a9f39db2d43b6b',
    signatureProof:
      '605f5b6fd08df35ddeb9a55c9d11936eadfcc3ba6b471d6995d5c01882b0a6d27ad9c9412b4fbf98db5fe15ffe85cd1f967b5e69047d64f44383b5a4e47ba2dd1c0000000000000000000000030f53d56bce68dc724687a1c89eea793fd6778881bd8f4169279bdf687c0abe76b1e9bbe01cad67cc1c4af0493f24a458ca1fdfae',
    createdDate: '2024-01-20T04:50:06.219533',
  },
  {
    epoch: 2,
    alpha: '81fb19339027a076bf0206dfd2e037fdfd1da2ba076a3933539b3b5356dd49e1',
    gamma:
      '709af688db32c986faab94a731444387565501e2cd36a5f949e6f342cff4a6295b0f1b0d936c1277c79a217c6066290ddfa3f012245ae1736868db0266e9f372',
    c: 'd3cc64fb82a36bea3fc7695f6f2c8f3f9186488217aeb0268e325eb0e48f2162',
    s: 'e52964163883f25d217ec34196ce02a0fa8fc7f95fd46f9eb965b27ea1847715',
    y: '88dcdb1daff87ce9ae6c85589f79c56546d0718e0a4070da4f9d95e43220ffed',
    witnessAddress: '4392cb29a0032acfedf8aca784b178e7c8c7a5c5',
    witnessGamma:
      '88b472aa04e3721b665efd812ab4b6e0aef1c715be17cbc08ffdfecfcc874dcff97c22ab87519cca5cf9dfebc24df27006a945426e56af0a95d4c97b8cbdfe0c',
    witnessHash:
      'a749f321eecf89bdb6a56b49f1ffb97bf2e44bed01397e6bf8779173530957d39a9dddf7fb8156579c9918a5a4454a3d33fa55d9b89c95a3a0122dc7014159cf',
    inverseZ: 'fb416fcc9f59d346233fc7c62f2aac7aa71bcaa6d4531f96fb5b8a64863f5670',
    signatureProof:
      'affe195b256193aaabcb23f1b74022c73a4a2ed0ae5c19370a7c374247d834fe56afbc0476a6269e39bb67bcfaec3f6babd2a92b2e76972b42ca01ac7b2ab2701c0000000000000000000000020f53d56bce68dc724687a1c89eea793fd6778881a853d65d223f69294fae55a7d1c9542c7fafa1b70e980a1685cbb8e1d98e94b0',
    createdDate: '2024-01-20T04:50:05.254068',
  },
  {
    epoch: 1,
    alpha: '9a19f2fd4742c62575c7fd3b2504e8c73c5bd1211c4864b7bc07b868b1e93964',
    gamma:
      'ffe343fa3604e19e51fab83e1411293e5740eecbc8859da432f5f94de1807a0f6042300eff0af549733503f41b30a17d82ddfaa7c41f03727f5d9ecc8bb7038c',
    c: '6d70dee9520467d28a1cbb2bdea334c0575e6e94c2a5268ce1c70781badc04ea',
    s: '6f461009a7c98351f6adc937e18392529c03edc11032d1e37a68a0443b04a34f',
    y: '81fb19339027a076bf0206dfd2e037fdfd1da2ba076a3933539b3b5356dd49e1',
    witnessAddress: 'f0597ddd45b83be3cb92899d5ae990350e0f0400',
    witnessGamma:
      'a3237acc0c60533064c4a3f6c628ae1d834e5781a7807650a868a8c7925b444d7d897e0dedbc108ffa30254ca55b3c2ecbc52a1e1ac31c50b42f3ef0efabfdf2',
    witnessHash:
      '8d70a46a3b0a750539b14eb14c5e7413ae9cc4fe2b456905d400ea68afdfd81ee5acde32ea43763ee3796b89922b2603f02322a840a68c4e07f608044f4a9e2e',
    inverseZ: 'b10d8ff4041bd375dee7e7cffa307b15a4d4e55c781613364aca942d873f8b40',
    signatureProof:
      '900ec3a36d644141a9aaf540b4d5eb28e2633c63b4cf3ee6946bd32d17720b8742594e1384ef75ddf498f8798f1cdef1dac00f4eb0eabb297127201e5ff40d1e1c0000000000000000000000010f53d56bce68dc724687a1c89eea793fd6778881528e18c4a6e784b8f3a01fbb80695a781b9288518e581ab98781d7e8e9083f19',
    createdDate: '2024-01-20T04:49:59.698138',
  },
  {
    epoch: 0,
    alpha: '898e55ab774f8c2f8ee612c28c6999e77b44fed871cf55790a6dcf96646e21ae',
    gamma:
      'a633bfac2befee72c50d0f538a370c5f81cfe0ab29688aa80f078057b672a6e986cfddb45d382cd3f211a006d9a0a90c4b13e7e31a5ada06f18306ef9bf67281',
    c: '090bd72296da49c39c2c3ff438ff234b7fe14418f8bef25827ef42ce1cac8424',
    s: '66f73cd8f4fdea7ee7247801ab4ddba46a4e6d7c48e564fdb63f0178072e65f2',
    y: '9a19f2fd4742c62575c7fd3b2504e8c73c5bd1211c4864b7bc07b868b1e93964',
    witnessAddress: '8d6fe212db0f3b648b1d27d083b3c8661a12e9c8',
    witnessGamma:
      '3c7a6d7cf4333e11430e9c8d70b831e77da7e8e4efcd545b686c40cce5660860336c3a792b6398e5900dcbdc593458ff092ce1b683ec9352d4f52e2ae1944c61',
    witnessHash:
      '0ee0f5b43d98cfbbaf2932d4ef51b3a31f9e34a02a82dd9f9a4443e43add64475d8968a14a6a02da16e34613f235c0ae16744fafe06bfda9cea06c963cc3ce5b',
    inverseZ: 'd81902e23238581417462b6fd6be7bd2f8cd275d98a28452a7e958d9434805b6',
    signatureProof:
      'f47b72dc35f34f4bbe89ca1d68ca85e75cae6049a2d024a70ffdff54e57650096ef2b7c998a34e3b1b9fcc15a4e1be9542eee8af62038bb0bb9832e6500e43e11b0000000000000000000000000f53d56bce68dc724687a1c89eea793fd677888151561c96a8c412a188e85161cefdd10cfd6778bdccefe4fa9aa5870f2d0a3130',
    createdDate: '2024-01-20T04:48:39.870416',
  },
].sort((a, b) => {
  return a.epoch - b.epoch;
});

const publicKeyToNumberish = (pubkey: string): [string, string] => {
  const aff = pubkey.trim().replace(/^0x/gi, '').padStart(130, '0').substring(2, 130);
  return affineToNumberish(aff);
};

const affineToNumberish = (affine: string): [string, string] => {
  const aff = affine.trim().replace(/^0x/gi, '').padStart(128, '0');
  return [`0x${aff.substring(0, 64)}`, `0x${aff.substring(64, 128)}`];
};

const scalarToNumberish = (scala: string): string => {
  return `0x${scala.trim().replace(/^0x/gi, '').padStart(32, '0')}`;
};

const toEcvrfProof = (e: any) => {
  return <any>{
    pk: publicKeyToNumberish(pk),
    gamma: affineToNumberish(e.gamma),
    alpha: scalarToNumberish(e.alpha),
    c: scalarToNumberish(e.c),
    s: scalarToNumberish(e.s),
    y: scalarToNumberish(e.y),
    uWitness: `0x${e.witnessAddress}`,
    cGammaWitness: affineToNumberish(e.witnessGamma),
    sHashWitness: affineToNumberish(e.witnessHash),
    zInv: scalarToNumberish(e.inverseZ),
  };
};

describe('OrandProviderV2', function () {
  it('orand-v2 must be deployed correctly', async () => {
    [deployerSigner, somebody] = await hre.ethers.getSigners();
    deployer = Deployer.getInstance(hre).connect(deployerSigner);
    let correspondingAddress = getAddress(`0x${keccak256(`0x${pk.substring(2, 130)}`).substring(26, 66)}`);
    orandECVRFV2 = await deployer.contractDeploy<OrandECVRFV2>('OrandV2/OrandECVRFV2', []);
    oracleV1 = await deployer.contractDeploy<OracleV1>('OracleTest/OracleV1', [], [deployerSigner]);
    orandProviderV2 = await deployer.contractDeploy<OrandProviderV2>(
      'OrandV2/OrandProviderV2',
      [],
      publicKeyToNumberish(pk),
      correspondingAddress,
      orandECVRFV2,
      oracleV1,
      100,
    );
    diceGame = await deployer.contractDeploy<DiceGame>('examples/DiceGame', [], orandProviderV2);

    const operatorAddress = await orandProviderV2.getOperator();
    console.log(`\tCorresponding address: ${correspondingAddress}`);
    console.log('\tProvider opeartor:', operatorAddress);
    expect(correspondingAddress.toLowerCase()).to.eq('0xed6a792f694b7a52e7cf4b7f02daa41a7c92f362');
    expect(operatorAddress.toLowerCase()).to.eq('0xed6a792f694b7a52e7cf4b7f02daa41a7c92f362');
  });

  it('should not able to publish a new epoch without genesis', async () => {
    const { alpha, gamma, s, c, cGammaWitness, sHashWitness, zInv, uWitness } = toEcvrfProof(epochs[0]);
    await expect(
      orandProviderV2.publishFraudProof(`0x${epochs[0].signatureProof}`, {
        gamma,
        c,
        s,
        alpha,
        uWitness,
        cGammaWitness,
        sHashWitness,
        zInv,
      }),
    ).to.revertedWithCustomError(orandProviderV2, 'InvalidAlphaValue');
  });

  it('should able to create new gensis for receiver', async () => {
    const { alpha, gamma, s, c, cGammaWitness, sHashWitness, zInv, uWitness } = toEcvrfProof(epochs[0]);
    await expect(
      orandProviderV2.genesis(`0x${epochs[0].signatureProof}`, {
        gamma,
        c,
        s,
        alpha,
        uWitness,
        cGammaWitness,
        sHashWitness,
        zInv,
      }),
    ).to.emit(orandProviderV2, 'NewEpoch');
  });

  it('should able to publish a epoch using ECDSA proof', async () => {
    const { alpha, gamma, s, c, cGammaWitness, sHashWitness, zInv, uWitness } = toEcvrfProof(epochs[1]);
    await expect(
      orandProviderV2.publishFraudProof(`0x${epochs[1].signatureProof}`, {
        gamma,
        c,
        s,
        alpha,
        uWitness,
        cGammaWitness,
        sHashWitness,
        zInv,
      }),
    ).to.emit(orandProviderV2, 'NewEpoch');
  });

  it('should not able to publish a wrong ECDSA proof', async () => {
    const { alpha, gamma, s, c, cGammaWitness, sHashWitness, zInv, uWitness } = toEcvrfProof(epochs[2]);
    await expect(
      orandProviderV2.publishFraudProof(`0x${epochs[1].signatureProof}`, {
        gamma,
        c,
        s,
        alpha,
        uWitness,
        cGammaWitness,
        sHashWitness,
        zInv,
      }),
    ).to.revertedWithCustomError(orandProviderV2, 'InvalidECVRFProofDigest');
  });

  it('should not able to publish a wrong epoch alpha using ECDSA proof', async () => {
    const { alpha, gamma, s, c, cGammaWitness, sHashWitness, zInv, uWitness } = toEcvrfProof(epochs[11]);
    await expect(
      orandProviderV2.publishFraudProof(`0x${epochs[11].signatureProof}`, {
        gamma,
        c,
        s,
        alpha,
        uWitness,
        cGammaWitness,
        sHashWitness,
        zInv,
      }),
    ).to.revertedWithCustomError(orandProviderV2, 'InvalidAlphaValue');
  });

  it('should able to publish a chain of ECVRF proofs', async () => {
    const result = [];
    for (let i = 2; i < epochs.length - 1; i += 1) {
      const { alpha, gamma, s, c, cGammaWitness, sHashWitness, zInv, uWitness } = toEcvrfProof(epochs[i]);
      await orandProviderV2.publish(receiver, { gamma, c, s, alpha, uWitness, cGammaWitness, sHashWitness, zInv }),
        result.push({
          total: await orandProviderV2.getTotalEpoch(receiver),
          current: await orandProviderV2.getCurrentEpoch(receiver),
          result: (await orandProviderV2.getCurrentEpochResult(receiver)).toString(16),
        });
    }
    console.table(result);
  });

  it('should able to verify unlinked proof', async () => {
    const { alpha, gamma, s, c, cGammaWitness, sHashWitness, zInv, uWitness } = toEcvrfProof(epochs[5]);
    const { ecdsaProof, currentEpochNumber, isEpochLinked, isValidDualProof, currentEpochResult, verifiedEpochResult } =
      await orandProviderV2.verifyEpoch(`0x${epochs[5].signatureProof}`, {
        gamma,
        c,
        s,
        alpha,
        uWitness,
        cGammaWitness,
        sHashWitness,
        zInv,
      });
    console.log({
      ecdsaProof,
      currentEpochNumber,
      isEpochLinked,
      isValidDualProof,
      currentEpochResult,
      verifiedEpochResult,
    });
    expect(isEpochLinked).to.eq(false);
  });

  it('should able to verify proof', async () => {
    const { alpha, gamma, s, c, cGammaWitness, sHashWitness, zInv, uWitness } = toEcvrfProof(epochs[19]);
    const { ecdsaProof, currentEpochNumber, isEpochLinked, isValidDualProof, currentEpochResult, verifiedEpochResult } =
      await orandProviderV2.verifyEpoch(`0x${epochs[19].signatureProof}`, {
        gamma,
        c,
        s,
        alpha,
        uWitness,
        cGammaWitness,
        sHashWitness,
        zInv,
      });
    console.log({
      ecdsaProof,
      currentEpochNumber,
      isEpochLinked,
      isValidDualProof,
      currentEpochResult,
      verifiedEpochResult,
    });
    expect(isEpochLinked).to.eq(true);
  });

  it('should not able to publish wrong proof', async () => {
    const { alpha, gamma, c, cGammaWitness, sHashWitness, zInv, uWitness } = toEcvrfProof(epochs[19]);
    await expect(
      orandProviderV2.publish(receiver, {
        gamma,
        c,
        // Craft a malicious proof
        s: scalarToNumberish(epochs[1].s),
        alpha,
        uWitness,
        cGammaWitness,
        sHashWitness,
        zInv,
      }),
    ).to.revertedWith('addr(c*pk+s*g)!=_uWitness');
  });

  it('should not able to publish wrong alpha', async () => {
    const { alpha, gamma, c, s, cGammaWitness, sHashWitness, zInv, uWitness } = toEcvrfProof(epochs[12]);
    await expect(
      orandProviderV2.publish(receiver, { gamma, c, s, alpha, uWitness, cGammaWitness, sHashWitness, zInv }),
    ).to.revertedWithCustomError(orandProviderV2, 'InvalidAlphaValue');
  });

  it('should able to publish a linked proof', async () => {
    const { alpha, gamma, c, s, cGammaWitness, sHashWitness, zInv, uWitness } = toEcvrfProof(epochs[19]);
    await expect(
      orandProviderV2.publish(receiver, { gamma, c, s, alpha, uWitness, cGammaWitness, sHashWitness, zInv }),
    ).to.emit(orandProviderV2, 'NewEpoch');
  });

  it('anyone should able to gues result', async () => {
    for (let i = 0; i < 1500; i += 1) {
      await expect(diceGame.connect(somebody).guessingDiceNumber(Math.round(Math.random() * 5) + 1)).to.emit(
        diceGame,
        'NewGuess',
      );
    }

    console.log(await diceGame.getStateOfGame());
  });

  it('anyone should able to gues result', async () => {
    for (let i = 0; i < 1500; i += 1) {
      await expect(diceGame.connect(somebody).guessingDiceNumber(Math.round(Math.random() * 5) + 1)).to.emit(
        diceGame,
        'NewGuess',
      );
    }

    console.log(await diceGame.getStateOfGame());
  });
});
