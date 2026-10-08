/**
 * Geometry of a Tackle bag, shared by every Practice renderer. The bag is a
 * capsule (a box with fully rounded ends) taller than a tackle shield, with
 * one long side shaded to suggest a cylinder. Sizes are in marker radii so the
 * bag scales with the Area like every other marker.
 */

/** Across the bag, in marker radii (a tackle shield is 1.2). */
const BAG_WIDTH = 1.4;
/** Along the bag, in marker radii (a tackle shield is 2). */
const BAG_LENGTH = 2.8;
/** Where the shaded side starts, as a fraction of the half-width past the centre line. */
const SHADE_FROM = 0.3;

/** Fill laid over the shaded side of the bag. */
export const TACKLE_BAG_SHADE = 'rgba(0,0,0,0.32)';

export interface TackleBagShape {
  /** The bag's bounding box, top-left corner and size. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Corner radius that rounds each end into a half circle. */
  cornerRadius: number;
  /** SVG path data for the shaded side: right when upright, bottom when Lying. */
  shade: string;
}

/**
 * The bag centred on (x, y) with marker radius r. Upright it stands tall; Lying
 * it is turned 90 degrees, flat on the ground.
 */
export function tackleBagShape(x: number, y: number, r: number, lying = false): TackleBagShape {
  const across = r * BAG_WIDTH;
  const along = r * BAG_LENGTH;
  const end = across / 2;
  // Centres of the two rounded ends, along the bag from its middle.
  const ends = along / 2 - end;
  const d = end * SHADE_FROM;
  const rise = Math.sqrt(end * end - d * d);
  // (a, b) is (across, along) from the centre. Lying swaps the axes, which
  // mirrors the shape, so the arcs turn the other way.
  const at = (a: number, b: number) => (lying ? `${x + b} ${y + a}` : `${x + a} ${y + b}`);
  const sweep = lying ? 0 : 1;
  const shade = [
    `M ${at(d, -ends - rise)}`,
    `A ${end} ${end} 0 0 ${sweep} ${at(end, -ends)}`,
    `L ${at(end, ends)}`,
    `A ${end} ${end} 0 0 ${sweep} ${at(d, ends + rise)}`,
    'Z',
  ].join(' ');
  const [width, height] = lying ? [along, across] : [across, along];
  return { x: x - width / 2, y: y - height / 2, width, height, cornerRadius: end, shade };
}
