import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { verifyPersonalToken } from '@/lib/server/personal-tokens';
import { requireNotBanned } from '@/lib/server/auth';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/server/rate-limit';
import { PracticeTagsSchema, SourceUrlSchema, SourceTitleSchema } from '@/lib/schemas/practices';
import { PRACTICE_TAGS } from '@/lib/practice-tags';
import { validate, formatError, MAX_SCRIPT_BYTES } from '@/features/practice/engine';
import { getSiteOrigin } from '@/lib/site-origin';
import type { Json } from '@/lib/supabase/database.types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * MCP over Streamable HTTP, stateless, JSON responses only (ADR 0004).
 *
 * Auth is a personal token. Queries use the service-role client, which bypasses
 * RLS, so EVERY query below is scoped with .eq('owner_id', ownerId). There is no
 * delete or publish tool, and visibility is never written except to insert
 * 'private'.
 */

const SERVER_INFO = { name: 'coaching-animator', version: '1.0.0' };
const DEFAULT_PROTOCOL = '2025-06-18';

const ERR = {
  parse: -32700,
  invalidRequest: -32600,
  methodNotFound: -32601,
  invalidParams: -32602,
  internal: -32603,
  unauthorized: -32001,
  rateLimited: -32002,
} as const;

type Id = string | number | null;

const rpcError = (id: Id, code: number, message: string) => ({ jsonrpc: '2.0' as const, id, error: { code, message } });
const rpcResult = (id: Id, result: unknown) => ({ jsonrpc: '2.0' as const, id, result });
const toolText = (text: string, isError = false) => ({
  content: [{ type: 'text', text }],
  ...(isError ? { isError: true } : {}),
});
const toolJson = (value: unknown) => toolText(JSON.stringify(value, null, 2));

const RequestSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number(), z.null()]).optional(),
  method: z.string(),
  params: z.record(z.string(), z.unknown()).optional(),
});

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/** Accepts a bare id, /p/<id> or /practice?id=<id> (full URL or path). Returns null when no id is present. */
function extractPracticeId(input: string): string | null {
  const m = input.trim().match(UUID);
  return m ? m[0].toLowerCase() : null;
}

const editorLink = (id: string) => `${getSiteOrigin()}/practice?id=${id}`;

const TitleSchema = z.string().trim().min(1).max(100);
const SourceSchema = z.object({ url: SourceUrlSchema.nullish(), title: SourceTitleSchema.nullish() });

// Visibility is deliberately absent. Unknown keys are stripped, so it can never be set.
const CreateArgs = z.object({
  script: z.unknown(),
  title: TitleSchema.optional(),
  tags: PracticeTagsSchema.optional(),
  source: SourceSchema.optional(),
});
const GetArgs = z.object({ id: z.string().min(1).max(2100) });
const UpdateArgs = z.object({
  id: z.string().min(1).max(2100),
  script: z.unknown().optional(),
  title: TitleSchema.optional(),
  tags: PracticeTagsSchema.optional(),
  source: SourceSchema.optional(),
});
const ListArgs = z.object({ limit: z.number().int().min(1).max(50).optional() });

const sourceProp = {
  type: 'object',
  description: 'Where the Practice came from. url must be https. Set when converting a video or page.',
  properties: { url: { type: 'string' }, title: { type: 'string' } },
  additionalProperties: false,
};
const tagsProp = {
  type: 'array',
  maxItems: 5,
  items: { type: 'string', enum: [...PRACTICE_TAGS] },
  description: 'Up to 5 Tags from the fixed list.',
};

const TOOLS = [
  {
    name: 'create_practice',
    description:
      "Save a new Practice Script to the Coach's account. It is always created private; the Coach publishes it from the editor. Returns the id and the editor link to give the Coach.",
    inputSchema: {
      type: 'object',
      properties: {
        script: { type: 'object', description: 'A Practice Script (see the guide at /practice-script/v1/guide.md).' },
        title: { type: 'string', maxLength: 100, description: "Defaults to the script's title." },
        tags: tagsProp,
        source: sourceProp,
      },
      required: ['script'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_practice',
    description: "Read one of the Coach's own Practices by id, or by a share or editor link (/p/<id>, /practice?id=<id>).",
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Practice id or link.' } },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_practice',
    description:
      "Change one of the Coach's own Practices: any of script, title, tags, source. Never changes visibility. Send the whole script, not a patch.",
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Practice id or link.' },
        script: { type: 'object' },
        title: { type: 'string', maxLength: 100 },
        tags: tagsProp,
        source: sourceProp,
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_my_practices',
    description: "List the Coach's own Practices, newest first: id, title, tags, updated_at and link.",
    inputSchema: {
      type: 'object',
      properties: { limit: { type: 'integer', minimum: 1, maximum: 50, description: 'Default 20.' } },
      additionalProperties: false,
    },
  },
];

type Admin = ReturnType<typeof createSupabaseAdminClient>;

function checkScript(script: unknown) {
  if (script === undefined || script === null) return { ok: false as const, text: 'script is required' };
  if (new TextEncoder().encode(JSON.stringify(script)).length > MAX_SCRIPT_BYTES) {
    return { ok: false as const, text: `Script is too large: the limit is ${MAX_SCRIPT_BYTES} bytes` };
  }
  const result = validate(script);
  if (!result.ok) {
    return { ok: false as const, text: ['The Practice Script is not valid:', ...result.errors.map(formatError)].join('\n') };
  }
  return { ok: true as const, schemaVersion: result.script.schemaVersion, title: result.script.title };
}

const PRACTICE_COLUMNS = 'id, title, tags, source_url, source_title, visibility, schema_version, updated_at';

async function callTool(name: string, args: unknown, ownerId: string, db: Admin) {
  switch (name) {
    case 'create_practice': {
      const p = CreateArgs.safeParse(args ?? {});
      if (!p.success) return toolText(`Invalid arguments: ${p.error.message}`, true);
      const checked = checkScript(p.data.script);
      if (!checked.ok) return toolText(checked.text, true);
      const title = p.data.title ?? (checked.title?.trim() || 'Untitled Practice');
      const { data, error } = await db
        .from('practices')
        .insert({
          owner_id: ownerId,
          title: title.slice(0, 100),
          visibility: 'private',
          tags: p.data.tags ?? [],
          source_url: p.data.source?.url ?? null,
          source_title: p.data.source?.title ?? null,
          script: p.data.script as Json,
          schema_version: checked.schemaVersion,
        })
        .select('id')
        .single();
      if (error || !data) {
        console.error('[MCP API] Insert error:', error);
        return toolText('Failed to save the Practice', true);
      }
      return toolJson({ id: data.id, visibility: 'private', link: editorLink(data.id) });
    }

    case 'get_practice': {
      const p = GetArgs.safeParse(args ?? {});
      if (!p.success) return toolText(`Invalid arguments: ${p.error.message}`, true);
      const id = extractPracticeId(p.data.id);
      if (!id) return toolText('Practice not found', true);
      const { data, error } = await db
        .from('practices')
        .select(`${PRACTICE_COLUMNS}, script`)
        .eq('id', id)
        .eq('owner_id', ownerId)
        .maybeSingle();
      if (error) {
        console.error('[MCP API] Get error:', error);
        return toolText('Failed to read the Practice', true);
      }
      if (!data) return toolText('Practice not found', true);
      return toolJson({
        id: data.id,
        title: data.title,
        script: data.script,
        tags: data.tags,
        source: { url: data.source_url, title: data.source_title },
        visibility: data.visibility,
        link: editorLink(data.id),
      });
    }

    case 'update_practice': {
      const p = UpdateArgs.safeParse(args ?? {});
      if (!p.success) return toolText(`Invalid arguments: ${p.error.message}`, true);
      const id = extractPracticeId(p.data.id);
      if (!id) return toolText('Practice not found', true);
      const update: Record<string, unknown> = {};
      if (p.data.title !== undefined) update.title = p.data.title;
      if (p.data.tags !== undefined) update.tags = p.data.tags;
      if (p.data.source !== undefined) {
        if (p.data.source.url !== undefined) update.source_url = p.data.source.url;
        if (p.data.source.title !== undefined) update.source_title = p.data.source.title;
      }
      if (p.data.script !== undefined) {
        const checked = checkScript(p.data.script);
        if (!checked.ok) return toolText(checked.text, true);
        update.script = p.data.script as Json;
        update.schema_version = checked.schemaVersion;
      }
      if (Object.keys(update).length === 0) return toolText('Nothing to update', true);
      const { data, error } = await db
        .from('practices')
        .update(update)
        .eq('id', id)
        .eq('owner_id', ownerId)
        .select('id');
      if (error) {
        console.error('[MCP API] Update error:', error);
        return toolText('Failed to update the Practice', true);
      }
      if (!data || data.length === 0) return toolText('Practice not found', true);
      return toolJson({ id, updated: Object.keys(update).filter((k) => k !== 'schema_version'), link: editorLink(id) });
    }

    case 'list_my_practices': {
      const p = ListArgs.safeParse(args ?? {});
      if (!p.success) return toolText(`Invalid arguments: ${p.error.message}`, true);
      const { data, error } = await db
        .from('practices')
        .select('id, title, tags, updated_at')
        .eq('owner_id', ownerId)
        .order('updated_at', { ascending: false })
        .limit(p.data.limit ?? 20);
      if (error) {
        console.error('[MCP API] List error:', error);
        return toolText('Failed to list Practices', true);
      }
      return toolJson({
        practices: (data ?? []).map((r) => ({ id: r.id, title: r.title, tags: r.tags, updated_at: r.updated_at, link: editorLink(r.id) })),
      });
    }

    default:
      return null;
  }
}

async function handleOne(raw: unknown, ownerId: string, db: () => Admin) {
  const parsed = RequestSchema.safeParse(raw);
  if (!parsed.success) return rpcError(null, ERR.invalidRequest, 'Invalid Request');
  const { id, method, params } = parsed.data;

  // Notifications (no id), such as notifications/initialized, get no response.
  if (id === undefined) return null;

  switch (method) {
    case 'initialize': {
      const requested = typeof params?.protocolVersion === 'string' ? params.protocolVersion : DEFAULT_PROTOCOL;
      return rpcResult(id, { protocolVersion: requested, capabilities: { tools: {} }, serverInfo: SERVER_INFO });
    }
    case 'ping':
      return rpcResult(id, {});
    case 'tools/list':
      return rpcResult(id, { tools: TOOLS });
    case 'tools/call': {
      const name = typeof params?.name === 'string' ? params.name : '';
      if (!TOOLS.some((t) => t.name === name)) return rpcError(id, ERR.invalidParams, `Unknown tool: ${name}`);
      try {
        return rpcResult(id, await callTool(name, params?.arguments, ownerId, db()));
      } catch (err) {
        console.error('[MCP API] Tool error:', err);
        return rpcResult(id, toolText('Something went wrong', true));
      }
    }
    default:
      return rpcError(id, ERR.methodNotFound, `Method not found: ${method}`);
  }
}

const unauthorized = () =>
  NextResponse.json(rpcError(null, ERR.unauthorized, 'Missing, invalid or revoked token'), {
    status: 401,
    headers: { 'WWW-Authenticate': 'Bearer' },
  });

export async function GET() {
  return NextResponse.json(rpcError(null, ERR.invalidRequest, 'Method not allowed: use POST'), {
    status: 405,
    headers: { Allow: 'POST' },
  });
}

export async function POST(request: NextRequest) {
  try {
    const header = request.headers.get('authorization') ?? '';
    const match = header.match(/^Bearer\s+(ca_pat_\S+)$/i);
    if (!match) return unauthorized();
    const ownerId = await verifyPersonalToken(match[1]);
    if (!ownerId) return unauthorized();

    const banned = await requireNotBanned(ownerId);
    if (banned) return NextResponse.json(rpcError(null, ERR.unauthorized, 'Account suspended'), { status: 403 });

    const limit = await checkRateLimit(`mcp:${ownerId}`, 'mcp');
    if (!limit.allowed) {
      return NextResponse.json(rpcError(null, ERR.rateLimited, 'Too many requests. Please try again later.'), {
        status: 429,
        headers: getRateLimitHeaders(limit),
      });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(rpcError(null, ERR.parse, 'Parse error'), { status: 400 });
    }

    let admin: Admin | null = null;
    const db = () => (admin ??= createSupabaseAdminClient());

    if (Array.isArray(body)) {
      if (body.length === 0) return NextResponse.json(rpcError(null, ERR.invalidRequest, 'Invalid Request'), { status: 400 });
      const out = (await Promise.all(body.map((b) => handleOne(b, ownerId, db)))).filter((r) => r !== null);
      return out.length ? NextResponse.json(out) : new NextResponse(null, { status: 202 });
    }

    const out = await handleOne(body, ownerId, db);
    return out ? NextResponse.json(out) : new NextResponse(null, { status: 202 });
  } catch (err) {
    console.error('[MCP API] Fatal POST Error:', err);
    return NextResponse.json(rpcError(null, ERR.internal, 'Internal error'), { status: 500 });
  }
}
