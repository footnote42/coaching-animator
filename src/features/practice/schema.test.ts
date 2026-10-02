import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { PracticeScriptSchema } from './schema';
import published from './practice-script.schema.json';

describe('published JSON Schema', () => {
  it('matches the Zod definition (run `npm run generate:practice-schema` if this fails)', () => {
    const generated = { title: 'Practice Script', ...z.toJSONSchema(PracticeScriptSchema, { io: 'input' }) };
    expect(published).toEqual(generated);
  });
});
