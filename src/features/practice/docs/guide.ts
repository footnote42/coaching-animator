/**
 * The Practice Script guide (`guide.md`), with its tokens filled in: the site
 * origin, limits and speeds from the engine and schema, and the worked examples
 * from `examples/*.json`. Server-only: reads the markdown from disk.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  CELL_SIZE_M,
  MAX_AREA_SIDE_M,
  MAX_COACHING_POINTS,
  MAX_MARKERS,
  MAX_BALLS,
  MAX_PASSES,
  MAX_WAYPOINTS,
  AREA_TEMPLATES,
} from '@/features/practice/schema';
import { KICK_SPEED_MPS, MAX_SCRIPT_BYTES, PACE_SPEEDS_MPS, PASS_SPEED_MPS } from '@/features/practice/engine';
import {
  AREA_TEMPLATE_SIZES,
  FULL_PITCH_LENGTH_M,
  HALF_PITCH_LENGTH_M,
  PITCH_10_M,
  PITCH_22_M,
  PITCH_IN_GOAL_M,
} from '@/features/practice/area';
import passingSquareProgressions from '@/features/practice/examples/passing-square-progressions.json';
import halfPitchPlay from '@/features/practice/examples/half-pitch-play.json';

/** Worked examples embedded in the guide, keyed by file name without `.json`. */
export const GUIDE_EXAMPLES: Record<string, unknown> = {
  'passing-square-progressions': passingSquareProgressions,
  'half-pitch-play': halfPitchPlay,
};

const GUIDE_PATH = path.join(process.cwd(), 'src/features/practice/docs/guide.md');

function tokens(origin: string): Record<string, string | number> {
  const values: Record<string, string | number> = {
    ORIGIN: origin,
    CELL_SIZE_M,
    MAX_AREA_SIDE_M,
    MAX_COACHING_POINTS,
    MAX_MARKERS,
    MAX_BALLS,
    MAX_PASSES,
    MAX_WAYPOINTS,
    MAX_SCRIPT_BYTES,
    PASS_SPEED_MPS,
    KICK_SPEED_MPS,
    PITCH_IN_GOAL_M,
    HALF_PITCH_LENGTH_M,
    HALF_22_Y: PITCH_IN_GOAL_M + PITCH_22_M,
    HALF_10_Y: HALF_PITCH_LENGTH_M - PITCH_10_M,
    FULL_TRY_2_Y: FULL_PITCH_LENGTH_M - PITCH_IN_GOAL_M,
    FULL_22_2_Y: FULL_PITCH_LENGTH_M - PITCH_IN_GOAL_M - PITCH_22_M,
    FULL_10_2_Y: HALF_PITCH_LENGTH_M + PITCH_10_M,
  };
  for (const [pace, speed] of Object.entries(PACE_SPEEDS_MPS)) values[`PACE_${pace}`] = speed;
  for (const template of AREA_TEMPLATES) {
    const { width, length } = AREA_TEMPLATE_SIZES[template];
    values[`SIZE_${template}`] = `${width} x ${length} m`;
  }
  for (const [name, script] of Object.entries(GUIDE_EXAMPLES)) {
    values[`example:${name}`] = JSON.stringify(script, null, 2);
  }
  return values;
}

/** Fill `{{TOKEN}}` placeholders. Throws on an unknown token so a typo cannot ship. */
export function renderGuide(markdown: string, origin: string): string {
  const values = tokens(origin);
  return markdown.replace(/\{\{([\w:-]+)\}\}/g, (_, name: string) => {
    if (!(name in values)) throw new Error(`[Practice guide] Unknown token {{${name}}}`);
    return String(values[name]);
  });
}

/** The guide as markdown, ready to serve. */
export function loadGuide(origin: string): string {
  return renderGuide(readFileSync(GUIDE_PATH, 'utf8'), origin);
}
