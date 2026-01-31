import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const SharePayloadSchema = z.object({
  version: z.literal(1),
  canvas: z.object({
    width: z.number(),
    height: z.number(),
  }),
  entities: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['player', 'ball']),
      team: z.enum(['attack', 'defence']),
      x: z.number(),
      y: z.number(),
    })
  ),
  frames: z.array(
    z.object({
      t: z.number(),
      updates: z.array(
        z.object({
          id: z.string(),
          x: z.number(),
          y: z.number(),
        })
      ),
    })
  ),
});

const MAX_PAYLOAD_SIZE_BYTES = 100000; // 100KB

function getPayloadSize(payload: unknown): number {
  return new TextEncoder().encode(JSON.stringify(payload)).length;
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Validate payload size
    const size = getPayloadSize(payload);
    if (size > MAX_PAYLOAD_SIZE_BYTES) {
      return NextResponse.json(
        { error: `Payload too large: ${size.toLocaleString()} bytes (max: ${MAX_PAYLOAD_SIZE_BYTES.toLocaleString()} bytes)` },
        { status: 413 }
      );
    }

    // Validate payload structure
    const result = SharePayloadSchema.safeParse(payload);
    if (!result.success) {
      const errorMsg = result.error.issues
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join('; ');
      return NextResponse.json(
        { error: `Validation failed: ${errorMsg}` },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = getSupabaseClient();

    // Insert into database
    const { data, error } = await supabase
      .from('shares')
      .insert({
        payload: payload,
        size_bytes: size
      })
      .select('id')
      .single();

    if (error) {
      console.error('[POST /api/share] Supabase insert failed:', error.message);
      return NextResponse.json(
        { error: 'Failed to create share link', code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id }, { status: 201 });

  } catch (error) {
    console.error('[POST /api/share] Unexpected error:', error);
    
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!hasUrl || !hasKey) {
      return NextResponse.json({
        error: 'Share Link feature not configured',
        message: 'Supabase environment variables are missing.',
        setupRequired: true
      }, { status: 500 });
    }

    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}
