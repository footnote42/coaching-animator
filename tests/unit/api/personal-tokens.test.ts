import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  requireNotBanned: vi.fn(),
  checkRateLimit: vi.fn(),
  from: vi.fn(),
}));

vi.mock('@/lib/server/auth', () => ({
  requireAuth: mocks.requireAuth,
  requireNotBanned: mocks.requireNotBanned,
  requireAgeConfirmed: vi.fn(async () => null),
  isAuthError: (r: unknown) => r instanceof NextResponse,
}));

vi.mock('@/lib/server/rate-limit', () => ({
  checkRateLimit: mocks.checkRateLimit,
  getRateLimitHeaders: () => ({}),
}));

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => ({ from: mocks.from }),
}));

import { GET, POST } from '@/app/api/user/tokens/route';
import { DELETE } from '@/app/api/user/tokens/[id]/route';

function builder(result: unknown) {
  const b: Record<string, unknown> = {};
  for (const m of ['select', 'insert', 'update', 'eq', 'is', 'order', 'range', 'single']) {
    b[m] = vi.fn(() => b);
  }
  b.then = (resolve: (v: unknown) => unknown) => resolve(result);
  return b;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  mocks.requireAuth.mockResolvedValue({ id: 'user-1' });
  mocks.requireNotBanned.mockResolvedValue(null);
  mocks.checkRateLimit.mockResolvedValue({ allowed: true, remaining: 5, resetAt: new Date() });
});

describe('Tokens API', () => {
  describe('GET list', () => {
    it('returns tokens without hash or plaintext', async () => {
      const rows = [
        { id: '1', name: 't1', created_at: 'now', last_used_at: null, revoked_at: null }
      ];
      const b = builder({ data: rows, error: null });
      mocks.from.mockReturnValue(b);
      
      const req = new NextRequest('http://localhost/api/user/tokens');
      const res = await GET(req);
      
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.tokens).toEqual(rows);
      expect(b.select).toHaveBeenCalledWith('id, name, created_at, last_used_at, revoked_at');
    });
  });

  describe('POST create', () => {
    function postReq(body: unknown) {
      return new NextRequest('http://localhost/api/user/tokens', {
        method: 'POST',
        body: JSON.stringify(body)
      });
    }

    it('enforces cap of 10', async () => {
      const b = builder({ count: 10, error: null });
      mocks.from.mockReturnValue(b);
      const res = await POST(postReq({ name: 'my token' }));
      expect(res.status).toBe(400);
      expect((await res.json()).error.message).toContain('Maximum');
    });

    it('returns plaintext once and stores only hash', async () => {
      const countBuilder = builder({ count: 0, error: null });
      const insertBuilder = builder({ 
        data: { id: 'uuid', name: 'my token' }, 
        error: null 
      });
      
      mocks.from.mockImplementation(() => {
        if (mocks.from.mock.calls.length === 1) return countBuilder;
        return insertBuilder;
      });

      const res = await POST(postReq({ name: 'my token' }));
      expect(res.status).toBe(200);
      const json = await res.json();
      
      expect(json.plaintext).toMatch(/^ca_pat_[A-Za-z0-9_-]+$/);
      expect(json.token.name).toBe('my token');
      
      const expectedHash = createHash('sha256').update(json.plaintext).digest('hex');
      expect(insertBuilder.insert).toHaveBeenCalledWith({
        owner_id: 'user-1',
        name: 'my token',
        token_hash: expectedHash
      });
    });

    it('enforces rate limit', async () => {
      mocks.checkRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt: new Date() });
      const res = await POST(postReq({ name: 'x' }));
      expect(res.status).toBe(429);
    });
  });

  describe('DELETE revoke', () => {
    it('sets revoked_at immediately', async () => {
      const b = builder({ error: null });
      mocks.from.mockReturnValue(b);
      
      const req = new NextRequest('http://localhost/api/user/tokens/123', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      
      expect(res.status).toBe(200);
      expect(b.update).toHaveBeenCalledWith({ revoked_at: expect.any(String) });
      expect(b.eq).toHaveBeenCalledWith('id', '123');
      expect(b.eq).toHaveBeenCalledWith('owner_id', 'user-1');
    });
  });
});
