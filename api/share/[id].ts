import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * GET /api/share/:id
 *
 * Retrieves a shared animation payload by UUID.
 *
 * Path Params: id (UUID)
 * Response: SharePayloadV1
 *
 * Status: Phase 3.1 stub - full implementation in Phase 3.2
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid share ID' });
  }

  // Phase 3.1: Return stub response
  return res.status(501).json({
    error: 'Not implemented yet',
    message: 'Phase 3.1 complete. Awaiting Phase 3.2 implementation.',
    requestedId: id
  });
}
