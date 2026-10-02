import { EntityColors } from '@/features/animation/services/entityColors';
import type { ResolvedMarker } from '@/features/practice/engine';

/** Fill colour for a marker, from EntityColors. Shared by every Practice renderer. */
export function markerColour(marker: Pick<ResolvedMarker, 'kind' | 'team'>): string {
  switch (marker.kind) {
    case 'attacker':
    case 'defender': {
      const team = marker.team ?? (marker.kind === 'attacker' ? 'attack' : 'defence');
      return EntityColors.getDefault('player', team === 'attack' ? 'attack' : 'defense');
    }
    case 'coach':
      return EntityColors.getDefault('player', 'other');
    case 'ball':
      return EntityColors.getDefault('ball');
    case 'cone':
      return EntityColors.getDefault('cone');
    case 'tackle-shield':
      return EntityColors.getDefault('tackle-shield');
  }
}
