/**
 * Validation Utilities
 *
 * Centralized validation functions for API request validation.
 * Used by both POST and GET handlers to ensure data integrity.
 */
import { SharePayloadV1 } from '../types/share.ts';

/**
 * Maximum allowed payload size in bytes (100KB)
 * Enforced to prevent database bloat and ensure fast serialization/deserialization
 */
export const MAX_PAYLOAD_SIZE_BYTES = 100 * 1024; // 100KB

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
 * This performs lightweight validation:
 * - Version check (must be 1)
 * - Size check (must be <= 100KB)
 * - Basic structure validation (required fields present and correct types)
 *
 * Database constraints provide additional safety (defense in depth).
 *
 * @param payload - The payload to validate
 * @returns Validation result with error message if invalid
 */
export function validateSharePayload(payload: unknown): { valid: boolean; error?: string; size?: number } {
  // Type guard: ensure payload is an object
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Payload must be an object' };
  }

  const p = payload as Partial<SharePayloadV1>;

  // Validate version
  if (p.version !== 1) {
    return { valid: false, error: 'Invalid payload version (expected: 1)' };
  }

  // Validate canvas structure
  if (!p.canvas || typeof p.canvas !== 'object') {
    return { valid: false, error: 'Invalid canvas structure' };
  }
  if (typeof p.canvas.width !== 'number' || typeof p.canvas.height !== 'number') {
    return { valid: false, error: 'Invalid canvas dimensions (must be numbers)' };
  }

  // Validate entities array
  if (!Array.isArray(p.entities)) {
    return { valid: false, error: 'Invalid entities structure (must be array)' };
  }
  for (const entity of p.entities) {
    if (!entity || typeof entity !== 'object') {
      return { valid: false, error: 'Invalid entity structure' };
    }
    if (!entity.id || typeof entity.id !== 'string') {
      return { valid: false, error: 'Invalid entity ID (must be string)' };
    }
    if (entity.type !== 'player' && entity.type !== 'ball') {
      return { valid: false, error: 'Invalid entity type (must be "player" or "ball")' };
    }
    if (entity.team !== 'attack' && entity.team !== 'defence') {
      return { valid: false, error: 'Invalid entity team (must be "attack" or "defence")' };
    }
    if (typeof entity.x !== 'number' || typeof entity.y !== 'number') {
      return { valid: false, error: 'Invalid entity position (must be numbers)' };
    }
  }

  // Validate frames array
  if (!Array.isArray(p.frames)) {
    return { valid: false, error: 'Invalid frames structure (must be array)' };
  }
  for (const frame of p.frames) {
    if (!frame || typeof frame !== 'object') {
      return { valid: false, error: 'Invalid frame structure' };
    }
    if (typeof frame.t !== 'number') {
      return { valid: false, error: 'Invalid frame time (must be number)' };
    }
    if (!Array.isArray(frame.updates)) {
      return { valid: false, error: 'Invalid frame updates (must be array)' };
    }
    for (const update of frame.updates) {
      if (!update || typeof update !== 'object') {
        return { valid: false, error: 'Invalid frame update structure' };
      }
      if (!update.id || typeof update.id !== 'string') {
        return { valid: false, error: 'Invalid frame update ID (must be string)' };
      }
      if (typeof update.x !== 'number' || typeof update.y !== 'number') {
        return { valid: false, error: 'Invalid frame update position (must be numbers)' };
      }
    }
  }

  // Validate size
  const size = getPayloadSize(payload);
  if (size > MAX_PAYLOAD_SIZE_BYTES) {
    return {
      valid: false,
      error: `Payload too large: ${size.toLocaleString()} bytes (max: ${MAX_PAYLOAD_SIZE_BYTES.toLocaleString()} bytes)`,
      size
    };
  }

  return { valid: true, size };
}
