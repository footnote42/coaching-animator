import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { validate, warnings, formatError } from '@/features/practice/engine';
import { PRACTICE_TAGS } from '@/lib/practice-tags';

const SKILL_DIR = path.join(process.cwd(), 'skill', 'coaching-animator');
const EXAMPLES_DIR = path.join(SKILL_DIR, 'examples');
const files = readdirSync(EXAMPLES_DIR).filter((f) => f.endsWith('.json'));

describe('skill worked examples', () => {
  it('has at least three examples', () => {
    expect(files.length).toBeGreaterThanOrEqual(3);
  });

  it.each(files)('%s validates with the engine', (file) => {
    const result = validate(readFileSync(path.join(EXAMPLES_DIR, file), 'utf8'));
    if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
    expect(result.ok).toBe(true);
  });

  it('04-attack-v-defence.json attacks up and raises no warning', () => {
    const result = validate(readFileSync(path.join(EXAMPLES_DIR, '04-attack-v-defence.json'), 'utf8'));
    if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
    expect(result.script.direction).toBe('up');
    expect(warnings(result.script)).toEqual([]);
  });
});

describe('SKILL.md', () => {
  const skill = readFileSync(path.join(SKILL_DIR, 'SKILL.md'), 'utf8');

  it('has name and description frontmatter', () => {
    expect(skill).toMatch(/^---\r?\nname: coaching-animator\r?\ndescription: .+/);
  });

  it('lists every fixed Tag, so it cannot drift from the app', () => {
    for (const tag of PRACTICE_TAGS) expect(skill).toContain(tag);
  });
});
