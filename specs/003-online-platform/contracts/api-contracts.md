# API Contracts: Online Platform

**Feature Branch**: `003-online-platform`  
**Created**: 2026-01-29

## Overview

API endpoint specifications for the Next.js App Router. All routes use Route Handlers (`route.ts`).

---

## Authentication Endpoints

### POST /api/auth/callback

Handles OAuth callback from Supabase Auth.

**Purpose**: Exchange auth code for session, set cookies.

```typescript
// Request: Query parameters from Supabase redirect
interface AuthCallbackRequest {
  code: string;        // Auth code from Supabase
  next?: string;       // Redirect destination
}

// Response: Redirect (no body)
// Success: Redirect to `next` or /app
// Failure: Redirect to /login?error=auth_failed
```

---

## Animation Endpoints

### GET /api/animations

List current user's animations.

**Auth**: Required

```typescript
// Request
interface ListAnimationsRequest {
  // Query params
  sort?: 'title' | 'created_at' | 'duration_ms' | 'animation_type';
  order?: 'asc' | 'desc';
  limit?: number;   // Default: 20, Max: 50
  offset?: number;  // Default: 0
}

// Response
interface ListAnimationsResponse {
  animations: AnimationSummary[];
  total: number;
  limit: number;
  offset: number;
}

interface AnimationSummary {
  id: string;
  title: string;
  animation_type: 'tactic' | 'skill' | 'game' | 'other';
  duration_ms: number;
  frame_count: number;
  visibility: 'private' | 'link_shared' | 'public';
  upvote_count: number;
  created_at: string;
  updated_at: string;
}
```

**Errors**:
- `401 Unauthorized`: Not logged in

---

### POST /api/animations

Create new animation.

**Auth**: Required  
**Rate Limit**: 10/hour

```typescript
// Request
interface CreateAnimationRequest {
  title: string;                    // 1-100 chars
  description?: string;             // Max 2000 chars
  coaching_notes?: string;          // Max 5000 chars
  animation_type: 'tactic' | 'skill' | 'game' | 'other';
  tags?: string[];                  // Max 10 tags, 30 chars each
  payload: ProjectPayload;          // Full animation data
  visibility?: 'private' | 'link_shared' | 'public';  // Default: private
}

// Response
interface CreateAnimationResponse {
  id: string;
  created_at: string;
}
```

**Validation**:
- Title passes blocklist check (FR-MOD-06)
- Description passes blocklist check
- Payload validates against ProjectPayload schema
- Duration ≤ 60 seconds
- Frame count ≤ 50
- User has quota available

**Errors**:
- `400 Bad Request`: Validation failed
- `401 Unauthorized`: Not logged in
- `403 Forbidden`: Quota exceeded (50 animations)
- `429 Too Many Requests`: Rate limited

---

### GET /api/animations/[id]

Get single animation with full payload.

**Auth**: Required for private, optional for public/link_shared

```typescript
// Response
interface GetAnimationResponse {
  id: string;
  user_id: string;
  author: {
    display_name: string | null;
  };
  title: string;
  description: string | null;
  coaching_notes: string | null;
  animation_type: 'tactic' | 'skill' | 'game' | 'other';
  tags: string[];
  payload: ProjectPayload;
  duration_ms: number;
  frame_count: number;
  visibility: 'private' | 'link_shared' | 'public';
  upvote_count: number;
  view_count: number;
  user_has_upvoted: boolean;       // Only if authenticated
  is_owner: boolean;               // True if current user owns this
  created_at: string;
  updated_at: string;
}
```

**Errors**:
- `401 Unauthorized`: Private animation, not owner
- `404 Not Found`: Animation doesn't exist or hidden

---

### PUT /api/animations/[id]

Update animation metadata and/or payload.

**Auth**: Required (owner only)

```typescript
// Request
interface UpdateAnimationRequest {
  title?: string;
  description?: string;
  coaching_notes?: string;
  animation_type?: 'tactic' | 'skill' | 'game' | 'other';
  tags?: string[];
  payload?: ProjectPayload;
  visibility?: 'private' | 'link_shared' | 'public';
}

// Response
interface UpdateAnimationResponse {
  id: string;
  updated_at: string;
}
```

**Errors**:
- `400 Bad Request`: Validation failed
- `401 Unauthorized`: Not logged in
- `403 Forbidden`: Not owner
- `404 Not Found`: Animation doesn't exist

---

### DELETE /api/animations/[id]

Delete animation.

**Auth**: Required (owner only)

```typescript
// Response: 204 No Content
```

**Errors**:
- `401 Unauthorized`: Not logged in
- `403 Forbidden`: Not owner
- `404 Not Found`: Animation doesn't exist

---

## Gallery Endpoints

### GET /api/gallery

List public animations for public gallery.

**Auth**: Optional (for `user_has_upvoted` field)

```typescript
// Request
interface PublicGalleryRequest {
  // Query params
  q?: string;                        // Search query (title + description)
  type?: 'tactic' | 'skill' | 'game' | 'other';
  tags?: string[];                   // Filter by tags (comma-separated)
  sort?: 'created_at' | 'upvote_count';  // Default: created_at
  order?: 'asc' | 'desc';            // Default: desc
  limit?: number;                    // Default: 20, Max: 50
  offset?: number;                   // Default: 0
}

// Response
interface PublicGalleryResponse {
  animations: PublicAnimationSummary[];
  total: number;
  limit: number;
  offset: number;
}

interface PublicAnimationSummary {
  id: string;
  title: string;
  description: string | null;
  animation_type: 'tactic' | 'skill' | 'game' | 'other';
  tags: string[];
  duration_ms: number;
  frame_count: number;
  upvote_count: number;
  author: {
    display_name: string | null;
  };
  user_has_upvoted: boolean;         // Only if authenticated
  created_at: string;
}
```

---

## Social Endpoints

### POST /api/animations/[id]/upvote

Toggle upvote on animation.

**Auth**: Required

```typescript
// Response
interface UpvoteResponse {
  upvoted: boolean;        // True if now upvoted, false if removed
  upvote_count: number;    // New count
}
```

**Errors**:
- `400 Bad Request`: Cannot upvote own animation
- `401 Unauthorized`: Not logged in
- `404 Not Found`: Animation doesn't exist or not public

---

### POST /api/animations/[id]/remix

Clone public animation to user's gallery.

**Auth**: Required

```typescript
// Response
interface RemixResponse {
  id: string;              // New animation ID
  title: string;           // Original title + " (Remix)"
  created_at: string;
}
```

**Errors**:
- `401 Unauthorized`: Not logged in
- `403 Forbidden`: Quota exceeded
- `404 Not Found`: Animation doesn't exist or not public

---

## Moderation Endpoints

### POST /api/report

Report an animation.

**Auth**: Required  
**Rate Limit**: 5/hour

```typescript
// Request
interface ReportRequest {
  animation_id: string;
  reason: 'inappropriate' | 'spam' | 'copyright' | 'other';
  details?: string;        // Max 500 chars
}

// Response
interface ReportResponse {
  id: string;
  created_at: string;
}
```

**Errors**:
- `400 Bad Request`: Invalid reason or already reported
- `401 Unauthorized`: Not logged in
- `404 Not Found`: Animation doesn't exist
- `429 Too Many Requests`: Rate limited

---

### GET /api/admin/reports

List pending reports.

**Auth**: Admin only

```typescript
// Request
interface AdminReportsRequest {
  status?: 'pending' | 'reviewed' | 'dismissed';  // Default: pending
  limit?: number;          // Default: 20
  offset?: number;         // Default: 0
}

// Response
interface AdminReportsResponse {
  reports: AdminReport[];
  total: number;
}

interface AdminReport {
  id: string;
  animation: {
    id: string;
    title: string;
    user_id: string;
    author_display_name: string | null;
  };
  reporter: {
    id: string;
    display_name: string | null;
  };
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
}
```

---

### POST /api/admin/reports/[id]/action

Take action on a report.

**Auth**: Admin only

```typescript
// Request
interface ReportActionRequest {
  action: 'dismiss' | 'hide' | 'delete' | 'warn_user' | 'ban_user';
  reason?: string;         // Required for hide/warn/ban
}

// Response
interface ReportActionResponse {
  report_id: string;
  status: 'reviewed' | 'dismissed';
  action_taken: string;
}
```

---

## Legacy Share Endpoint

### POST /api/share

Create temporary share link (legacy - 90-day expiration).

**Auth**: Optional  
**Rate Limit**: 10/hour

```typescript
// Request: SharePayloadV1 (existing schema)

// Response
interface ShareResponse {
  id: string;
  url: string;
}
```

### GET /api/share/[id]

Get shared animation payload.

**Auth**: None  
**Rate Limit**: 100/hour

```typescript
// Response: SharePayloadV1
```

---

## User Endpoints

### GET /api/user/profile

Get current user's profile.

**Auth**: Required

```typescript
// Response
interface UserProfileResponse {
  id: string;
  email: string;
  display_name: string | null;
  animation_count: number;
  role: 'user' | 'admin';
  created_at: string;
}
```

---

### PUT /api/user/profile

Update current user's profile.

**Auth**: Required

```typescript
// Request
interface UpdateProfileRequest {
  display_name?: string;   // Max 50 chars
}

// Response
interface UpdateProfileResponse {
  id: string;
  display_name: string | null;
  updated_at: string;
}
```

---

### DELETE /api/user/account

Delete user account and all data (GDPR compliance).

**Auth**: Required

```typescript
// Response: 204 No Content
```

---

## OG Image Endpoint

### GET /api/og/[id]

Generate dynamic Open Graph image for animation.

**Auth**: None

```typescript
// Response: image/png (1200x630)
// Cache: public, max-age=3600
```

---

## Error Response Format

All endpoints return errors in consistent format:

```typescript
interface ErrorResponse {
  error: {
    code: string;          // Machine-readable code
    message: string;       // Human-readable message
  };
}

// HTTP Status Codes:
// 400 - Bad Request (validation errors)
// 401 - Unauthorized (not logged in)
// 403 - Forbidden (no permission)
// 404 - Not Found
// 429 - Too Many Requests (rate limited)
// 500 - Internal Server Error
```

---

## Zod Schemas

```typescript
// lib/schemas/animations.ts
import { z } from 'zod';

export const AnimationTypeSchema = z.enum(['tactic', 'skill', 'game', 'other']);
export const VisibilitySchema = z.enum(['private', 'link_shared', 'public']);
export const ReportReasonSchema = z.enum(['inappropriate', 'spam', 'copyright', 'other']);

export const CreateAnimationSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  coaching_notes: z.string().max(5000).optional(),
  animation_type: AnimationTypeSchema,
  tags: z.array(z.string().max(30)).max(10).optional(),
  payload: z.object({
    version: z.string(),
    name: z.string(),
    sport: z.string(),
    frames: z.array(z.any()),
    settings: z.object({}).passthrough(),
  }),
  visibility: VisibilitySchema.optional().default('private'),
});

export const UpdateAnimationSchema = CreateAnimationSchema.partial();

export const ReportSchema = z.object({
  animation_id: z.string().uuid(),
  reason: ReportReasonSchema,
  details: z.string().max(500).optional(),
});

export const UpdateProfileSchema = z.object({
  display_name: z.string().max(50).optional(),
});

// Query param schemas
export const PaginationSchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export const GalleryQuerySchema = PaginationSchema.extend({
  q: z.string().optional(),
  type: AnimationTypeSchema.optional(),
  tags: z.string().optional(), // Comma-separated
  sort: z.enum(['created_at', 'upvote_count']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const MyAnimationsQuerySchema = PaginationSchema.extend({
  sort: z.enum(['title', 'created_at', 'duration_ms', 'animation_type']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});
```

---

## Route Handler Patterns

### Authentication Check

```typescript
// lib/auth.ts
import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function getUser() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user instanceof NextResponse) return user;
  
  const supabase = createServerClient();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (profile?.role !== 'admin') {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
      { status: 403 }
    );
  }
  return user;
}
```

### Standard Route Handler

```typescript
// app/api/animations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { CreateAnimationSchema, MyAnimationsQuerySchema } from '@/lib/schemas/animations';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const query = MyAnimationsQuerySchema.safeParse(searchParams);
  
  if (!query.success) {
    return NextResponse.json(
      { error: { code: 'INVALID_PARAMS', message: query.error.message } },
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  const { data, error, count } = await supabase
    .from('saved_animations')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order(query.data.sort, { ascending: query.data.order === 'asc' })
    .range(query.data.offset, query.data.offset + query.data.limit - 1);

  if (error) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Failed to fetch animations' } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    animations: data,
    total: count ?? 0,
    limit: query.data.limit,
    offset: query.data.offset,
  });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const body = await request.json();
  const parsed = CreateAnimationSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  // Check quota, blocklist, etc.
  // Insert into database
  // Return response
}
```
