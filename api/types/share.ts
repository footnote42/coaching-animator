/**
 * SharePayloadV1 - Version 1 of the animation share payload format
 *
 * This is the canonical type definition for shared animations, used by both
 * the Vercel Functions backend (api/) and frontend (src/) when implemented.
 *
 * Design constraints:
 * - Maximum payload size: 100KB (enforced in validation.ts)
 * - Version field enables future format migrations
 * - Minimal structure for efficient serialization
 */
export interface SharePayloadV1 {
  /** Payload format version (must be 1) */
  version: 1;

  /** Canvas dimensions */
  canvas: {
    width: number;
    height: number;
  };

  /** Entity definitions (players and balls) */
  entities: Array<{
    id: string;
    type: 'player' | 'ball';
    team: 'attack' | 'defence';
    x: number;  // Initial x position
    y: number;  // Initial y position
  }>;

  /** Animation frames (position updates over time) */
  frames: Array<{
    t: number;  // Time in seconds from animation start
    updates: Array<{
      id: string;  // Entity ID to update
      x: number;   // New x position
      y: number;   // New y position
    }>;
  }>;
}
