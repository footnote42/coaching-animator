import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/share
 *
 * Creates a shareable link for an animation.
 *
 * Request Body: SharePayloadV1
 * Response: { id: string }
 *
 * Status: Phase 3.1 stub - full implementation in Phase 3.2
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers (allow all origins for now; restrict in Phase 3.2)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Phase 3.1: Return stub response
  return res.status(501).json({
    error: 'Not implemented yet',
    message: 'Phase 3.1 complete. Awaiting Phase 3.2 implementation.'
  });
}
