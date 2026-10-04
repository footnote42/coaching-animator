import { describe, it, expect } from 'vitest';
import { createGoogleNonce, randomNonce, sha256Hex } from '@/features/auth/nonce';

describe('Google sign-in nonce', () => {
  it('hashes to the known SHA-256 hex vectors', async () => {
    expect(await sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
    expect(await sha256Hex('')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });

  it('generates a 64-character hex random nonce that differs each time', () => {
    const a = randomNonce();
    const b = randomNonce();
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toBe(b);
  });

  it('pairs the raw nonce with its SHA-256 hash', async () => {
    const { raw, hashed } = await createGoogleNonce();
    expect(hashed).toBe(await sha256Hex(raw));
    expect(hashed).not.toBe(raw);
    expect(hashed).toMatch(/^[0-9a-f]{64}$/);
  });
});
