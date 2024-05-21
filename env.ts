import fs from 'fs';
import { parse } from 'dotenv';

export interface IEnvironment {
  OROCHI_MNEMONIC: string;
  OROCHI_RPC: string;
  OROCHI_FORK: boolean;
  OROCHI_PUBLIC_KEY: string;
  OROCHI_OWNER: string;
  OROCHI_OPERATOR: string;
}

function clean(config: any): any {
  const entries = Object.entries(config);
  const cleaned: any = {};
  for (let i = 0; i < entries.length; i += 1) {
    const [k, v] = entries[i] as [string, string];
    if (k === 'OROCHI_FORK') {
      cleaned[k] = v.trim().toLowerCase() === 'true';
    } else {
      cleaned[k] = v.trim();
    }
  }
  cleaned.OROCHI_FORK = cleaned.OROCHI_FORK || false;
  return cleaned;
}

export const env: IEnvironment = fs.existsSync(`${__dirname}/.env`)
  ? clean(parse(fs.readFileSync(`${__dirname}/.env`)) as any)
  : {
      OROCHI_FORK: false,
      OROCHI_MNEMONIC: 'baby nose young alone sport inside grain rather undo donor void exotic',
      OROCHI_RPC: 'http://localhost:8545',
      OROCHI_OWNER: '0xA2096671D4A0939D4D50bd7AAB612883e98B4D47',
      OROCHI_OPERATOR: '0x4d8Ebc5601683C5b50dADA3066940e234146C07E,0xc4fFb047C1C6600FC82c68376C502bAa72ea2074',
      OROCHI_PUBLIC_KEY:
        '0446b01e9550b56f3655dbca90cfe6b31dec3ff137f825561c563444096803531e9d4f6e8329d300483a919b63843174f1fca692fc6d2c07b985f72386e4edc846',
    };
