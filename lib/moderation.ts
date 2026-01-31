import { createSupabaseServerClient } from './supabase/server';

// Fallback blocklist (used if database is unavailable)
const FALLBACK_BLOCKLIST = [
  'fuck',
  'shit',
  'ass',
  'bitch',
  'damn',
  'crap',
  'piss',
  'dick',
  'cock',
  'pussy',
  'asshole',
  'bastard',
  'slut',
  'whore',
  'nigger',
  'faggot',
  'retard',
  'cunt',
];

// In-memory cache for blocklist
let blocklistCache: string[] | null = null;
let lastCacheUpdate = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch blocklist from database with caching
 */
async function getBlocklist(): Promise<string[]> {
  const now = Date.now();

  // Return cached blocklist if still fresh
  if (blocklistCache && (now - lastCacheUpdate) < CACHE_TTL_MS) {
    return blocklistCache;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('moderation_blocklist')
      .select('word')
      .eq('is_active', true);

    if (error) {
      console.warn('Failed to fetch blocklist from database, using fallback:', error);
      return FALLBACK_BLOCKLIST;
    }

    const words = data.map((row) => row.word.toLowerCase());
    blocklistCache = words.length > 0 ? words : FALLBACK_BLOCKLIST;
    lastCacheUpdate = now;

    return blocklistCache;
  } catch (error) {
    console.warn('Error fetching blocklist, using fallback:', error);
    return FALLBACK_BLOCKLIST;
  }
}

/**
 * Build regex from blocklist words
 */
function buildBlocklistRegex(words: string[]): RegExp {
  return new RegExp(`\\b(${words.join('|')})\\b`, 'gi');
}

export interface ModerationResult {
  passed: boolean;
  flaggedWords: string[];
}

export async function checkContent(text: string): Promise<ModerationResult> {
  if (!text) {
    return { passed: true, flaggedWords: [] };
  }

  const blocklist = await getBlocklist();
  const regex = buildBlocklistRegex(blocklist);
  const matches = text.match(regex);

  if (matches && matches.length > 0) {
    const uniqueWords = [...new Set(matches.map(w => w.toLowerCase()))];
    return {
      passed: false,
      flaggedWords: uniqueWords,
    };
  }

  return { passed: true, flaggedWords: [] };
}

export async function validateAnimationContent(data: {
  title?: string;
  description?: string;
  coaching_notes?: string;
}): Promise<ModerationResult> {
  const allText = [
    data.title ?? '',
    data.description ?? '',
    data.coaching_notes ?? '',
  ].join(' ');

  return checkContent(allText);
}
