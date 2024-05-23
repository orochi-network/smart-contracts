const fs = require('fs');
const path = require('path');

function readJson(filename) {
  return JSON.parse(fs.readFileSync(filename).toString());
}

function writeJson(filename, obj) {
  return fs.writeFileSync(filename, JSON.stringify(obj, null, '  '));
}

const mPackage = readJson('./package.json');

function incVersion(v) {
  let [major, minor, patch] = v.split('.').map((e) => parseInt(e, 10));
  patch++;
  if (patch > 100) {
    patch = 0;
    minor++;
  }
  if (minor > 100) {
    minor = 0;
    major++;
  }
  return [major, minor, patch].join('.');
}

function cp(src, dst) {
  if (fs.existsSync(dst)) {
    fs.unlinkSync(dst);
  }
  fs.copyFileSync(src, dst);
}

const tsFileList = [];
const typesList = [];

function cpAbi(src, dst) {
  if (fs.existsSync(dst)) {
    fs.unlinkSync(dst);
  }
  const { abi } = readJson(src);
  tsFileList.push(dst);
  fs.writeFileSync(dst, `export const ${path.basename(dst, '.ts')} = ${JSON.stringify(abi, null, '  ')};`);
}

function cpTypes(src, dst) {
  if (fs.existsSync(dst)) {
    fs.unlinkSync(dst);
  }
  const content = fs.readFileSync(src).toString();
  typesList.push(dst);
  fs.writeFileSync(
    dst,
    content
      .replace('from "../../common";', 'from "./common";')
      .replace('from "../../../common";', 'from "./common";')
      .replace('from "../../../../common";', 'from "./common";'),
  );
}

cp('../typechain-types/common.ts', './src/common.ts');
cp('../contracts/orand-v2/interfaces/IOrandConsumerV2.sol', './IOrandConsumerV2.sol');
cp('../contracts/orocle-v1/interfaces/IOrocleAggregatorV1.sol', './IOrocleAggregatorV1.sol');

cp('../contracts/orand-v3/interfaces/IOrandConsumerV3.sol', './IOrandConsumerV3.sol');
cp('../contracts/orocle-v2/interfaces/IOrocleAggregatorV2.sol', './IOrocleAggregatorV2.sol');

cpAbi('../artifacts/contracts/orosign/OrosignMasterV1.sol/OrosignMasterV1.json', './src/AbiOrosignMasterV1.ts');
cpAbi('../artifacts/contracts/orosign/OrosignV1.sol/OrosignV1.json', './src/AbiOrosignV1.ts');
cpAbi('../artifacts/contracts/multicast/MultiCast.sol/Multicast.json', './src/AbiMulticast.ts');
cpAbi('../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json', './src/AbiERC20.ts');
cpAbi('../artifacts/@openzeppelin/contracts/token/ERC721/ERC721.sol/ERC721.json', './src/AbiERC721.ts');
cpAbi('../artifacts/contracts/orocle-v1/OrocleV1.sol/OrocleV1.json', './src/AbiOrocleV1.ts');
cpAbi('../artifacts/contracts/orand-v2/OrandProviderV2.sol/OrandProviderV2.json', './src/AbiOrandProviderV2.ts');

cpAbi('../artifacts/contracts/orocle-v2/OrocleV2.sol/OrocleV2.json', './src/AbiOrocleV2.ts');
cpAbi('../artifacts/contracts/orand-v3/OrandProviderV3.sol/OrandProviderV3.json', './src/AbiOrandProviderV3.ts');

cpTypes('../typechain-types/contracts/orosign/OrosignMasterV1.ts', './src/OrosignMasterV1.ts');
cpTypes('../typechain-types/contracts/orosign/OrosignV1.ts', './src/OrosignV1.ts');
cpTypes('../typechain-types/contracts/multicast/MultiCast.sol/Multicast.ts', './src/Multicast.ts');
cpTypes('../typechain-types/@openzeppelin/contracts/token/ERC20/ERC20.ts', './src/ERC20.ts');
cpTypes('../typechain-types/@openzeppelin/contracts/token/ERC721/ERC721.ts', './src/ERC721.ts');
cpTypes('../typechain-types/contracts/orocle-v1/OrocleV1.ts', './src/OrocleV1.ts');
cpTypes('../typechain-types/contracts/orand-v2/OrandProviderV2.ts', './src/OrandProviderV2.ts');
cpTypes('../typechain-types/contracts/orocle-v2/OrocleV2.ts', './src/OrocleV2.ts');
cpTypes('../typechain-types/contracts/orand-v3/OrandProviderV3.ts', './src/OrandProviderV3.ts');

fs.writeFileSync(
  './src/index.ts',
  [
    typesList
      .map((e) => `export { ${path.basename(e, '.ts')} } from '${e.replace('.ts', '').replace('./src/', './')}';`)
      .join('\n'),
    tsFileList
      .map((e) => {
        if (e.includes('OrandProviderV3')) {
          return `export * as OrandProviderV3Package from './OrandProviderV3';`;
        }
        return `export * from '${e.replace('.ts', '').replace('./src/', './')}';`;
      })
      .join('\n'),
  ].join('\n'),
);

mPackage.version = incVersion(mPackage.version);

writeJson('package.json', mPackage);
