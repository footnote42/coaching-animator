import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuth, isAuthError } from '@/lib/server/auth';
import { UpdateProfileSchema } from '@/lib/schemas/users';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/server/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;
    const user = authResult;

    const supabase = await createSupabaseServerClient();
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('id, display_name, animation_count, role, created_at, max_animations, club_name, primary_strip_color, secondary_strip_color, club_badge_url')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      console.error('[Profile API] GET error:', error);
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Profile not found' } },
        { status: 404 }
      );
    }

    const response = {
      ...profile,
      email: user.email,
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error('[Profile API] Fatal GET Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;
    const user = authResult;

    // Rate limit: prevent profile update spam
    const rateLimitResult = await checkRateLimit(user.id, 'profile_update');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: { code: 'INVALID_JSON', message: 'Invalid JSON body' } },
        { status: 400 }
      );
    }


    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) {
      console.error('[Profile API] Validation error:', parsed.error);
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      );
    }


    const supabase = await createSupabaseServerClient();
    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (parsed.data.display_name !== undefined) updateData.display_name = parsed.data.display_name;
    if (parsed.data.club_name !== undefined) updateData.club_name = parsed.data.club_name;
    if (parsed.data.primary_strip_color !== undefined) updateData.primary_strip_color = parsed.data.primary_strip_color;
    if (parsed.data.secondary_strip_color !== undefined) updateData.secondary_strip_color = parsed.data.secondary_strip_color;
    if (parsed.data.club_badge_url !== undefined) updateData.club_badge_url = parsed.data.club_badge_url;

    const { data: updated, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.id)
      .select('id, display_name, updated_at')
      .single();

    if (error) {
      console.error('[Profile API] Database error:', error);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to update profile' } },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[Profile API] Fatal PUT Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
