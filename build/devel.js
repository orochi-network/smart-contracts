const fs = require('fs');

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

//mPackage.version = incVersion(mPackage.version);

function cp(src, dst) {
  if (fs.existsSync(dst)) {
    fs.unlink(dst);
  }
  fs.copyFileSync(src, dst);
}

cp('../contracts/orand-v2/interfaces/IOrandConsumerV2.sol', './IOrandConsumerV2.sol');
cp('../contracts/orocle-v1/interfaces/IOrocleAggregatorV1.sol', './IOrocleAggregatorV1.sol');

writeJson('package.json', mPackage);
