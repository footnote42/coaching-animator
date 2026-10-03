import { DESIGN_TOKENS } from '@/shared/design-tokens';
import type { ResolvedMarker } from '@/features/practice/engine';

const { attack, defense, neutral } = DESIGN_TOKENS.colours;

/** Coaches stand out from both teams and from the equipment colours. */
const COACH_COLOUR = '#EAB308';

/** Fill colour for a marker. The single source of marker colours for every Practice renderer. */
export function markerColour(marker: Pick<ResolvedMarker, 'kind' | 'team'>): string {
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
      return neutral[2];
    case 'tackle-shield':
      return defense[0];
  }
}
