import fs from 'fs';
import { HardhatUserConfig } from 'hardhat/types';
import '@nomicfoundation/hardhat-toolbox';
import '@openzeppelin/hardhat-upgrades';
import { env } from './env';

// Only load those libs when we need zkSolc compiler
if (env.USE_ZKSOLC) {
  require('@matterlabs/hardhat-zksync');
  require('@matterlabs/hardhat-zksync-deploy');
  require('@matterlabs/hardhat-zksync-solc');
}

if (fs.existsSync('./typechain-types')) {
  const dir = fs.opendirSync(`${__dirname}/tasks`);
  for (let entry = dir.readSync(); entry !== null; entry = dir.readSync()) {
    if (entry.name.toLowerCase().includes('.ts')) {
      // eslint-disable-next-line import/no-dynamic-require
      require(`./tasks/${entry.name.replace(/\.ts$/gi, '')}`);
    }
  }
}

const compilers = ['0.8.19'].map((item: string) => ({
  version: item,
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000,
    },
  },
}));

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  zksolc: {
    version: '1.4.1',
    settings: {},
  },
  networks: {
    local: {
      url: env.LOCAL_RPC,
      chainId: 911,
    },
    testnetSepolia: {
      url: 'https://rpc.sepolia.org',
      chainId: 11155111,
    },
    ethereum: {
      url: 'https://eth-mainnet.public.blastapi.io',
      chainId: 1,
    },
    testnetU2U: {
      url: 'https://rpc-nebulas-testnet.uniultra.xyz/',
      chainId: 2484,
      verifyURL: 'https://testnet.u2uscan.xyz/api',
    },
    mainnetU2U: {
      url: 'https://rpc-mainnet.uniultra.xyz',
      chainId: 39,
      verifyURL: 'https://u2uscan.xyz/api',
    },
    testnetAncient8: {
      url: 'https://rpcv2-testnet.ancient8.gg/',
      chainId: 28122024,
    },
    mainnetAncient8: {
      url: 'https://rpc.ancient8.gg',
      chainId: 888888888,
      verifyURL: 'https://scan.ancient8.gg/api',
    },
    testnetSei: {
      url: 'https://evm-rpc-arctic-1.sei-apis.com',
      chainId: 713715,
    },
    mainnetSei: {
      url: 'https://evm-rpc.sei-apis.com',
      chainId: 1329,
    },
    testnetBnbChain: {
      url: 'https://bsc-testnet-rpc.publicnode.com',
      chainId: 97,
    },
    mainnetBnbChain: {
      url: 'https://bnb.api.onfinality.io/public',
      chainId: 56,
    },
    testnetArbitrum: {
      url: 'https://sepolia-rollup.arbitrum.io/rpc',
      chainId: 421614,
    },
    mainnetArbitrum: {
      url: 'https://nova.arbitrum.io/rpc',
      chainId: 42170,
    },
    testnetPolygon: {
      url: 'https://rpc-amoy.polygon.technology',
      chainId: 80002,
      verifyURL: 'https://api-amoy.polygonscan.com/api',
    },
    mainnetPolygon: {
      url: 'https://rpc-mainnet.matic.quiknode.pro',
      chainId: 137,
    },
    testnetOptimism: {
      url: 'https://sepolia.optimism.io',
      chainId: 11155420,
    },
    mainnetOptimism: {
      url: 'https://optimism-mainnet.public.blastapi.io',
      chainId: 10,
    },
    testnetFantom: {
      url: 'https://rpc.testnet.fantom.network',
      chainId: 4002,
    },
    mainnetFantom: {
      url: 'https://fantom-mainnet.public.blastapi.io',
      chainId: 250,
    },
    mainnetOKXChain: {
      url: 'https://exchainrpc.okex.org',
      chainId: 66,
    },
    testnetMoonbeam: {
      url: 'https://rpc.api.moonbase.moonbeam.network',
      chainId: 1287,
    },
    mainnetMoonbeam: {
      url: 'https://moonbeam.api.onfinality.io/public',
      chainId: 1284,
    },
    testnetSaakuru: {
      url: 'https://rpc.testnet.oasys.games/',
      chainId: 9372,
    },
    mainnetSaakuru: {
      url: 'https://rpc.saakuru.network',
      chainId: 7225878,
      verifyURL: 'https://explorer.saakuru.network/api',
    },
    testnetZKFair: {
      url: 'https://testnet-rpc.zkfair.io',
      chainId: 43851,
    },
    mainnetZKFair: {
      url: 'https://rpc.zkfair.io',
      chainId: 42766,
    },
    testnetZircuit: {
      url: `https://zircuit1.p2pify.com/`,
      chainId: 48899,
    },
    mainnetZircuit: {
      url: `https://zircuit1-mainnet.p2pify.com/`,
      chainId: 48900,
    },
    testnetXLayer: {
      url: `https://testrpc.xlayer.tech/`,
      chainId: 195,
    },
    mainnetXLayer: {
      url: `https://rpc.xlayer.tech/`,
      chainId: 196,
    },
    testnetZkLink: {
      url: `https://sepolia.rpc.zklink.io`,
      zksync: true,
      ethNetwork: 'https://sepolia.rpc.zklink.io',
      chainId: 810181,
    },
    mainnetZkLink: {
      url: `https://rpc.zklink.io`,
      zksync: true,
      ethNetwork: `https://rpc.zklink.io`,
      chainId: 810180,
    },
    testnetManta: {
      url: `https://pacific-rpc.sepolia-testnet.manta.network/http`,
      chainId: 3441006,
    },
    mainnetManta: {
      url: `https://pacific-rpc.manta.network/http`,
      chainId: 169,
    },
    testnetBase: {
      url: `https://base-sepolia-rpc.publicnode.com`,
      chainId: 84532,
    },
    mainnetBase: {
      url: `https://base-rpc.publicnode.com`,
      chainId: 8453,
    },
    testnetMorph: {
      url: `https://rpc-holesky.morphl2.io`,
      chainId: 2810,
    },
    testnetScroll: {
      url: `https://sepolia-rpc.scroll.io/`,
      chainId: 534351,
    },
    mainnetScroll: {
      url: `https://rpc.scroll.io/`,
      chainId: 534352,
      verifyURL: 'https://api.scrollscan.com/api',
    },
    testnetWanchain: {
      url: 'https://gwan-ssl.wandevs.org:46891',
      chainId: 999,
    },
    testnetBitLayer: {
      url: `https://testnet-rpc.bitlayer.org`,
      chainId: 200810,
    },
    mainnetBitlayer: {
      url: `https://rpc.bitlayer.org`,
      chainId: 200901,
    },
    testnetEtherLink: {
      url: 'https://node.ghostnet.etherlink.com',
      chainId: 128123,
    },
    mainnetEtherLink: {
      url: `https://node.mainnet.etherlink.com`,
      chainId: 42793,
    },
    testnetZKSync: {
      url: 'https://sepolia.era.zksync.dev',
      ethNetwork: 'https://sepolia.era.zksync.dev',
      chainId: 300,
      zksync: true,
    },
    mainnetZKSync: {
      url: 'https://mainnet.era.zksync.io',
      ethNetwork: 'https://mainnet.era.zksync.io',
      verifyURL: 'https://zksync2-mainnet-explorer.zksync.io/contract_verification',
      zksync: true,
      chainId: 324,
    },
    testnetCoreChain: {
      url: 'https://rpc.test.btcs.network',
      chainId: 1115,
    },
    mainnetCoreChain: {
      url: 'https://rpc.ankr.com/core',
      chainId: 1116,
    },
    testnetLumia: {
      url: 'https://testnet-rpc.lumia.org',
      chainId: 1952959480,
    },
    mainnetLumia: {
      url: 'https://rpc.lumia.org',
      chainId: 994873017,
    },
    testnetReactive: {
      url: 'https://kopli-rpc.rkt.ink',
      chainId: 5318008,
    },
    testnetIoTex: {
      chainId: 4690,
      url: 'https://babel-api.testnet.iotex.io',
    },
    mainnetIoTex: {
      chainId: 4689,
      url: 'https://babel-api.mainnet.iotex.io',
    },
    testnetShardeum: {
      chainId: 8082,
      url: 'https://atomium.shardeum.org',
    },
    testnetB2: {
      chainId: 1123,
      url: 'https://rpc.ankr.com/b2_testnet',
    },
    mainnetB2: {
      chainId: 223,
      url: 'https://mainnet.b2-rpc.com',
    },
    testnetGnosisChain: {
      chainId: 10200,
      url: 'https://rpc.chiado.gnosis.gateway.fm',
    },
    mainnetGnosisChain: {
      chainId: 100,
      url: 'https://rpc.gnosischain.com',
    },
    testnetStravo: {
      chainId: 93747,
      url: 'https://rpc.stratovm.io',
      verifyURL: 'https://explorer.stratovm.io/api',
    },
    testnetLinea: {
      chainId: 59141,
      url: 'https://rpc.sepolia.linea.build',
    },
    mainnetLinea: {
      chainId: 59144,
      url: 'https://rpc.linea.build',
    },
    testnetLightLink: {
      url: 'https://replicator.pegasus.lightlink.io/rpc/v1',
      chainId: 1891,
    },
    mainnetLightLink: {
      url: 'https://replicator.phoenix.lightlink.io/rpc/v1',
      chainId: 1890,
      verifyURL: 'https://phoenix.lightlink.io/api',
    },
    testnetMinato: {
      url: 'https://rpc.minato.soneium.org',
      chainId: 1946,
    },
    testnetAILayer: {
      url: 'https://testnet-rpc.ailayer.xyz',
      chainId: 2648,
    },
    mainnetAILayer: {
      url: 'https://mainnet-rpc.ailayer.xyz',
      chainId: 2649,
    },
    testnetIoTeX: {
      url: 'https://archive-testnet.iotex.io',
      chainId: 4690,
    },
    mainnetIoTeX: {
      url: 'https://archive-mainnet.iotex.io',
      chainId: 4689,
    },

    // Hard hat network
    hardhat: {
      zksync: env.USE_ZKSOLC,
      chainId: 911,
      hardfork: 'london',
      blockGasLimit: 30000000,
      initialBaseFeePerGas: 0,
      gas: 25000000,
      mining: {
        auto: true,
        interval: 2000,
      },
      // Are we going to forking mainnet for testing?
      forking: env.OROCHI_FORK
        ? {
            url: env.OROCHI_RPC,
            enabled: true,
          }
        : undefined,
    },
  },
  sourcify: {
    enabled: false,
  },
  etherscan: {
    apiKey: {
      mainnetBnbChain: env.BSC_API_KEY,
      mainnetXLayer: env.X_LAYER_API_KEY,
    },
    customChains: [
      {
        network: 'mainnetBnbChain',
        chainId: 56,
        urls: {
          apiURL: 'https://api.bscscan.com/api',
          browserURL: 'https://bscscan.com/',
        },
      },
      {
        network: 'mainnetXLayer',
        chainId: 196,
        urls: {
          apiURL: 'https://www.oklink.com/api/v5/explorer/contract/verify-source-code-plugin/XLAYER',
          browserURL: 'https://www.oklink.com/xlayer',
        },
      },
      {
        network: 'mainnetZircuit',
        chainId: 48900,
        urls: {
          apiURL: 'https://explorer.zircuit.com/api/contractVerifyHardhat',
          browserURL: 'https://explorer.zircuit.com',
        },
      },
      {
        network: 'mainnetEtherLink',
        chainId: 42793,
        urls: {
          apiURL: 'https://explorer.etherlink.com/api',
          browserURL: 'https://explorer.etherlink.com',
        },
      },
    ],
  },
  solidity: {
    compilers,
  },
};

export default config;
