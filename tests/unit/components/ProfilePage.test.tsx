import { describe, it, expect } from 'vitest';
import { getInitials } from '@/app/profile/profileUtils';

describe('getInitials', () => {
  it('should return initials for a two-word name', () => {
    expect(getInitials('John Doe', 'john@example.com')).toBe('JD');
  });

  it('should return a single initial for a one-word name', () => {
    expect(getInitials('John', 'john@example.com')).toBe('J');
  });

  it('should return the first char of email if name is null', () => {
    expect(getInitials(null, 'john@example.com')).toBe('J');
  });

  it('should return "?" if both name and email are null', () => {
    expect(getInitials(null, null)).toBe('?');
  });

  it('should handle multiple words by taking first two', () => {
    expect(getInitials('John Quincy Adams', 'john@example.com')).toBe('JQ');
  });
});
