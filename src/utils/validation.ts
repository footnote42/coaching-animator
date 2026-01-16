import { VALIDATION } from "../constants/validation";
import { Project, Frame, Entity, Annotation } from "../types";

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

// ... more complex validation logic can be added as needed for Project and other structures
