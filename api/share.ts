/**
 * POST /api/share
 *
 * Creates a shareable link for an animation by storing the payload in Supabase.
 *
 * Request Body: SharePayloadV1
 * Response: { id: string } - UUID of the created share
 *
 * Status Codes:
 * - 201: Share created successfully
 * - 400: Invalid payload structure or version
 * - 413: Payload too large (>100KB)
 * - 405: Method not allowed (non-POST)
 * - 500: Server error (Supabase failure or missing env vars)
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from './lib/supabase.ts';
import { validateSharePayload, getPayloadSize } from './lib/validation.ts';
import type { SharePayloadV1 } from './types/share.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Configuration (environment-aware)
  const frontendUrl = process.env.FRONTEND_URL;
  const allowedOrigin = process.env.NODE_ENV === 'production'
    ? frontendUrl  // Production: require explicit URL
    : (frontendUrl || '*');  // Development: allow wildcard if not set

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Validate HTTP method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate payload structure and size
    const validation = validateSharePayload(req.body);
    if (!validation.valid) {
      console.error('[POST /api/share] Validation failed:', validation.error);

      // Return 413 for oversized payloads, 400 for other validation errors
      const statusCode = validation.error?.includes('too large') ? 413 : 400;
      const response: any = { error: validation.error };

      // Include size details only in development
      if (process.env.NODE_ENV === 'development' && validation.size) {
        response.details = `Payload size: ${validation.size.toLocaleString()} bytes`;
      }

      return res.status(statusCode).json(response);
    }

    // Get Supabase client (throws if env vars missing)
    const supabase = getSupabaseClient();

    // Calculate final size for database storage
    const sizeBytes = getPayloadSize(req.body);

    // Insert into database
    const { data, error } = await supabase
      .from('shares')
      .insert({
        payload: req.body as SharePayloadV1,
        size_bytes: sizeBytes
      })
      .select('id')
      .single();

    if (error) {
      console.error('[POST /api/share] Supabase insert failed:', error);

      const response: any = { error: 'Failed to create share' };
      if (process.env.NODE_ENV === 'development') {
        response.details = error.message;
      }

      return res.status(500).json(response);
    }

    // Success - return UUID
    console.log('[POST /api/share] Share created:', data.id);
    return res.status(201).json({ id: data.id });

  } catch (error) {
    // Catch-all for unexpected errors (e.g., missing env vars)
    console.error('[POST /api/share] Unexpected error:', error);

    const response: any = { error: 'Failed to create share' };
    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
      response.details = error.message;
    }

    return res.status(500).json(response);
  }
}
