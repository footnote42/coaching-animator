import { describe, expect, it } from 'vitest';
import { PRACTICE_TAGS, PRACTICE_TAG_GROUPS } from '@/lib/practice-tags';

describe('PRACTICE_TAG_GROUPS', () => {
  it('shows every Tag exactly once, in list order', () => {
    const grouped = PRACTICE_TAG_GROUPS.flatMap((g) => g.tags);
    expect(new Set(grouped).size).toBe(grouped.length);
    expect(grouped).toEqual([...PRACTICE_TAGS]);
  });
});
