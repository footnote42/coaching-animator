import { cache } from 'react';
import { getSharedPractice, type SharedPractice } from '@/lib/server/practices';
import { validate } from '@/features/practice/engine';
import type { PracticeScript } from '@/features/practice/schema';

export interface LoadedPractice {
  practice: SharedPractice;
  script: PracticeScript;
}

/**
 * A shared Practice with a valid script, or null (missing, deleted, private to
 * someone else, or a script this app can no longer read). Cached per request so
 * metadata and the page share one lookup.
 */
export const loadPractice = cache(async (id: string): Promise<LoadedPractice | null> => {
  const practice = await getSharedPractice(id);
  if (!practice) return null;
  const result = validate(practice.script);
  if (!result.ok) {
    console.error('[Practice Share] Stored script failed validation:', id);
    return null;
  }
  return { practice, script: result.script };
});
