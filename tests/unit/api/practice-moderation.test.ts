import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  requireAdmin: vi.fn(),
  requireAuth: vi.fn(),
  requireNotBanned: vi.fn(),
  checkRateLimit: vi.fn(),
  from: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock('@/lib/server/auth', () => ({
  getUser: mocks.getUser,
  requireAdmin: mocks.requireAdmin,
  requireAuth: mocks.requireAuth,
  requireNotBanned: mocks.requireNotBanned,
  isAuthError: (r: unknown) => r instanceof NextResponse,
}));
vi.mock('@/lib/server/rate-limit', () => ({
  checkRateLimit: mocks.checkRateLimit,
  getRateLimitHeaders: () => ({}),
}));
// Practice writes use the admin client (#175); both clients share one stub so call order is unchanged.
vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => ({ from: mocks.from, rpc: mocks.rpc }),
}));
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => ({ from: mocks.from, rpc: mocks.rpc }),
}));

import { POST as REPORT } from '@/app/api/practices/[id]/report/route';
import { POST as CREATE } from '@/app/api/practices/route';
import { PATCH } from '@/app/api/practices/[id]/route';
import { GET as LIST_REPORTS } from '@/app/api/admin/practice-reports/route';
import { POST as ACTION } from '@/app/api/admin/practice-reports/[id]/action/route';
import { GET as GET_PUBLIC } from '@/app/api/practices/public/route';

const id = '11111111-2222-4333-8444-555555555555';
const reportId = 'rep-1';
const user = { id: 'user-1' };
const banned = () => NextResponse.json({ error: { code: 'ACCOUNT_BANNED' } }, { status: 403 });

function json(url: string, body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest(url, { method: 'POST', body: JSON.stringify(body), headers });
}

/** Chainable query-builder stub that resolves to `result` at any terminal call. */
function builder(result: unknown) {
  const b: Record<string, unknown> = {};
  for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'in', 'order', 'range', 'ilike']) b[m] = vi.fn(() => b);
  b.single = vi.fn(async () => result);
  b.maybeSingle = vi.fn(async () => result);
  b.then = (resolve: (v: unknown) => unknown) => resolve(result);
  return b;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getUser.mockResolvedValue(user);
  mocks.requireAuth.mockResolvedValue(user);
  mocks.requireAdmin.mockResolvedValue({ id: 'admin-1' });
  mocks.requireNotBanned.mockResolvedValue(null);
  mocks.checkRateLimit.mockResolvedValue({ allowed: true, remaining: 1, resetAt: new Date() });
});

describe('POST /api/practices/[id]/report', () => {
  const ctx = { params: Promise.resolve({ id }) };
  const url = `http://localhost/api/practices/${id}/report`;
  const visible = (extra = {}) =>
    mocks.rpc.mockReturnValue(builder({ data: { id, owner_id: 'owner-1', visibility: 'public', ...extra }, error: null }));

  it('refuses banned accounts', async () => {
    mocks.requireNotBanned.mockResolvedValue(banned());
    const res = await REPORT(json(url, { reason: 'spam' }), ctx);
    expect(res.status).toBe(403);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('is rate limited per user', async () => {
    mocks.checkRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt: new Date() });
    expect((await REPORT(json(url, { reason: 'spam' }), ctx)).status).toBe(429);
    expect(mocks.checkRateLimit).toHaveBeenCalledWith('user:user-1', 'practice_report');
  });

  it('rate limits signed-out viewers by IP', async () => {
    mocks.getUser.mockResolvedValue(null);
    visible();
    mocks.from.mockReturnValue(builder({ error: null }));
    const res = await REPORT(json(url, { reason: 'spam' }, { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }), ctx);
    expect(res.status).toBe(201);
    expect(mocks.checkRateLimit).toHaveBeenCalledWith('ip:1.2.3.4', 'practice_report');
    expect(mocks.requireNotBanned).not.toHaveBeenCalled();
  });

  it('rejects an unknown reason', async () => {
    expect((await REPORT(json(url, { reason: 'boring' }), ctx)).status).toBe(400);
  });

  it('accepts safeguarding', async () => {
    visible();
    const b = builder({ error: null });
    mocks.from.mockReturnValue(b);
    const res = await REPORT(json(url, { reason: 'safeguarding', details: 'why' }), ctx);
    expect(res.status).toBe(201);
    expect(mocks.from).toHaveBeenCalledWith('practice_reports');
    expect(b.insert).toHaveBeenCalledWith({
      practice_id: id,
      reporter_id: 'user-1',
      reason: 'safeguarding',
      details: 'why',
    });
  });

  it('404s for a hidden or missing Practice', async () => {
    mocks.rpc.mockReturnValue(builder({ data: null, error: null }));
    expect((await REPORT(json(url, { reason: 'spam' }), ctx)).status).toBe(404);
  });

  it('404s for a private Practice', async () => {
    visible({ visibility: 'private' });
    expect((await REPORT(json(url, { reason: 'spam' }), ctx)).status).toBe(404);
  });

  it('refuses reporting your own Practice', async () => {
    visible({ owner_id: 'user-1' });
    expect((await REPORT(json(url, { reason: 'spam' }), ctx)).status).toBe(400);
  });
});

describe('banned accounts cannot save or publish', () => {
  it('POST /api/practices', async () => {
    mocks.requireNotBanned.mockResolvedValue(banned());
    const res = await CREATE(json('http://localhost/api/practices', { title: 'x', script: {} }));
    expect(res.status).toBe(403);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('PATCH /api/practices/[id]', async () => {
    mocks.requireNotBanned.mockResolvedValue(banned());
    const req = new NextRequest(`http://localhost/api/practices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ visibility: 'public' }),
    });
    expect((await PATCH(req, { params: Promise.resolve({ id }) })).status).toBe(403);
    expect(mocks.from).not.toHaveBeenCalled();
  });
});

describe('GET /api/practices/public', () => {
  it('excludes hidden Practices', async () => {
    const b = builder({ data: [], error: null });
    mocks.from.mockReturnValue(b);
    await GET_PUBLIC(new NextRequest('http://localhost/api/practices/public'));
    expect(b.eq).toHaveBeenCalledWith('hidden', false);
  });
});

describe('GET /api/admin/practice-reports', () => {
  const req = (q = '') => new NextRequest(`http://localhost/api/admin/practice-reports${q}`);

  it('rejects non-admins', async () => {
    mocks.requireAdmin.mockResolvedValue(NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 }));
    expect((await LIST_REPORTS(req())).status).toBe(403);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('rejects a bad status', async () => {
    expect((await LIST_REPORTS(req('?status=pending'))).status).toBe(400);
  });

  it('lists open reports with Practice and owner', async () => {
    const reports = builder({
      data: [{ id: reportId, practice_id: id, reporter_id: null, reason: 'spam', details: null, status: 'open', created_at: 't' }],
      error: null,
      count: 1,
    });
    const practices = builder({ data: [{ id, title: 'P', owner_id: 'owner-1', hidden: false }] });
    const profiles = builder({ data: [{ id: 'owner-1', display_name: 'Coach' }] });
    mocks.from.mockImplementation((t: string) =>
      t === 'practice_reports' ? reports : t === 'practices' ? practices : profiles
    );
    const res = await LIST_REPORTS(req());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(reports.eq).toHaveBeenCalledWith('status', 'open');
    expect(body.total).toBe(1);
    expect(body.reports[0].practice).toMatchObject({ id, title: 'P', owner_display_name: 'Coach' });
    expect(body.reports[0].reporter).toBeNull();
  });
});

describe('POST /api/admin/practice-reports/[id]/action', () => {
  const ctx = { params: Promise.resolve({ id: reportId }) };
  const act = (body: unknown) => ACTION(json(`http://localhost/api/admin/practice-reports/${reportId}/action`, body), ctx);

  function setup(reportStatus = 'open') {
    const tables: Record<string, ReturnType<typeof builder>> = {
      practice_reports: builder({ data: { id: reportId, status: reportStatus, practice_id: id }, error: null }),
      practices: builder({ data: { id, owner_id: 'owner-1' }, error: null }),
      user_profiles: builder({ error: null }),
    };
    mocks.from.mockImplementation((t: string) => tables[t]);
    return tables;
  }

  it('rejects non-admins', async () => {
    mocks.requireAdmin.mockResolvedValue(NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 }));
    expect((await act({ action: 'dismiss' })).status).toBe(403);
  });

  it('requires a reason to hide or ban', async () => {
    expect((await act({ action: 'hide' })).status).toBe(400);
    expect((await act({ action: 'ban_user' })).status).toBe(400);
  });

  it('dismisses an open report', async () => {
    const t = setup();
    const res = await act({ action: 'dismiss' });
    expect(res.status).toBe(200);
    expect((await res.json()).status).toBe('dismissed');
    expect(t.practice_reports.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'dismissed', resolved_by: 'admin-1' })
    );
  });

  it('hides the Practice and marks the report actioned', async () => {
    const t = setup();
    const res = await act({ action: 'hide', reason: 'bad' });
    expect(res.status).toBe(200);
    expect(t.practices.update).toHaveBeenCalledWith({ hidden: true });
    expect(t.practice_reports.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'actioned' }));
  });

  it('unhides without changing the report', async () => {
    const t = setup('actioned');
    const res = await act({ action: 'unhide' });
    expect(res.status).toBe(200);
    expect(t.practices.update).toHaveBeenCalledWith({ hidden: false });
    expect(t.practice_reports.update).not.toHaveBeenCalled();
  });

  it('deletes the Practice', async () => {
    const t = setup();
    const res = await act({ action: 'delete' });
    expect(res.status).toBe(200);
    expect(t.practices.delete).toHaveBeenCalled();
  });

  it('bans the owner', async () => {
    const t = setup();
    const res = await act({ action: 'ban_user', reason: 'abuse' });
    expect(res.status).toBe(200);
    expect(t.user_profiles.update).toHaveBeenCalledWith(expect.objectContaining({ ban_reason: 'abuse' }));
    expect(t.user_profiles.eq).toHaveBeenCalledWith('id', 'owner-1');
  });

  it('will not dismiss a processed report', async () => {
    setup('dismissed');
    expect((await act({ action: 'dismiss' })).status).toBe(400);
  });

  it('404s for an unknown report', async () => {
    mocks.from.mockReturnValue(builder({ data: null, error: null }));
    expect((await act({ action: 'dismiss' })).status).toBe(404);
  });
});
