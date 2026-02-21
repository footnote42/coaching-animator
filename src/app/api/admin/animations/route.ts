import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/server/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const AdminAnimationsQuerySchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) return authResult;

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const query = AdminAnimationsQuerySchema.safeParse(searchParams);

  if (!query.success) {
    return NextResponse.json(
      { error: { code: 'INVALID_PARAMS', message: query.error.message } },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  let dbQuery = supabase
    .from('saved_animations')
    .select('id, title, animation_type, visibility, tags, created_at, user_id', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(query.data.offset, query.data.offset + query.data.limit - 1);

  if (query.data.search) {
    dbQuery = dbQuery.ilike('title', `%${query.data.search}%`);
  }

  const { data, error, count } = await dbQuery;

  if (error) {
    console.error('[Admin Animations API] GET error:', error);
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Failed to fetch animations' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ animations: data ?? [], total: count ?? 0 });
}

const ToggleTemplateSchema = z.object({
  id: z.string().uuid(),
  isTemplate: z.boolean(),
});

export async function PATCH(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) return authResult;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_BODY', message: 'Invalid JSON body' } },
      { status: 400 }
    );
  }

  const parsed = ToggleTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'INVALID_PARAMS', message: parsed.error.message } },
      { status: 400 }
    );
  }

  const { id, isTemplate } = parsed.data;
  const supabase = await createSupabaseServerClient();

  // Fetch current tags
  const { data: animation, error: fetchError } = await supabase
    .from('saved_animations')
    .select('tags')
    .eq('id', id)
    .single();

  if (fetchError || !animation) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Animation not found' } },
      { status: 404 }
    );
  }

  const currentTags: string[] = animation.tags || [];
  const hasTemplate = currentTags.includes('template');

  let newTags: string[];
  if (isTemplate && !hasTemplate) {
    newTags = [...currentTags, 'template'];
  } else if (!isTemplate && hasTemplate) {
    newTags = currentTags.filter(t => t !== 'template');
  } else {
    newTags = currentTags; // No change needed
  }

  const { error: updateError } = await supabase
    .from('saved_animations')
    .update({ tags: newTags })
    .eq('id', id);

  if (updateError) {
    console.error('[Admin Animations API] PATCH error:', updateError);
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Failed to update tags' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, tags: newTags });
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) return authResult;

  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_BODY', message: 'Invalid JSON body' } },
      { status: 400 }
    );
  }

  if (!body.id || typeof body.id !== 'string') {
    return NextResponse.json(
      { error: { code: 'MISSING_ID', message: 'Animation id is required' } },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('saved_animations')
    .delete()
    .eq('id', body.id);

  if (error) {
    console.error('[Admin Animations API] DELETE error:', error);
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Failed to delete animation' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
