const BLOCKLIST = [
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

const BLOCKLIST_REGEX = new RegExp(
  `\\b(${BLOCKLIST.join('|')})\\b`,
  'gi'
);

export interface ModerationResult {
  passed: boolean;
  flaggedWords: string[];
}

export function checkContent(text: string): ModerationResult {
  if (!text) {
    return { passed: true, flaggedWords: [] };
  }

  const matches = text.match(BLOCKLIST_REGEX);
  
  if (matches && matches.length > 0) {
    const uniqueWords = [...new Set(matches.map(w => w.toLowerCase()))];
    return {
      passed: false,
      flaggedWords: uniqueWords,
    };
  }

  return { passed: true, flaggedWords: [] };
}

export function validateAnimationContent(data: {
  title?: string;
  description?: string;
  coaching_notes?: string;
}): ModerationResult {
  const allText = [
    data.title ?? '',
    data.description ?? '',
    data.coaching_notes ?? '',
  ].join(' ');

  return checkContent(allText);
}
