/* eslint-disable no-await-in-loop */
import '@nomicfoundation/hardhat-ethers';
import { Wallet } from 'ethers';
import { task } from 'hardhat/config';
import EncryptionKey from '../helpers/encryption';
import { existsSync, readFileSync, writeFileSync } from 'fs';

task('create:wallet', 'Create new wallet').setAction(async (_taskArgs: any) => {
  const wallet = Wallet.createRandom();
  const { phrase } = wallet.mnemonic!;
  console.log('Generate new wallet with address:', wallet.address, 'path:', wallet.path);
  const aes = await EncryptionKey.getInstance();
  const encryptedBase64 = aes.encrypt(Buffer.from(phrase, 'utf-8')).toString('base64');
  let content = '';
  if (existsSync('.env')) {
    content = readFileSync('.env', 'utf-8');
  }
  content += `\nOROCHI_ENCRYPTED_PASSPHRASE="${encryptedBase64}"`;
  writeFileSync('.env', content, 'utf-8');
  console.log('Saved, encrypted passphrase');
  const decryptedPassPhrase = aes.decrypt(Buffer.from(encryptedBase64, 'base64')).toString('utf-8');
  const recoveredWallet = Wallet.fromPhrase(decryptedPassPhrase);
  console.log(
    'Is double check correct?',
    wallet.address === recoveredWallet.address,
    'Recovered wallet:',
    recoveredWallet.address,
    'Path:',
    recoveredWallet.path,
  );
});
