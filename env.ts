import fs from 'fs';
import { config } from 'dotenv';
import { getAddress, isAddress, keccak256 } from 'ethers';
import { HexString } from '@orochi-network/utilities';

config();

const OROCHI_CONFIGURATION = {
  USE_ZKSOLC: 'false',
  OROCHI_RPC: '',
  OROCHI_FORK: 'false',
  OROCHI_PUBLIC_KEY: '',
  OROCHI_CORRESPONDING_ADDRESS: '',
  OROCHI_OWNER: '',
  OROCHI_OPERATOR: '',
  OROCHI_ENCRYPTED_PASSPHRASE: '',
  LOCAL_RPC: '',
  RESULT_PATH: './output/result.json',
  OROCHI_MNEMONIC: '',
  X_LAYER_API_KEY: '',
  BSC_API_KEY: '',
  VERBOSE_SILENT: 'false',
} as const;

type TAlterConfig<T extends Record<string, string>> = {
  [K in keyof T]: T[K] extends 'false' | 'true' ? boolean : string;
};

export type TEnvironment = TAlterConfig<typeof OROCHI_CONFIGURATION>;

if (!fs.existsSync(`${__dirname}/.env`)) {
  throw new Error('.env file not found');
}

function initEnv() {
  const keys = Object.keys(OROCHI_CONFIGURATION);
  const cleaned: any = {};
  for (let i = 0; i < keys.length; i += 1) {
    const k: keyof TEnvironment = keys[i] as keyof TEnvironment;
    const v = process.env[k] || OROCHI_CONFIGURATION[k];
    if (['USE_ZKSOLC', 'OROCHI_FORK', 'VERBOSE_SILENT'].includes(k)) {
      cleaned[k] = typeof v === 'boolean' ? v : v.trim().toLowerCase() === 'true';
    } else {
      cleaned[k] = v.trim();
    }
  }
  if (!isAddress(cleaned['OROCHI_OWNER'])) {
    throw new Error('Invalid owner address');
  }
  return cleaned;
}

const rawEnv: TEnvironment = initEnv();
export const logger = rawEnv.VERBOSE_SILENT
  ? (new Proxy(
      {},
      {
        get() {
          return () => {};
        },
      },
    ) as Console)
  : new Proxy(console, {
      get(target, prop, receiver) {
        return Reflect.get(target, prop, receiver);
      },
    });

function load(): any {
  const cleaned = initEnv();
  logger.log('Owner is:', cleaned['OROCHI_OWNER']);
  if (!cleaned['OROCHI_OPERATOR'].split(',').every((e: string) => isAddress(e))) {
    logger.log('Error: Can not load operator address at initial');
  } else {
    logger.log('Operators are:', cleaned['OROCHI_OPERATOR']);
  }
  if (!HexString.isHexStringLike(cleaned['OROCHI_PUBLIC_KEY']) || cleaned['OROCHI_PUBLIC_KEY'].length !== 130) {
    throw new Error('Invalid public key');
  }
  let pk = cleaned['OROCHI_PUBLIC_KEY'].replace(/^0x/gi, '').trim();
  let correspondingAddress = getAddress(`0x${keccak256(`0x${pk.substring(2, 130)}`).substring(26, 66)}`);
  if (correspondingAddress.toLowerCase() !== cleaned['OROCHI_CORRESPONDING_ADDRESS'].toLowerCase()) {
    throw new Error(
      `Unexpected corresponding address, want: ${cleaned['OROCHI_CORRESPONDING_ADDRESS']} received: ${correspondingAddress}`,
    );
  }
  logger.log('Public key:', cleaned['OROCHI_PUBLIC_KEY']);
  logger.log('Corresponding address:', cleaned['OROCHI_CORRESPONDING_ADDRESS']);

  cleaned.OROCHI_FORK = cleaned.OROCHI_FORK || false;
  cleaned.LOCAL_RPC = cleaned.LOCAL_RPC || 'http://127.0.0.1:8545';
  const keys = Object.keys(OROCHI_CONFIGURATION);
  for (let i = 0; i < keys.length; i += 1) {
    const k: keyof TEnvironment = keys[i] as keyof TEnvironment;
    if (typeof process.env[k] !== 'undefined') {
      delete process.env[k];
    }
  }
  return cleaned;
}

export const env: TEnvironment = load();
