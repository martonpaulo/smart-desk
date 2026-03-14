import { afterEach, describe, expect, it } from 'vitest';

import { decrypt, encrypt } from '@/lib/crypto';

const ORIGINAL_ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const TEST_ENCRYPTION_KEY = '12345678901234567890123456789012';

afterEach(() => {
  if (ORIGINAL_ENCRYPTION_KEY === undefined) {
    delete process.env.ENCRYPTION_KEY;
    return;
  }

  process.env.ENCRYPTION_KEY = ORIGINAL_ENCRYPTION_KEY;
});

describe('crypto helpers', () => {
  it('encrypts and decrypts plaintext with a valid key', () => {
    process.env.ENCRYPTION_KEY = TEST_ENCRYPTION_KEY;

    const plaintext = 'smart-desk-test';
    const encrypted = encrypt(plaintext);
    const decrypted = decrypt(encrypted);

    expect(encrypted).not.toBe(plaintext);
    expect(decrypted).toBe(plaintext);
  });

  it('throws when key is missing', () => {
    delete process.env.ENCRYPTION_KEY;

    expect(() => encrypt('hello')).toThrowError(/ENCRYPTION_KEY is missing/);
  });
});
