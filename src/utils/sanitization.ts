/**
 * Sanitization utilities for the Rugby Animation Tool.
 */

/**
 * Strips HTML tags from a string.
 * @param input - The string to sanitize
 * @returns Sanitized string
 */
export const sanitizeString = (input: string): string => {
    return input.replace(/<[^>]*>?/gm, '').trim();
};

/**
 * Truncates a string to a maximum length.
 * @param input - The string to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
export const truncateString = (input: string, maxLength: number): string => {
    return input.length <= maxLength ? input : input.substring(0, maxLength);
};

/**
 * Sanitizes a project name by stripping HTML and truncating.
 * @param name - The project name
 * @param maxLength - Maximum length (defaults to 100)
 * @returns Sanitized project name
 */
export const sanitizeProjectName = (name: string, maxLength: number = 100): string => {
    return truncateString(sanitizeString(name), maxLength);
};
