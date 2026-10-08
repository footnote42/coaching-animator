import { DESIGN_TOKENS } from '@/shared/design-tokens';
import type { ResolvedMarker } from '@/features/practice/engine';

const { attack, defense, neutral, cone, coneOutline } = DESIGN_TOKENS.colours;

/** Dark outline for cones, so green and white ones show on the green Area. */
export const CONE_OUTLINE = coneOutline;

/** Coaches stand out from both teams and from the equipment colours. */
const COACH_COLOUR = '#EAB308';

/** Tackle bags are slate, like a stack of real bags, so they read apart from red shields. */
const TACKLE_BAG_COLOUR = '#64748B';

/** Fill colour for a marker. The single source of marker colours for every Practice renderer. */
export function markerColour(marker: Pick<ResolvedMarker, 'kind'> & Partial<Pick<ResolvedMarker, 'team' | 'colour'>>): string {
  switch (marker.kind) {
    case 'attacker':
    case 'defender': {
      const team = marker.team ?? (marker.kind === 'attacker' ? 'attack' : 'defence');
      return team === 'attack' ? attack[0] : defense[0];
    }
    case 'coach':
      return COACH_COLOUR;
    case 'ball':
      return neutral[0];
    case 'cone':
      return cone[marker.colour ?? 'yellow'];
    case 'tackle-shield':
      return defense[0];
    case 'tackle-bag':
      return TACKLE_BAG_COLOUR;
  }
}
