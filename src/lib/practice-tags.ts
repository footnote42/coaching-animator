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
