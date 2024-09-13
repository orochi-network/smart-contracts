import fs from 'fs';
import { HardhatUserConfig } from 'hardhat/types';
import { env } from './env';
import '@nomicfoundation/hardhat-toolbox';
import '@matterlabs/hardhat-zksync';
import '@matterlabs/hardhat-zksync-deploy';
import '@matterlabs/hardhat-zksync-solc';
import '@openzeppelin/hardhat-upgrades';

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
  gasReporter: {
    enabled: true,
  },
  zksolc: {
    version: '1.4.1',
    settings: {},
  },
  networks: {
    sepolia: {
      url: 'https://rpc.sepolia.org',
      chainId: 11155111,
    },
    u2: {
      url: 'https://rpc-nebulas-testnet.uniultra.xyz/',
      chainId: 2484,
    },
    a8: {
      url: 'https://rpcv2-testnet.ancient8.gg/',
      chainId: 28122024,
    },
    seitest: {
      url: 'https://evm-rpc-arctic-1.sei-apis.com',
      chainId: 713715,
    },
    seimain: {
      url: 'https://evm-rpc.sei-apis.com',
      chainId: 1329,
    },
    a8Main: {
      url: 'https://rpc.ancient8.gg',
      chainId: 888888888,
    },
    u2umain: {
      url: 'https://rpc-mainnet.uniultra.xyz',
      chainId: 39,
    },
    ethereum: {
      url: 'https://eth-mainnet.public.blastapi.io',
      chainId: 1,
    },
    binance: {
      url: 'https://bnb.api.onfinality.io/public',
      chainId: 56,
    },
    arbitrum: {
      url: 'https://arbitrum.blockpi.network/v1/rpc/public',
      chainId: 42161,
    },
    arbitrumTest: {
      url: 'https://sepolia-rollup.arbitrum.io/rpc',
      chainId: 421614,
    },
    polygon: {
      url: 'https://rpc-mainnet.matic.quiknode.pro',
      chainId: 137,
    },
    optimism: {
      url: 'https://optimism-mainnet.public.blastapi.io',
      chainId: 10,
    },
    optimismTest: {
      url: 'https://sepolia.optimism.io',
      chainId: 11155420,
    },
    fantomMain: {
      url: 'https://fantom-mainnet.public.blastapi.io',
      chainId: 250,
    },
    fantomTest: {
      url: 'https://rpc.testnet.fantom.network',
      chainId: 4002,
    },
    okexchain: {
      url: 'https://exchainrpc.okex.org',
      chainId: 66,
    },
    bnbChainTest: {
      url: 'https://bsc-testnet-rpc.publicnode.com',
      chainId: 97,
    },
    local: {
      url: env.LOCAL_RPC,
      chainId: 911,
    },
    moonbeamTest: {
      url: 'https://rpc.api.moonbase.moonbeam.network',
      chainId: 1287,
    },
    saakuruTest: {
      url: 'https://rpc.testnet.oasys.games/',
      chainId: 9372,
    },
    saakuruTestL2: {
      url: 'https://rpc-testnet.saakuru.network',
      chainId: 247253,
    },
    saakuruMainL2: {
      url: 'https://rpc.saakuru.network',
      chainId: 7225878,
    },
    zkFairTest: {
      url: 'https://testnet-rpc.zkfair.io',
      chainId: 43851,
    },
    zircuitTest: {
      url: `https://zircuit1.p2pify.com/`,
      chainId: 48899,
    },
    zircuitMain: {
      url: `https://zircuit1-mainnet.p2pify.com/`,
      chainId: 48900,
    },
    xLayerTest: {
      url: `https://testrpc.xlayer.tech/`,
      chainId: 195,
    },
    xLayerMain: {
      url: `https://rpc.xlayer.tech/`,
      chainId: 196,
    },
    zkLinkTest: {
      url: `https://sepolia.rpc.zklink.io`,
      zksync: true,
      ethNetwork: 'https://sepolia.rpc.zklink.io',
      chainId: 810181,
    },
    mantaTest: {
      url: `https://pacific-rpc.sepolia-testnet.manta.network/http`,
      chainId: 3441006,
    },
    mantaMainnet: {
      url: `https://pacific-rpc.manta.network/http`,
      chainId: 169,
    },
    layerEdgeTest: {
      url: `https://testnet-rpc.layeredge.io`,
      chainId: 3456,
    },
    baseMain: {
      url: `https://base-rpc.publicnode.com`,
      chainId: 8453,
    },
    baseTest: {
      url: `https://base-sepolia-rpc.publicnode.com`,
      chainId: 84532,
    },
    morphHoleskyTest: {
      url: `https://rpc-quicknode-holesky.morphl2.io`,
      chainId: 2810,
    },
    scrollTest: {
      url: `https://sepolia-rpc.scroll.io/`,
      chainId: 534351,
    },
    scrollMain: {
      url: `https://rpc.scroll.io/`,
      chainId: 534352,
    },
    wanchainTest: {
      url: 'https://gwan-ssl.wandevs.org:46891',
      chainId: 999,
    },
    bitlayerMain: {
      url: `https://rpc.bitlayer.org`,
      chainId: 200901,
    },
    bitlayerTest: {
      url: `https://testnet-rpc.bitlayer.org`,
      chainId: 200810,
    },
    etherLinkMain: {
      url: `https://node.mainnet.etherlink.com`,
      chainId: 42793,
    },
    etherLinkTest: {
      url: 'https://node.ghostnet.etherlink.com',
      chainId: 128123,
    },
    zkSyncMain: {
      url: 'https://mainnet.era.zksync.io',
      ethNetwork: 'https://mainnet.era.zksync.io',
      verifyURL: 'https://zksync2-mainnet-explorer.zksync.io/contract_verification',
      zksync: true,
      chainId: 324,
    },
    zkSyncTest: {
      url: 'https://sepolia.era.zksync.dev',
      ethNetwork: 'https://sepolia.era.zksync.dev',
      chainId: 300,
      zksync: true,
    },
    corechainTest: {
      url: 'https://rpc.test.btcs.network',
      chainId: 1115,
    },
    corechainMain: {
      url: 'https://rpc.ankr.com/core',
      chainId: 1116,
    },
    lumiaTest: {
      url: 'https://testnet-rpc.lumia.org',
      chainId: 1952959480,
    },
    lumiaMain: {
      url: 'https://rpc.lumia.org',
      chainId: 994873017,
    },
    reactiveTest: {
      url: 'https://kopli-rpc.rkt.ink',
      chainId: 5318008,
    },
    ioTexMain: {
      chainId: 4689,
      url: 'https://babel-api.mainnet.iotex.io',
    },
    ioTexTest: {
      chainId: 4690,
      url: 'https://babel-api.testnet.iotex.io',
    },
    shardeumTest: {
      chainId: 8082,
      url: 'https://atomium.shardeum.org',
    },
    b2Test: {
      chainId: 1123,
      url: 'https://rpc.ankr.com/b2_testnet',
    },
    b2Main: {
      chainId: 223,
      url: 'https://mainnet.b2-rpc.com',
    },
    gnosisChainMain: {
      chainId: 100,
      url: 'https://rpc.gnosischain.com',
    },
    gnosisChainTest: {
      chainId: 10200,
      url: 'https://rpc.chiadochain.net',
    },
    stravoTest: {
      chainId: 93747,
      url: 'https://rpc.stratovm.io',
    },
    lineaTest: {
      chainId: 59141,
      url: 'https://rpc.sepolia.linea.build',
    },
    lineaMain: {
      chainId: 59144,
      url: 'https://rpc.linea.build',
    },
    polygonTest: {
      url: 'https://rpc-amoy.polygon.technology',
      chainId: 80002,
    },
    lightLinkTest: {
      url: 'https://replicator.pegasus.lightlink.io/rpc/v1',
      chainId: 1891,
    },
    lightlinkMain: {
      url: 'https://replicator.phoenix.lightlink.io/rpc/v1',
      chainId: 1890,
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
      saakuruMainL2: 'random_string',
      binance: env.BSC_API_KEY,
      a8Main: 'random_string',
      u2uMain: 'random_string',
      xLayerMain: env.X_LAYER_API_KEY,
    },
    customChains: [
      {
        network: 'saakuruMainL2',
        chainId: 7225878,
        urls: {
          apiURL: 'https://explorer.saakuru.network/api',
          browserURL: 'https://explorer.saakuru.network/',
        },
      },
      {
        network: 'polygonTest',
        chainId: 80002,
        urls: {
          apiURL: 'https://api-amoy.polygonscan.com/api',
          browserURL: 'https://amoy.polygonscan.com/',
        },
      },
      {
        network: 'binance',
        chainId: 56,
        urls: {
          apiURL: 'https://api.bscscan.com/api',
          browserURL: 'https://bscscan.com/',
        },
      },
      {
        network: 'a8Main',
        chainId: 888888888,
        urls: {
          apiURL: 'https://scan.ancient8.gg/api',
          browserURL: 'https://scan.ancient8.gg',
        },
      },
      {
        network: 'u2uMain',
        chainId: 39,
        urls: {
          apiURL: 'https://u2uscan.xyz/api',
          browserURL: 'https://u2uscan.xyz',
        },
      },
      {
        network: 'u2uTest',
        chainId: 2484,
        urls: {
          apiURL: 'https://testnet.u2uscan.xyz/api',
          browserURL: 'https://testnet.u2uscan.xyz',
        },
      },
      {
        network: 'zircuit',
        chainId: 48900,
        urls: {
          apiURL: 'https://explorer.zircuit.com/api/contractVerifyHardhat',
          browserURL: 'https://explorer.zircuit.com',
        },
      },
      {
        network: 'xLayerMain',
        chainId: 196,
        urls: {
          apiURL: 'https://www.oklink.com/api/v5/explorer/contract/verify-source-code-plugin/XLAYER',
          browserURL: 'https://www.oklink.com/xlayer',
        },
      },
      {
        network: 'scrollMain',
        chainId: 534352,
        urls: {
          apiURL: 'https://api.scrollscan.com/api',
          browserURL: 'https://scrollscan.com/',
        },
      },
      {
        network: 'lightlinkMain',
        chainId: 1890,
        urls: {
          apiURL: 'https://phoenix.lightlink.io/api',
          browserURL: 'https://phoenix.lightlink.io',
        },
      },
      {
        network: 'stravoTest',
        chainId: 93747,
        urls: {
          apiURL: 'https://explorer.stratovm.io/api',
          browserURL: 'https://explorer.stratovm.io/',
        },
      },
    ],
  },
};

export default config;
