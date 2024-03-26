import fs from 'fs';
import { ethers } from 'ethers';

(async () => {
  const wallet = ethers.Wallet.createRandom();
  const dataTable = [];

  for (let i = 0; i < 5; i += 1) {
    const newWallet = wallet.deriveChild(i);
    dataTable.push({
      path: newWallet.path,
      address: await newWallet.getAddress(),
    });
  }
  for (let i = 100; i < 105; i += 1) {
    const newWallet = wallet.deriveChild(i);
    dataTable.push({
      path: newWallet.path,
      address: await newWallet.getAddress(),
    });
  }
  const walletList = dataTable.map(({ path, address }) => {
    return `# ${path}\t${address}`;
  });
  const fileContent = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf-8') : '';
  if (fileContent.indexOf('OROCHI_MNEMONIC') === -1) {
    fs.writeFileSync(
      '.env',
      `${fileContent}\n${walletList.join('\n')}\nOROCHI_MNEMONIC="${wallet.mnemonic?.phrase.trim()}"`,
    );
    console.table(dataTable);
  } else {
    console.log('Wallets existed');
  }
})();
