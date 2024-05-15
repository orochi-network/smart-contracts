import fs from 'fs';
import { HardhatUserConfig } from 'hardhat/types';
import { env } from './env';
import '@nomicfoundation/hardhat-toolbox';
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
  networks: {
    sepolia: {
      url: 'https://eth-sepolia.api.onfinality.io/public',
      chainId: 11155111,
      accounts: { mnemonic: env.OROCHI_MNEMONIC },
    },
    u2: {
      url: 'https://rpc-nebulas-testnet.uniultra.xyz/',
      chainId: 2484,
      accounts: { mnemonic: env.OROCHI_MNEMONIC },
    },
    a8: {
      url: 'https://rpcv2-testnet.ancient8.gg/',
      chainId: 28122024,
      accounts: { mnemonic: env.OROCHI_MNEMONIC },
    },
    seitest: {
      url: 'https://evm-rpc-arctic-1.sei-apis.com',
      chainId: 713715,
      accounts: { mnemonic: env.OROCHI_MNEMONIC },
    },
    a8main: {
      url: 'https://rpc.ancient8.gg',
      chainId: 888888888,
      accounts: { mnemonic: env.OROCHI_MNEMONIC },
    },
    u2umain: {
      url: 'https://rpc-mainnet.uniultra.xyz',
      chainId: 39,
      accounts: { mnemonic: env.OROCHI_MNEMONIC },
    },
    ethereum: {
      url: 'https://eth-mainnet.public.blastapi.io',
      chainId: 1,
      accounts: { mnemonic: env.OROCHI_MNEMONIC },
    },
    binance: {
      url: 'https://bnb.api.onfinality.io/public',
      chainId: 56,
      accounts: { mnemonic: env.OROCHI_MNEMONIC },
    },
    arbitrum: {
      url: 'https://arbitrum.blockpi.network/v1/rpc/public',
      chainId: 42161,
      accounts: { mnemonic: env.OROCHI_MNEMONIC },
    },
    polygon: {
      url: 'https://rpc-mainnet.matic.quiknode.pro',
      chainId: 137,
      accounts: { mnemonic: env.OROCHI_MNEMONIC },
    },
    optimism: {
      url: 'https://optimism-mainnet.public.blastapi.io',
      chainId: 10,
      accounts: { mnemonic: env.OROCHI_MNEMONIC },
    },
    fantom: {
      url: 'https://fantom-mainnet.public.blastapi.io',
      chainId: 250,
      accounts: { mnemonic: env.OROCHI_MNEMONIC },
    },
    okexchain: {
      url: 'https://exchainrpc.okex.org',
      chainId: 66,
      accounts: { mnemonic: env.OROCHI_MNEMONIC },
    },
    bnbChainTest: {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      chainId: 97,
      accounts: {
        mnemonic: env.OROCHI_MNEMONIC,
      },
    },
    local: {
      url: 'http://127.0.0.1:8545',
      chainId: 911,
      accounts: {
        mnemonic: env.OROCHI_MNEMONIC,
      },
    },
    moonbeamTest: {
      url: 'https://rpc.api.moonbase.moonbeam.network',
      chainId: 1287,
      accounts: {
        mnemonic: env.OROCHI_MNEMONIC,
      },
    },
    saakuruTest: {
      url: 'https://rpc.testnet.oasys.games/',
      chainId: 9372,
      accounts: {
        mnemonic: env.OROCHI_MNEMONIC,
      },
    },
    zkFairTest: {
      url: 'https://testnet-rpc.zkfair.io',
      chainId: 43851,
      accounts: {
        mnemonic: env.OROCHI_MNEMONIC,
      },
    },

    // Hard hat network
    hardhat: {
      chainId: 911,
      hardfork: 'london',
      blockGasLimit: 30000000,
      initialBaseFeePerGas: 0,
      gas: 25000000,
      mining: {
        auto: true,
        interval: 2000,
      },
      accounts: {
        mnemonic: env.OROCHI_MNEMONIC,
        path: "m/44'/60'/0'/0",
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
  solidity: {
    compilers,
  },
};

export default config;
