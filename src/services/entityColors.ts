import { DESIGN_TOKENS } from '../constants/design-tokens';
import type { EntityType, TeamType } from '../types';

// Aliased constants for semantic clarity (insulates from array index changes)
const { neutral, attack, defense, primary, annotation } = DESIGN_TOKENS.colours;

/**
 * Semantic entity color defaults.
 * NOTE: These are domain assumptions (rugby coaching conventions), not UI constraints.
 * Future features (themes, accessibility modes, per-project palettes) may require
 * extending getDefault() to accept additional context parameters.
 */
const ENTITY_DEFAULTS = {
    ball: neutral[0],           // Ball White (User Preference)
    cone: neutral[2],           // Cone Yellow
    marker: primary,            // Pitch green
    'tackle-shield': defense[0], // Red/High vis
    'tackle-bag': attack[3],    // Purple/High vis
} as const;

const TEAM_DEFAULTS = {
    attack: attack[0],   // Blue
    defense: defense[0], // Red
    neutral: neutral[0], // White
} as const;

/**
 * Centralized entity color resolution service.
 * Single source of truth for all entity color assignments.
 * 
 * Dependency rule: Entities → EntityColors → DESIGN_TOKENS (never reverse)
 */
export const EntityColors = {
    /**
     * Get default color for an entity type and team.
     */
    getDefault(type: EntityType, team?: TeamType): string {
        // Players use team-based colors
        if (type === 'player') {
            return TEAM_DEFAULTS[team ?? 'neutral'];
        }

        // Equipment/objects use type-based colors (exhaustive switch)
        switch (type) {
            case 'ball':
                return ENTITY_DEFAULTS.ball;
            case 'cone':
                return ENTITY_DEFAULTS.cone;
            case 'tackle-shield':
                return ENTITY_DEFAULTS['tackle-shield'];
            case 'tackle-bag':
                return ENTITY_DEFAULTS['tackle-bag'];
            case 'marker':
                return ENTITY_DEFAULTS.marker;
        }
        // TypeScript exhaustiveness: if a new EntityType is added, this line becomes unreachable
        // and will cause a compile error
        const _exhaustiveCheck: never = type;
        return _exhaustiveCheck;
    },

    /**
     * Resolve a color with fallback for missing/null/empty values.
     * Treats empty strings as "no color set" for backwards compatibility.
     */
    resolve(color: string | undefined | null, type: EntityType, team?: TeamType): string {
        if (typeof color === 'string' && color.trim() !== '') return color;
        return this.getDefault(type, team);
    },

    /**
     * Default annotation color.
     * NOTE: Annotations are not entities, but included here for convenience.
     * If this service grows, consider renaming to DomainColors or splitting out.
     */
    annotation,
} as const;
