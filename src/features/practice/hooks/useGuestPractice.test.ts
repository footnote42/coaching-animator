import { describe, it, expect } from 'vitest';
import {
  DEVICE_PRACTICE_KEY,
  readDevicePractice,
  writeDevicePractice,
  clearDevicePractice,
  titleFor,
} from './useGuestPractice';

const memory = () => {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
};
const broken = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('quota');
  },
  removeItem: () => {
    throw new Error('blocked');
  },
};

describe('device Practice storage', () => {
  it('round-trips under one key', () => {
    const s = memory();
    expect(writeDevicePractice('{"a":1}', s)).toBe(true);
    expect(s.getItem(DEVICE_PRACTICE_KEY)).toBe('{"a":1}');
    expect(readDevicePractice(s)).toBe('{"a":1}');
  });
  it('clears on blank text and on clear', () => {
    const s = memory();
    writeDevicePractice('x', s);
    writeDevicePractice('  ', s);
    expect(readDevicePractice(s)).toBeNull();
    writeDevicePractice('x', s);
    clearDevicePractice(s);
    expect(readDevicePractice(s)).toBeNull();
  });
  it('reports failures instead of throwing', () => {
    expect(writeDevicePractice('x', broken)).toBe(false);
    expect(writeDevicePractice('x', null)).toBe(false);
    expect(readDevicePractice(broken)).toBeNull();
    expect(() => clearDevicePractice(broken)).not.toThrow();
  });
});

describe('titleFor', () => {
  it('uses the script title, else a default', () => {
    expect(titleFor('{"title":" Square "}')).toBe('Square');
    expect(titleFor('{"title":""}')).toBe('Untitled Practice');
    expect(titleFor('not json')).toBe('Untitled Practice');
  });
});
