import { resolveStep, validate, type ResolvedStep } from '@/features/practice/engine';

/** The landing page's example Practice: the skill's "3 v 2 overlap" example, base Step only. */
const HERO_SCRIPT = {
  schemaVersion: 1,
  title: '3 v 2 overlap',
  area: { width: 30, length: 20 },
  direction: 'up',
  markers: [
    { id: 'a1', kind: 'attacker', label: '1' },
    { id: 'a2', kind: 'attacker', label: '2' },
    { id: 'a3', kind: 'attacker', label: '3' },
    { id: 'ball', kind: 'ball' },
    { id: 'd1', kind: 'defender', label: 'D1' },
    { id: 'd2', kind: 'defender', label: 'D2' },
  ],
  base: {
    placements: [
      { marker: 'a1', cell: { x: 12, y: 17 } },
      { marker: 'a2', cell: { x: 17, y: 18 } },
      { marker: 'a3', cell: { x: 22, y: 19 } },
      { marker: 'ball', holder: 'a1' },
      { marker: 'd1', cell: { x: 13, y: 7 } },
      { marker: 'd2', cell: { x: 19, y: 7 } },
    ],
    moves: [
      { marker: 'a1', waypoints: [{ x: 12, y: 12 }], pace: 'jog' },
      { marker: 'a2', waypoints: [{ x: 17, y: 13 }], pace: 'jog' },
      // Sets off on the first catch, then sprints on to its catch point; the ball leads it, so the catch lands just behind 2 (a legal pass).
      { marker: 'a3', waypoints: [{ x: 22, y: 17 }, { x: 24, y: 4 }], pace: 'sprint', after: { pass: 'p1' } },
      { marker: 'd1', waypoints: [{ x: 13, y: 11 }], pace: 'jog' },
      { marker: 'd2', waypoints: [{ x: 18, y: 11 }], pace: 'jog' },
    ],
    passes: [
      { id: 'p1', from: 'a1', to: 'a2' },
      { id: 'p2', from: 'a2', to: 'a3', at: 0 },
    ],
    commentary: { points: ['Draw the defender, then pass, so the overlap runs into space'] },
  },
  progressions: [],
};

/** The base Step of the example Practice, or null if the engine ever rejects it. */
export function heroStep(): ResolvedStep | null {
  const result = validate(HERO_SCRIPT);
  return result.ok ? resolveStep(result.script, 0) : null;
}
