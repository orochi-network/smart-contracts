import { readFileSync, existsSync, unlinkSync, copyFileSync, writeFileSync } from 'fs';
import { basename } from 'path';

const tsFileList = [];
const typesList = [];

function readJson(filename) {
  return JSON.parse(readFileSync(filename).toString());
}

function cp(src, dst) {
  if (existsSync(dst)) {
    unlinkSync(dst);
  }
  copyFileSync(src, dst);
}

function cpTypes(src, dst) {
  if (existsSync(dst)) {
    unlinkSync(dst);
  }
  const content = readFileSync(src).toString();
  typesList.push(dst);
  writeFileSync(
    dst,
    content
      .replace('from "../../common";', 'from "./common.js";')
      .replace('from "../../../common";', 'from "./common.js";')
      .replace('from "../../../../common";', 'from "./common.js";'),
  );
}

function cpAbi(src, dst) {
  if (existsSync(dst)) {
    unlinkSync(dst);
  }
  const { abi } = readJson(src);
  tsFileList.push(dst);
  writeFileSync(dst, `export const ${basename(dst, '.ts')} = ${JSON.stringify(abi, null, '  ')};`);
}

cp('../typechain-types/common.ts', './src/common.ts');
cp('../contracts/orand-v2/interfaces/IOrandConsumerV2.sol', './IOrandConsumerV2.sol');
cp('../contracts/orocle-v1/interfaces/IOrocleAggregatorV1.sol', './IOrocleAggregatorV1.sol');

cp('../contracts/orand-v3/interfaces/IOrandConsumerV3.sol', './IOrandConsumerV3.sol');
cp('../contracts/orocle-v2/interfaces/IOrocleAggregatorV2.sol', './IOrocleAggregatorV2.sol');

cp('../contracts/multi-send/interfaces/IMultiSend.sol', './IMultiSend.sol');
cp('../contracts/game-contract/interfaces/IGameContract.sol', './IGameContract.sol');
cp('../contracts/game-contract/interfaces/IGameContractFactory.sol', './IGameContractFactory.sol');


cpAbi('../artifacts/contracts/orosign/OrosignMasterV1.sol/OrosignMasterV1.json', './src/AbiOrosignMasterV1.ts');
cpAbi('../artifacts/contracts/orosign/OrosignV1.sol/OrosignV1.json', './src/AbiOrosignV1.ts');
cpAbi('../artifacts/contracts/multicast/MultiCast.sol/Multicast.json', './src/AbiMulticast.ts');
cpAbi('../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json', './src/AbiERC20.ts');
cpAbi('../artifacts/@openzeppelin/contracts/token/ERC721/ERC721.sol/ERC721.json', './src/AbiERC721.ts');
cpAbi('../artifacts/contracts/orocle-v1/OrocleV1.sol/OrocleV1.json', './src/AbiOrocleV1.ts');
cpAbi('../artifacts/contracts/orand-v2/OrandProviderV2.sol/OrandProviderV2.json', './src/AbiOrandProviderV2.ts');

cpAbi('../artifacts/contracts/game-contract/GameContract.sol/GameContract.json', './src/AbiGameContract.ts');
cpAbi(
  '../artifacts/contracts/multi-send/MultiSend.sol/MultiSend.json',
  './src/AbiMultiSend.ts',
);
cpAbi('../artifacts/contracts/game-contract/GameContractFactory.sol/GameContractFactory.json', './src/AbiGameContractFactory.ts');


cpAbi('../artifacts/contracts/orocle-v2/OrocleV2.sol/OrocleV2.json', './src/AbiOrocleV2.ts');
cpAbi('../artifacts/contracts/orand-v3/OrandProviderV3.sol/OrandProviderV3.json', './src/AbiOrandProviderV3.ts');
cpAbi('../artifacts/contracts/token/XORO.sol/XORO.json', './src/AbiXORO.ts');

cpTypes('../typechain-types/contracts/orosign/OrosignMasterV1.ts', './src/OrosignMasterV1.ts');
cpTypes('../typechain-types/contracts/orosign/OrosignV1.ts', './src/OrosignV1.ts');
cpTypes('../typechain-types/contracts/multicast/MultiCast.sol/Multicast.ts', './src/Multicast.ts');
cpTypes('../typechain-types/@openzeppelin/contracts/token/ERC20/ERC20.ts', './src/ERC20.ts');
cpTypes('../typechain-types/@openzeppelin/contracts/token/ERC721/ERC721.ts', './src/ERC721.ts');
cpTypes('../typechain-types/contracts/orocle-v1/OrocleV1.ts', './src/OrocleV1.ts');
cpTypes('../typechain-types/contracts/orand-v2/OrandProviderV2.ts', './src/OrandProviderV2.ts');
cpTypes('../typechain-types/contracts/orocle-v2/OrocleV2.ts', './src/OrocleV2.ts');
cpTypes('../typechain-types/contracts/orand-v3/OrandProviderV3.ts', './src/OrandProviderV3.ts');
cpTypes('../typechain-types/contracts/token/XORO.ts', './src/XORO.ts');
cpTypes('../typechain-types/contracts/game-contract/GameContract.ts', './src/GameContract.ts');
cpTypes('../typechain-types/contracts/game-contract/GameContractFactory.ts', './src/GameContractFactory.ts');
cpTypes('../typechain-types/contracts/multi-send/MultiSend.ts', './src/MultiSend.ts');
writeFileSync(
  './src/index.ts',
  [
    typesList
      .map((e) => `export { ${basename(e, '.ts')} } from '${e.replace('.ts', '.js').replace('./src/', './')}';`)
      .join('\n'),
    tsFileList
      .map((e) => {
        return `export * from '${e.replace('.ts', '.js').replace('./src/', './')}';`;
      })
      .join('\n'),
  ].join('\n'),
);
