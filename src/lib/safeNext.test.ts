import { describe, it, expect } from 'vitest';
import { safeNext } from '@/lib/safeNext';

describe('safeNext', () => {
  it('passes same-origin paths', () => {
    expect(safeNext('/practice')).toBe('/practice');
    expect(safeNext('/p/abc?x=1')).toBe('/p/abc?x=1');
    expect(safeNext('/reset-password')).toBe('/reset-password');
  });

  it.each(['//evil.example', '@evil.example', '/\\evil.example', 'https://evil.example', '', 'practice', '/a\\b', '/a\nb', '/a\tb', '/a\u0000b'])(
    'rejects %j',
    (bad) => {
      expect(safeNext(bad)).toBe('/practice');
    }
  );

  it('falls back for null and undefined', () => {
    expect(safeNext(null)).toBe('/practice');
    expect(safeNext(undefined)).toBe('/practice');
  });

  it('uses a custom fallback', () => {
    expect(safeNext('//evil.example', '/reset-password')).toBe('/reset-password');
  });

  it('documents encoded slashes: /%2F%2Fevil stays a literal path, not a host', () => {
    expect(safeNext('/%2F%2Fevil')).toBe('/%2F%2Fevil');
  });
});
