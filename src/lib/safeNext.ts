export const DEFAULT_NEXT = '/practice';

/**
 * Returns `next` only if it is a same-origin path: a single leading slash, no
 * backslash and no control characters. Anything else (absolute URLs,
 * protocol-relative `//host`, `@host`, empty or missing) gives `fallback`.
 *
 * `next` is checked as received. A percent-encoded `/%2F%2Fevil` passes: it is
 * a literal path segment when appended to the origin, not a host.
 */
export function safeNext(next: string | null | undefined, fallback: string = DEFAULT_NEXT): string {
  if (typeof next !== 'string' || next === '') return fallback;
  if (!/^\/(?!\/)/.test(next)) return fallback;
  // eslint-disable-next-line no-control-regex
  if (/[\\\u0000-\u001f\u007f]/.test(next)) return fallback;
  return next;
}
