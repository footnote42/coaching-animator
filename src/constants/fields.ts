import { SportType } from "../types";

/**
 * Field dimension constants for different sports.
 */

export const FIELD_DIMENSIONS: Record<SportType, { width: number; height: number; name: string }> = {
    'rugby-union': { width: 2000, height: 1400, name: 'Rugby Union' },
    'rugby-league': { width: 2000, height: 1360, name: 'Rugby League' },
    'soccer': { width: 2000, height: 1295, name: 'Soccer' },
    'american-football': { width: 2000, height: 1066, name: 'American Football' },
};
