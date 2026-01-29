import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { requireAuth, isAuthError } from '../../../../lib/auth';
import { UpdateProfileSchema } from '../../../../lib/schemas/users';

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  const user = authResult;

  const supabase = await createSupabaseServerClient();
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('id, display_name, animation_count, role, created_at')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Profile not found' } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ...profile,
    email: user.email,
  });
}

export async function PUT(request: NextRequest) {
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

  const parsed = UpdateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: updated, error } = await supabase
    .from('user_profiles')
    .update({
      display_name: parsed.data.display_name,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select('id, display_name, updated_at')
    .single();

  if (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Failed to update profile' } },
      { status: 500 }
    );
  }

  return NextResponse.json(updated);
}
