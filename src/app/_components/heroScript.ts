import { resolveStep, validate, type ResolvedStep } from '@/features/practice/engine';

/** The landing page's example Practice: a flowing 3 v 2 overlap, base Step only. */
export const HERO_SCRIPT = {
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
    // Everyone sets off at time zero; the engine times 2 and 3 onto the ball (ADR 0005).
    placements: [
      { marker: 'a1', cell: { x: 9, y: 17 } },
      { marker: 'a2', cell: { x: 13, y: 19 } },
      { marker: 'a3', cell: { x: 17, y: 19 } },
      { marker: 'ball', holder: 'a1' },
      { marker: 'd1', cell: { x: 7, y: 3 } },
      { marker: 'd2', cell: { x: 16, y: 4 } },
    ],
    moves: [
      // Carries straight, passes on the run (Release at waypoint 0) and runs on in support of 3.
      { marker: 'a1', waypoints: [{ x: 9, y: 13 }, { x: 11, y: 10 }, { x: 18, y: 6 }], pace: 'jog' },
      // Catches on the run, attacks the inside shoulder of D2, passes as D2 commits, then follows 3 in support.
      { marker: 'a2', waypoints: [{ x: 13, y: 14 }, { x: 14, y: 11 }, { x: 20, y: 7 }], pace: 'jog' },
      // Jogs wide to hold the width, then sprints onto the ball and on into space.
      {
        marker: 'a3',
        waypoints: [{ x: 23, y: 16 }, { x: 22, y: 12, pace: 'sprint' }, { x: 23, y: 3, pace: 'sprint' }],
        pace: 'jog',
      },
      // Comes up, drifts across off 1, then turns to cover across behind.
      { marker: 'd1', waypoints: [{ x: 9, y: 6 }, { x: 12, y: 7 }, { x: 19, y: 2 }], pace: 'jog' },
      // Drifts out towards 3, is drawn back in onto 2 as 2 passes, then turns and chases 3, too late.
      { marker: 'd2', waypoints: [{ x: 18, y: 7 }, { x: 15, y: 10 }, { x: 21, y: 4 }], pace: 'jog' },
    ],
    passes: [
      { id: 'p1', from: 'a1', to: 'a2', at: 0, release: 0 },
      // Draw and pass: 2 lets it go on the run (Release at waypoint 1) just as D2 arrives.
      { id: 'p2', from: 'a2', to: 'a3', at: 1, release: 1 },
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
