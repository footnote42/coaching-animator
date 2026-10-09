/**
 * The fixed Tag list (CONTEXT.md, Tag). The one source for the API validation
 * and the editor picker; the database check in
 * supabase/migrations/20260604000000_practice_tags.sql repeats it, and a test
 * keeps the two in step.
 */
export const PRACTICE_TAGS = [
  'Attack',
  'Defence',
  'Gain possession',
  'Go forward',
  'Support',
  'Continuity',
  'Pressure',
  'Score',
  'Contest possession',
  'Regain possession',
  'Pass / catch',
  'Tackling',
  'Footwork',
  'Agility',
  'Kicking',
  'Body control',
  'Fitness',
  'Attacking shape',
  'Defensive line',
  'Ruck / maul',
  'Scrum',
  'Lineout',
  'Offside',
  'Run forward / pass back',
  'Decision making',
  'Teamwork',
  'Awareness',
  'Self-organising',
] as const;

export type PracticeTag = (typeof PRACTICE_TAGS)[number];

export const MAX_PRACTICE_TAGS = 5;

/**
 * Display-only grouping of the Tag list for the editor's picker, following the
 * Principles of Play and the Trojans Player (Skills, Knowledge, Behaviours).
 * It changes nothing about which Tags are valid; a test keeps it covering
 * every Tag exactly once.
 */
export const PRACTICE_TAG_GROUPS: ReadonlyArray<{ name: string; tags: readonly PracticeTag[] }> = [
  {
    name: 'Principles of play',
    tags: ['Attack', 'Defence', 'Gain possession', 'Go forward', 'Support', 'Continuity', 'Pressure', 'Score', 'Contest possession', 'Regain possession'],
  },
  { name: 'Skills', tags: ['Pass / catch', 'Tackling', 'Footwork', 'Agility', 'Kicking', 'Body control', 'Fitness'] },
  {
    name: 'Knowledge',
    tags: ['Attacking shape', 'Defensive line', 'Ruck / maul', 'Scrum', 'Lineout', 'Offside', 'Run forward / pass back'],
  },
  { name: 'Behaviours', tags: ['Decision making', 'Teamwork', 'Awareness', 'Self-organising'] },
];
