import { VALIDATION } from "../constants/validation";

/**
 * Validation utilities for the Rugby Animation Tool.
 */

/**
 * Validates a project name.
 * @param name - The project name
 * @returns true if valid, false otherwise
 */
export const validateProjectName = (name: string): boolean => {
    return name.length >= 1 && name.length <= VALIDATION.PROJECT.NAME_MAX_LENGTH;
};

/**
 * Validates a hex color string.
 * @param color - The color string
 * @returns true if valid, false otherwise
 */
export const validateHexColor = (color: string): boolean => {
    return VALIDATION.ENTITY.COLOR_PATTERN.test(color);
};

/**
 * Validates an entity label.
 * @param label - The entity label
 * @returns true if valid, false otherwise
 */
export const validateEntityLabel = (label: string): boolean => {
    return label.length <= VALIDATION.ENTITY.LABEL_MAX_LENGTH &&
        VALIDATION.ENTITY.LABEL_PATTERN.test(label);
};

/**
 * Validates canvas coordinates.
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns true if valid, false otherwise
 */
export const validateCoordinates = (x: number, y: number): boolean => {
    return x >= VALIDATION.ENTITY.COORD_MIN && x <= VALIDATION.ENTITY.COORD_MAX &&
        y >= VALIDATION.ENTITY.COORD_MIN && y <= VALIDATION.ENTITY.COORD_MAX;
};

/**
 * Validates frame duration.
 * @param duration - Duration in milliseconds
 * @returns true if valid, false otherwise
 */
export const validateFrameDuration = (duration: number): boolean => {
    return Number.isInteger(duration) &&
        duration >= VALIDATION.FRAME.DURATION_MIN_MS &&
        duration <= VALIDATION.FRAME.DURATION_MAX_MS;
};

/**
 * Validates a UUID v4 string (basic format check).
 * @param uuid - The UUID string
 * @returns true if valid, false otherwise
 */
export const validateUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};

/**
 * Validates a complete project object against the schema.
 * @param data - Unknown data to validate
 * @returns Object with success flag and error/warning messages
 */
export const validateProject = (data: unknown): {
    success: boolean;
    errors: string[];
    warnings: string[];
} => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Type guard: Check if data is an object
    if (!data || typeof data !== 'object') {
        errors.push('Invalid project data: expected an object');
        return { success: false, errors, warnings };
    }

    const project = data as Record<string, unknown>;

    // Required fields validation
    if (typeof project.version !== 'string') {
        errors.push('Missing or invalid "version" field');
    }
    if (typeof project.id !== 'string' || !validateUUID(project.id)) {
        errors.push('Missing or invalid "id" field (must be UUID)');
    }
    if (typeof project.name !== 'string' || !validateProjectName(project.name)) {
        errors.push('Missing or invalid "name" field');
    }
    if (!['rugby-union', 'rugby-league', 'soccer', 'american-football'].includes(project.sport as string)) {
        errors.push('Invalid "sport" field');
    }
    if (typeof project.createdAt !== 'string') {
        errors.push('Missing or invalid "createdAt" field');
    }
    if (typeof project.updatedAt !== 'string') {
        errors.push('Missing or invalid "updatedAt" field');
    }

    // Frames validation
    if (!Array.isArray(project.frames)) {
        errors.push('Missing or invalid "frames" field (must be array)');
    } else {
        if (project.frames.length === 0) {
            errors.push('Project must have at least one frame');
        }
        if (project.frames.length > VALIDATION.PROJECT.MAX_FRAMES) {
            errors.push(`Too many frames (max: ${VALIDATION.PROJECT.MAX_FRAMES})`);
        }

        // Validate each frame
        project.frames.forEach((frame: unknown, idx: number) => {
            if (!frame || typeof frame !== 'object') {
                errors.push(`Frame ${idx}: invalid frame object`);
                return;
            }
            const f = frame as Record<string, unknown>;

            if (typeof f.id !== 'string' || !validateUUID(f.id)) {
                errors.push(`Frame ${idx}: invalid id`);
            }
            if (typeof f.index !== 'number' || f.index !== idx) {
                errors.push(`Frame ${idx}: invalid index (expected ${idx})`);
            }
            if (typeof f.duration !== 'number' || !validateFrameDuration(f.duration)) {
                errors.push(`Frame ${idx}: invalid duration`);
            }
            if (!f.entities || typeof f.entities !== 'object') {
                errors.push(`Frame ${idx}: invalid entities object`);
            } else {
                // Validate entities
                Object.entries(f.entities as Record<string, unknown>).forEach(([entityId, entity]) => {
                    if (!entity || typeof entity !== 'object') {
                        errors.push(`Frame ${idx}, Entity ${entityId}: invalid entity object`);
                        return;
                    }
                    const e = entity as Record<string, unknown>;

                    if (typeof e.id !== 'string' || !validateUUID(e.id)) {
                        errors.push(`Frame ${idx}, Entity ${entityId}: invalid id`);
                    }
                    if (!['player', 'ball', 'cone', 'marker'].includes(e.type as string)) {
                        errors.push(`Frame ${idx}, Entity ${entityId}: invalid type`);
                    }
                    if (typeof e.x !== 'number' || typeof e.y !== 'number' || !validateCoordinates(e.x, e.y)) {
                        errors.push(`Frame ${idx}, Entity ${entityId}: invalid coordinates`);
                    }
                    if (typeof e.color !== 'string' || !validateHexColor(e.color)) {
                        warnings.push(`Frame ${idx}, Entity ${entityId}: invalid color format`);
                    }
                    if (typeof e.label !== 'string' || !validateEntityLabel(e.label)) {
                        warnings.push(`Frame ${idx}, Entity ${entityId}: invalid label`);
                    }
                    if (!['attack', 'defense', 'neutral'].includes(e.team as string)) {
                        errors.push(`Frame ${idx}, Entity ${entityId}: invalid team`);
                    }
                });
            }

            if (!Array.isArray(f.annotations)) {
                errors.push(`Frame ${idx}: invalid annotations (must be array)`);
            }
        });
    }

    // Settings validation
    if (!project.settings || typeof project.settings !== 'object') {
        errors.push('Missing or invalid "settings" object');
    } else {
        const s = project.settings as Record<string, unknown>;
        if (typeof s.showGrid !== 'boolean') {
            errors.push('Settings: invalid showGrid');
        }
        if (typeof s.gridSpacing !== 'number') {
            errors.push('Settings: invalid gridSpacing');
        }
        if (typeof s.defaultTransitionDuration !== 'number') {
            errors.push('Settings: invalid defaultTransitionDuration');
        }
        if (!['720p', '1080p'].includes(s.exportResolution as string)) {
            errors.push('Settings: invalid exportResolution');
        }
    }

    return {
        success: errors.length === 0,
        errors,
        warnings,
    };
};
