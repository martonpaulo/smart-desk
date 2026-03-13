import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const AES_GCM_IV_BYTES = 12;
const AES_256_KEY_BYTES = 32;
const HEX_64_REGEX = /^[0-9a-fA-F]{64}$/;
const BASE64_REGEX = /^[A-Za-z0-9+/]+={0,2}$/;

function isHexKey(key: string): boolean {
  return HEX_64_REGEX.test(key);
}

function decodeBase64Key(key: string): Buffer | null {
  if (!BASE64_REGEX.test(key)) {
    return null;
  }

  try {
    return Buffer.from(key, 'base64');
  } catch {
    return null;
  }
}

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error('ENCRYPTION_KEY is missing. Set a 32-byte key.');
  }

  if (isHexKey(key)) {
    return Buffer.from(key, 'hex');
  }

  const base64Key = decodeBase64Key(key);
  if (base64Key?.length === AES_256_KEY_BYTES) {
    return base64Key;
  }

  const utf8Key = Buffer.from(key, 'utf8');
  if (utf8Key.length === AES_256_KEY_BYTES) {
    return utf8Key;
  }

  throw new Error(
    'ENCRYPTION_KEY must be 32 bytes (64-char hex, base64 for 32 bytes, or 32-char UTF-8).',
  );
}

export function encrypt(plaintext: string): string {
  const iv = randomBytes(AES_GCM_IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(ciphertext: string): string {
  const [ivHex, tagHex, encryptedHex] = ciphertext.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}
