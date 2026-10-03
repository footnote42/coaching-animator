import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHash } from 'node:crypto';

const rpc = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({ rpc })),
}));

import { verifyPersonalToken } from '../personal-tokens';

describe('verifyPersonalToken', () => {
  beforeEach(() => {
    rpc.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => vi.restoreAllMocks());

  it('hashes the plaintext token and returns owner_id if unrevoked', async () => {
    rpc.mockResolvedValueOnce({ data: 'owner-123', error: null });
    
    const owner = await verifyPersonalToken('my_secret_token');
    
    const expectedHash = createHash('sha256').update('my_secret_token').digest('hex');
    expect(rpc).toHaveBeenCalledWith('verify_personal_token', { p_hash: expectedHash });
    expect(owner).toBe('owner-123');
  });

  it('returns null if token does not exist or is revoked (rpc returns null)', async () => {
    rpc.mockResolvedValueOnce({ data: null, error: null });
    const owner = await verifyPersonalToken('my_secret_token');
    expect(owner).toBeNull();
  });

  it('returns null and logs error if rpc fails', async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { message: 'db error' } });
    const owner = await verifyPersonalToken('my_secret_token');
    expect(owner).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });
});
