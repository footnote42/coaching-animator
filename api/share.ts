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
import fs from 'fs';
import path from 'path';

// Force load .env.local in development if variables are missing
if (process.env.NODE_ENV !== 'production' && !process.env.SUPABASE_URL) {
  try {
    const cwd = process.cwd();
    console.log('[API] Current working directory:', cwd);
    console.log('[API] __dirname:', __dirname);

    // Try multiple possible locations
    const paths = [
      path.resolve(cwd, '.env.local'),
      path.resolve(cwd, '../.env.local'),
      path.resolve(__dirname, '../.env.local'),
      path.resolve(__dirname, '../../.env.local')
    ];

    let loaded = false;
    for (const p of paths) {
      if (fs.existsSync(p)) {
        console.log('[API] Found .env.local at:', p);
        const result = require('dotenv').config({ path: p });
        if (result.error) {
          console.error('[API] Error parsing .env.local:', result.error);
        } else {
          console.log('[API] Loaded env vars from file');
          loaded = true;
          break;
        }
      }
    }

    if (!loaded) {
      console.warn('[API] Could not find .env.local in any checked path:', paths);
    }

  } catch (e) {
    console.warn('[API] Failed to load .env.local manually:', e);
  }
}

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
      console.error('[POST /api/share] Supabase insert failed invididual props:', error.message, error.code, error.details, error.hint);
      console.error('[POST /api/share] Full error object:', JSON.stringify(error, null, 2));

      return res.status(500).json({
        error: 'Failed to create share: Supabase insert failed',
        details: error,
        message: error.message,
        code: error.code
      });
    }

    // Success - return UUID
    console.log('[POST /api/share] Share created:', data.id);
    return res.status(201).json({ id: data.id });

  } catch (error) {
    // Catch-all for unexpected errors (e.g., missing env vars)
    console.error('[POST /api/share] Unexpected error:', error);

    // Debug environment variables
    const hasUrl = !!process.env.SUPABASE_URL;
    const hasKey = !!process.env.SUPABASE_ANON_KEY;
    console.error('[API DEBUG] Env check - URL:', hasUrl, 'Key:', hasKey);

    // Check for missing environment variables specifically
    if (!hasUrl || !hasKey) {
      return res.status(500).json({
        error: 'Share Link feature not configured',
        message: 'Supabase environment variables are missing. Please see README.md for setup instructions.',
        setupRequired: true,
        missingVars: {
          SUPABASE_URL: hasUrl ? 'configured' : 'missing',
          SUPABASE_ANON_KEY: hasKey ? 'configured' : 'missing'
        }
      });
    }

    // @ts-ignore
    const message = error.message || 'Unknown error';
    
    return res.status(500).json({
      error: 'Failed to create share link',
      message: process.env.NODE_ENV === 'development' ? message : 'An unexpected error occurred. Please try again.',
      code: 'SHARE_CREATE_FAILED'
    });
  }
}
