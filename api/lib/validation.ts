/**
 * Validation Utilities
 *
 * Centralized validation functions for API request validation.
 * Used by both POST and GET handlers to ensure data integrity.
 */
import { SharePayloadSchema } from './schema.ts';
import { SharePayloadV1 } from '../types/share.ts';

/**
 * Maximum allowed payload size in bytes (100KB)
 * Enforced to prevent database bloat and ensure fast serialization/deserialization
 */
export const MAX_PAYLOAD_SIZE_BYTES = 100000; // 100KB (Decimal)

/**
 * UUID v4 format regex
 * Pattern: 8-4-4-4-12 hexadecimal characters with version 4 indicator
 */
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a valid UUID v4.
 *
 * @param uuid - The string to validate
 * @returns true if the string is a valid UUID v4, false otherwise
 */
export function isValidUUID(uuid: string): boolean {
  return UUID_V4_REGEX.test(uuid);
}

/**
 * Calculates the size of a payload in bytes (UTF-8 encoding).
 *
 * @param payload - The payload to measure
 * @returns Size in bytes
 */
export function getPayloadSize(payload: unknown): number {
  return Buffer.byteLength(JSON.stringify(payload), 'utf8');
}

/**
 * Validates a SharePayloadV1 structure and size.
 *
 * This performs validation using Zod:
 * - Version check (must be 1)
 * - Size check (must be <= 100KB)
 * - Structural validation via Zod schema
 *
 * @param payload - The payload to validate
 * @returns Validation result with error message if invalid
 */
export function validateSharePayload(payload: unknown): { valid: boolean; error?: string; size?: number } {
  // 1. Check Payload Size first
  const size = getPayloadSize(payload);
  if (size > MAX_PAYLOAD_SIZE_BYTES) {
    return {
      valid: false,
      error: `Payload too large: ${size.toLocaleString()} bytes (max: ${MAX_PAYLOAD_SIZE_BYTES.toLocaleString()} bytes)`,
      size
    };
  }

  // 2. Validate Structure with Zod
  const result = SharePayloadSchema.safeParse(payload);

  if (!result.success) {
    // Format Zod errors into a readable string
    const errorMsg = result.error.issues
      .map(e => `${e.path.join('.')}: ${e.message}`)
      .join('; ');

    return {
      valid: false,
      error: `Validation failed: ${errorMsg}`,
      size
    };
  }

  return { valid: true, size };
}
