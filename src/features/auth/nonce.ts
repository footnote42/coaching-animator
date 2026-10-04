/**
 * Nonce handling for Google Identity Services + Supabase signInWithIdToken.
 * Google gets the SHA-256 hex of the nonce (it embeds that in the ID token);
 * Supabase gets the raw nonce and hashes it again to compare.
 */

export interface GoogleNonce {
  raw: string;
  hashed: string;
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return toHex(new Uint8Array(digest));
}

/** 32 random bytes as 64 hex characters. */
export function randomNonce(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(32)));
}

export async function createGoogleNonce(): Promise<GoogleNonce> {
  const raw = randomNonce();
  return { raw, hashed: await sha256Hex(raw) };
}
