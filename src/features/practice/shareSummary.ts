import { resolveStep, stepCount } from './engine';
import type { PracticeScript } from './schema';

/** Longest share-preview description, in characters, before it is trimmed. */
export const SHARE_DESCRIPTION_MAX = 160;

/** Used when a Practice has no description of its own and no summary can be built. */
export const DEFAULT_SHARE_DESCRIPTION = 'Watch this rugby Practice Step by Step.';

function plural(count: number, singular: string): string {
  return `${count} ${count === 1 ? singular : `${singular}s`}`;
}

/** Collapses whitespace and trims to at most `max` characters, ending in an ellipsis when cut. */
function trimToLength(text: string, max: number): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const base = lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[\s.,;:!?-]+$/, '')}…`;
}

/**
 * Description for link previews of a Practice. Uses the Practice's own description
 * when it has one, otherwise a summary of what the share page already shows: the
 * players on the base Step (attackers and defenders, as the Gallery counts them)
 * and the Progressions. `script` must already be validated.
 */
export function buildShareDescription(
  practice: { description: string | null | undefined },
  script: PracticeScript,
): string {
  const own = practice.description?.trim();
  if (own) return trimToLength(own, SHARE_DESCRIPTION_MAX);

  const players = resolveStep(script, 0).markers.filter((m) => m.kind === 'attacker' || m.kind === 'defender').length;
  const progressions = stepCount(script) - 1;
  return `${plural(players, 'player')} · ${plural(progressions, 'Progression')}`;
}
