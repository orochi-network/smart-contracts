import fs from 'fs';
import { HardhatUserConfig } from 'hardhat/types';
import { env } from './env';
import '@nomicfoundation/hardhat-toolbox';
import '@matterlabs/hardhat-zksync';
import '@matterlabs/hardhat-zksync-deploy';
import '@matterlabs/hardhat-zksync-solc';
import '@openzeppelin/hardhat-upgrades';

const isZkSolc = process.env.USE_ZKSOLC === 'true';

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
    a8main: {
      url: 'https://rpc.ancient8.gg',
      chainId: 888888888,
    },
    monadTestnet: {
      url: 'https://testnet-rpc.monad.xyz',
      chainId: 10143,
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
    fantom: {
      url: 'https://fantom-mainnet.public.blastapi.io',
      chainId: 250,
    },
    ftmTest: {
      url: 'https://fantom-testnet.publicnode.com',
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
    wanchainTest: {
      url: `https://gwan-ssl.wandevs.org:46891`,
      chainId: 999,
    },

    // Hard hat network
    hardhat: {
      zksync: isZkSolc,
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
      a8main: 'random_string',
      u2umain: 'random_string',
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
        network: 'seitest',
        chainId: 713715,
        urls: {
          apiURL: 'https://seitrace.com/arctic-1/api',
          browserURL: 'https://devnet.seitrace.com',
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
        network: 'a8main',
        chainId: 888888888,
        urls: {
          apiURL: 'https://scan.ancient8.gg/api',
          browserURL: 'https://scan.ancient8.gg',
        },
      },
      {
        network: 'u2umain',
        chainId: 39,
        urls: {
          apiURL: 'https://u2uscan.xyz/api',
          browserURL: 'https://u2uscan.xyz',
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
    ],
  },
  solidity: {
    compilers,
  },
};

export default config;
