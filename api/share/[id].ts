/**
 * GET /api/share/:id
 *
 * Retrieves a shared animation payload by UUID.
 *
 * Path Params: id (UUID)
 * Response: SharePayloadV1
 *
 * Status Codes:
 * - 200: Share retrieved successfully
 * - 400: Invalid UUID format
 * - 404: Share not found
 * - 410: Share expired
 * - 405: Method not allowed (non-GET)
 * - 500: Server error (Supabase failure or missing env vars)
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from '../lib/supabase.ts';
import { isValidUUID } from '../lib/validation.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Configuration (environment-aware)
  const frontendUrl = process.env.FRONTEND_URL;
  const allowedOrigin = process.env.NODE_ENV === 'production'
    ? frontendUrl  // Production: require explicit URL
    : (frontendUrl || '*');  // Development: allow wildcard if not set

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Validate HTTP method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract and validate ID parameter
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid share ID format' });
    }

    // Validate UUID format
    if (!isValidUUID(id)) {
      console.error('[GET /api/share/:id] Invalid UUID format:', id);
      return res.status(400).json({ error: 'Invalid share ID format' });
    }

    // Get Supabase client (throws if env vars missing)
    const supabase = getSupabaseClient();

    // Query share from database
    const { data, error } = await supabase
      .from('shares')
      .select('payload, expires_at')
      .eq('id', id)
      .maybeSingle();  // Use maybeSingle() to gracefully handle non-existent shares

    if (error) {
      console.error('[GET /api/share/:id] Supabase query failed:', error);

      const response: any = { error: 'Failed to retrieve share' };
      if (process.env.NODE_ENV === 'development') {
        response.details = error.message;
      }

      return res.status(500).json(response);
    }

    // Check if share exists
    if (!data) {
      console.error('[GET /api/share/:id] Share not found:', id);
      return res.status(404).json({ error: 'Share not found' });
    }

    // Check if share is expired
    const expiresAt = new Date(data.expires_at);
    const now = new Date();

    if (expiresAt < now) {
      console.error('[GET /api/share/:id] Share expired:', id, 'Expired at:', expiresAt.toISOString());
      return res.status(410).json({
        error: 'Share expired',
        expiredAt: expiresAt.toISOString()
      });
    }

    // Update last_accessed_at (fire-and-forget, non-blocking)
    // Don't await - we don't want to delay the user's response
    supabase
      .from('shares')
      .update({ last_accessed_at: now.toISOString() })
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.warn('[GET /api/share/:id] Failed to update last_accessed_at:', error.message);
        }
      });

    // Success - return payload
    console.log('[GET /api/share/:id] Share retrieved:', id);
    return res.status(200).json(data.payload);

  } catch (error) {
    // Catch-all for unexpected errors (e.g., missing env vars)
    console.error('[GET /api/share/:id] Unexpected error:', error);

    const response: any = { error: 'Failed to retrieve share' };
    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
      response.details = error.message;
    }

    return res.status(500).json(response);
  }
}
