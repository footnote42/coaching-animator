import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { putWithRetry } from './api-client';

const NO_RETRY = { maxRetries: 0 };

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('putWithRetry error normalisation', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('uses a string error body as the error message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: 'Name is too long' }, 400)));

    const result = await putWithRetry('/api/user/profile', {}, NO_RETRY);

    expect(result).toEqual({ ok: false, status: 400, error: 'Name is too long' });
  });

  it('reads message and code from an object error body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({ error: { code: 'INVALID_NAME', message: 'Display name is invalid' } }, 422)
      )
    );

    const result = await putWithRetry('/api/user/profile', {}, NO_RETRY);

    expect(result).toEqual({
      ok: false,
      status: 422,
      error: 'Display name is invalid',
      code: 'INVALID_NAME',
    });
  });

  it('falls back to a status message when the object error has no string message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: { code: 'X', message: 42 } }, 400)));

    const result = await putWithRetry('/api/user/profile', {}, NO_RETRY);

    expect(result).toEqual({ ok: false, status: 400, error: 'Request failed with status 400', code: 'X' });
  });

  it('falls back to a status message when the body is missing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Bad gateway', { status: 404 })));

    const result = await putWithRetry('/api/user/profile', {}, NO_RETRY);

    expect(result).toEqual({ ok: false, status: 404, error: 'Request failed with status 404' });
    expect(result).not.toHaveProperty('code');
  });
});
