import { describe, expect, it } from 'vitest';
import { buildErrorDetails } from './error-details';

const base = { href: 'https://example.test/practice?id=1', time: '2026-10-10T09:00:00.000Z' };

describe('buildErrorDetails', () => {
  it('includes message, digest, stack, page and time', () => {
    const text = buildErrorDetails({ ...base, message: 'boom', digest: 'abc123', stack: 'Error: boom\n    at x' });
    expect(text).toBe(
      [
        'Coaching Animator error details',
        'Message: boom',
        'Digest: abc123',
        'Stack:',
        'Error: boom\n    at x',
        'Page: https://example.test/practice?id=1',
        'Time: 2026-10-10T09:00:00.000Z',
      ].join('\n'),
    );
  });

  it('omits digest and stack when absent and names a missing message', () => {
    const text = buildErrorDetails({ ...base, message: '' });
    expect(text).not.toContain('Digest:');
    expect(text).not.toContain('Stack:');
    expect(text).toContain('Message: (no message)');
  });
});
