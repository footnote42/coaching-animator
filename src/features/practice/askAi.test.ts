import { describe, it, expect } from 'vitest';
import { buildAskAiPrompt, SKILL_RAW_URL } from '@/features/practice/askAi';

describe('buildAskAiPrompt', () => {
  it('points at the skill and carries the script', () => {
    const prompt = buildAskAiPrompt('{"schemaVersion":1}');
    expect(prompt).toContain(SKILL_RAW_URL);
    expect(prompt).toContain('{"schemaVersion":1}');
    expect(SKILL_RAW_URL).toBe(
      'https://raw.githubusercontent.com/footnote42/coaching-animator/main/skill/coaching-animator/SKILL.md',
    );
  });
});
