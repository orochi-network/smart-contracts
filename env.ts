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
  LOCAL_OROCHI_OPERATOR: '',
};

export type TEnvironment = typeof OROCHI_CONFIGURATION;

if (!fs.existsSync(`${__dirname}/.env`)) {
  throw new Error('.env file not found');
}

function load(): any {
  const keys = Object.keys(OROCHI_CONFIGURATION);
  const cleaned: any = {};
  for (let i = 0; i < keys.length; i += 1) {
    const k: keyof TEnvironment = keys[i] as keyof TEnvironment;
    const v = process.env[k] || OROCHI_CONFIGURATION[k];
    if (['USE_ZKSOLC', 'OROCHI_FORK'].includes(k)) {
      cleaned[k] = typeof v === 'boolean' ? v : v.trim().toLowerCase() === 'true';
    } else {
      cleaned[k] = v.trim();
    }
    if (typeof process.env[k] !== 'undefined') {
      delete process.env[k];
    }
  }
  if (!isAddress(cleaned['OROCHI_OWNER'])) {
    throw new Error('Invalid owner address');
  }
  console.log('Owner is:', cleaned['OROCHI_OWNER']);
  if (!cleaned['OROCHI_OPERATOR'].split(',').every((e: string) => isAddress(e))) {
    throw new Error('Invalid operator address');
  }
  console.log('Operators are:', cleaned['OROCHI_OPERATOR']);
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
  console.log('Public key:', cleaned['OROCHI_PUBLIC_KEY']);
  console.log('Corresponding address:', cleaned['OROCHI_CORRESPONDING_ADDRESS']);

  cleaned.OROCHI_FORK = cleaned.OROCHI_FORK || false;
  cleaned.LOCAL_RPC = cleaned.LOCAL_RPC || 'http://127.0.0.1:8545';
  return cleaned;
}

export const env: TEnvironment = load();
