/**
 * Writes the published JSON Schema for the Practice Script from its Zod definition.
 * Run with `npm run generate:practice-schema`.
 */
import { writeFileSync } from 'node:fs';
import { z } from 'zod';
import { PracticeScriptSchema } from '../src/features/practice/schema.ts';

const out = new URL('../src/features/practice/practice-script.schema.json', import.meta.url);
const schema = z.toJSONSchema(PracticeScriptSchema, { io: 'input' });

writeFileSync(out, JSON.stringify({ title: 'Practice Script', ...schema }, null, 2) + '\n');
console.log(`Wrote ${out.pathname}`);
