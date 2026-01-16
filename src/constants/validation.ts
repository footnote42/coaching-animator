/**
 * Validation constants for the Rugby Animation Tool.
 */

export const VALIDATION = {
    PROJECT: {
        NAME_MAX_LENGTH: 100,
        MAX_FRAMES: 50,
        SUPPORTED_VERSIONS: ['1.0'] as const,
    },
    ENTITY: {
        LABEL_MAX_LENGTH: 10,
        LABEL_PATTERN: /^[\w\s\-\.]*$/,
        COLOR_PATTERN: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,
        COORD_MIN: 0,
        COORD_MAX: 2000,
    },
    FRAME: {
        DURATION_MIN_MS: 100,
        DURATION_MAX_MS: 10000,
        DURATION_DEFAULT_MS: 2000,
    },
    ANNOTATION: {
        MAX_POINTS: 100,
    },
    EXPORT: {
        TIMEOUT_BUFFER_MS: 5000,
        MAX_DURATION_MS: 300000,
        RESOLUTIONS: {
            '720p': { width: 1280, height: 720 },
            '1080p': { width: 1920, height: 1080 },
        },
    },
    STORAGE: {
        MAX_SIZE_BYTES: 5 * 1024 * 1024,
        AUTOSAVE_INTERVAL_MS: 30000,
    },
    RATE_LIMITS: {
        EXPORT_COOLDOWN_MS: 5000,
        SAVE_COOLDOWN_MS: 2000,
    },
} as const;
