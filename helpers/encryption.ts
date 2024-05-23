import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { createInterface } from 'readline/promises';
import { Writable } from 'stream';

export class EncryptionKey {
  #secretKey: Buffer;

  private constructor(key: string, salt: Buffer) {
    this.#secretKey = createHash('sha256').update(salt).update(key).digest();
  }

  public static async getInstance() {
    const mutableStdout = new Writable({
      write: function (_chunk, _encoding, callback) {
        callback();
      },
    });

    var rl = createInterface({
      input: process.stdin,
      output: mutableStdout,
      terminal: true,
    });

    const result = await rl.question('Please encryption key:');
    let salt;

    if (!existsSync('salt.bin')) {
      salt = randomBytes(128);
      console.log('Generate new salt');
      writeFileSync('salt.bin', salt);
    } else {
      salt = readFileSync('salt.bin');
    }

    if (typeof salt === 'string') {
      throw new Error('Salt can not be string');
    }

    rl.close();
    return new EncryptionKey(result, salt);
  }

  public static encode(iv: Buffer, tag: Buffer, encryptedData: Buffer): Buffer {
    const buf = Buffer.alloc(iv.length + tag.length + encryptedData.length + 2);
    let offset = 0;
    buf.writeUInt8(iv.length, offset);
    offset += 1;
    iv.copy(buf, offset);
    offset += iv.length;
    buf.writeUInt8(tag.length, offset);
    offset += 1;
    tag.copy(buf, offset);
    offset += tag.length;
    encryptedData.copy(buf, offset);
    return buf;
  }

  public static decode(buf: Buffer): Buffer[] {
    let offset = 0;
    const ivLength = buf.readUInt8(offset++);
    const iv = buf.subarray(offset, (offset += ivLength));
    const tagLength = buf.readUInt8(offset++);
    const tag = buf.subarray(offset, (offset += tagLength));
    const encryptedData = buf.subarray(offset);
    return [iv, tag, encryptedData];
  }

  public encrypt(message: Buffer) {
    const iv = randomBytes(32); // Initialization Vector for AES-GCM
    const cipher = createCipheriv('aes-256-gcm', this.#secretKey, iv);
    const encryptedData = Buffer.concat([cipher.update(message), cipher.final()]);
    const tag = cipher.getAuthTag();
    return EncryptionKey.encode(iv, tag, encryptedData);
  }

  public decrypt(encryptedData: Buffer) {
    const [iv, tag, encryptedText] = EncryptionKey.decode(encryptedData);
    const decipher = createDecipheriv('aes-256-gcm', this.#secretKey, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  }
}

export default EncryptionKey;

EncryptionKey.getInstance();
