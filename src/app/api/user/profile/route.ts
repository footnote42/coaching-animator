import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuth, isAuthError } from '@/lib/server/auth';
import { UpdateProfileSchema } from '@/lib/schemas/users';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_request: NextRequest) {
  console.log('[Profile API] GET request received');
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;
    const user = authResult;
    console.log('[Profile API] GET for user:', user.id);

    const supabase = await createSupabaseServerClient();
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('id, display_name, animation_count, role, created_at, max_animations, club_name, primary_strip_color, secondary_strip_color')
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
    console.log('[Profile API] GET returning profile:', JSON.stringify(response, null, 2));
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
  console.log('[Profile API] PUT request received');
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;
    const user = authResult;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: { code: 'INVALID_JSON', message: 'Invalid JSON body' } },
        { status: 400 }
      );
    }

    console.log('[Profile API] PUT body:', body);

    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) {
      console.error('[Profile API] Validation error:', parsed.error);
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      );
    }

    console.log('[Profile API] Updating profile for user:', user.id, 'with:', parsed.data);

    const supabase = await createSupabaseServerClient();
    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (parsed.data.display_name !== undefined) updateData.display_name = parsed.data.display_name;
    if (parsed.data.club_name !== undefined) updateData.club_name = parsed.data.club_name;
    if (parsed.data.primary_strip_color !== undefined) updateData.primary_strip_color = parsed.data.primary_strip_color;
    if (parsed.data.secondary_strip_color !== undefined) updateData.secondary_strip_color = parsed.data.secondary_strip_color;

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

    console.log('[Profile API] Profile updated successfully:', updated);
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
