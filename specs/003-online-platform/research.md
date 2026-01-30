# Research: Technical Unknowns

**Feature Branch**: `003-online-platform`  
**Created**: 2026-01-29

## Overview

This document captures technical unknowns that need resolution before or during implementation.

---

## R-001: Konva SSR Compatibility in Next.js App Router

**Status**: ✅ Resolved (approach documented)

**Question**: How to handle Konva/react-konva which requires browser APIs (window, document) in Next.js SSR?

**Resolution**: 
- Use `'use client'` directive on animation components
- Wrap with `next/dynamic` and `{ ssr: false }`
- Existing pattern in MIGRATION_PLAN.md Phase 3.2 confirmed

```typescript
const Editor = dynamic(() => import('@/components/Editor'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});
```

---

## R-002: PWA Service Worker with Next.js App Router

**Status**: 🔶 Needs Investigation

**Question**: Which PWA library works best with Next.js 14+ App Router for offline-first?

**Options**:
| Library | App Router Support | Notes |
|---------|-------------------|-------|
| `@serwist/next` | ✅ Full | Successor to next-pwa, active maintenance |
| `next-pwa` | ⚠️ Partial | Last update 2023, issues with App Router |
| Manual SW | ✅ Full | More control, more work |

**Recommendation**: Use `@serwist/next` - best balance of App Router support and DX.

**Action Items**:
- [ ] Test `@serwist/next` with App Router in POC
- [ ] Verify offline boot works (Constitution V.1 Sacred Offline)
- [ ] Configure cache strategies per route type

---

## R-003: Supabase SSR Authentication with App Router

**Status**: ✅ Resolved (approach documented)

**Question**: How to handle Supabase auth in Server Components vs Client Components?

**Resolution**: Use `@supabase/ssr` package with cookie-based sessions.

**Architecture**:
```
lib/supabase/
  server.ts    → createServerClient() for Server Components/Route Handlers
  client.ts    → createBrowserClient() for Client Components
  middleware.ts → Refresh session on each request
```

**Key Points**:
- Server Components use `cookies()` from `next/headers`
- Middleware refreshes auth token before expiry
- Client Components use browser-stored cookies (httpOnly)

---

## R-004: Persistent Rate Limiting in Serverless

**Status**: 🔶 Needs Decision

**Question**: How to implement rate limiting that persists across serverless instances?

**Options**:
| Approach | Pros | Cons |
|----------|------|------|
| **Supabase `rate_limits` table** | No extra service, SQL queries | Latency, DB load |
| **Vercel KV (Redis)** | Fast, purpose-built | Extra cost ($0.30/100K requests) |
| **Upstash Redis** | Fast, serverless-native | Extra service to manage |

**Recommendation**: Start with **Supabase `rate_limits` table** (Constitution constraint: minimize services). Migrate to Vercel KV if latency becomes an issue.

**Schema**:
```sql
CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,           -- "ip:{ip}:endpoint" or "user:{id}:endpoint"
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW()
);
```

---

## R-005: Content Pre-Moderation Blocklist

**Status**: 🔶 Needs Decision

**Question**: How to implement text blocklist validation per FR-MOD-06?

**Options**:
| Library | Bundle Size | Features |
|---------|-------------|----------|
| `bad-words` | ~15KB | Basic filtering, customizable |
| `leo-profanity` | ~8KB | Lightweight, dictionary-based |
| Custom regex | 0KB | Full control, maintenance burden |

**Recommendation**: Use `bad-words` as spec references it. Run on server-side only (API routes) to avoid client bundle bloat.

**Implementation**:
```typescript
// api/lib/moderation.ts
import Filter from 'bad-words';
const filter = new Filter();

export function validateText(text: string): { valid: boolean; reason?: string } {
  if (filter.isProfane(text)) {
    return { valid: false, reason: 'Content contains inappropriate language' };
  }
  return { valid: true };
}
```

---

## R-006: Dynamic OG Images with @vercel/og

**Status**: ✅ Resolved (approach documented)

**Question**: How to generate dynamic OG images showing animation previews?

**Resolution**: Use `@vercel/og` (Vercel's Satori-based image generation).

**Route**: `app/api/og/[id]/route.tsx`

**Approach**:
1. Fetch animation metadata from Supabase
2. Render preview frame as JSX (not Konva - static representation)
3. Return PNG via `ImageResponse`

**Considerations**:
- Generate at request time (not build time - animations are dynamic)
- Cache with `Cache-Control` headers (e.g., 1 hour)
- Fallback to generic OG image if animation not found

---

## R-007: GIF Export in Next.js Environment

**Status**: 🔶 Needs Verification

**Question**: Will `gif.js` web worker approach work in Next.js client components?

**Current Implementation**: Uses `gif.worker.js` in `/public/gif-worker/`

**Expected Behavior**: Should work unchanged since GIF export is client-side only, wrapped in `'use client'` components.

**Action Items**:
- [ ] Verify worker path resolution in Next.js
- [ ] Test GIF export after migration to `/app` route

---

## R-008: Zustand Persistence with Next.js Hydration

**Status**: 🔶 Needs Investigation

**Question**: How to handle Zustand store hydration with SSR/SSG pages?

**Current State**: Store initializes client-side only (Vite SPA).

**Concerns**:
- Hydration mismatch if server renders different state
- LocalStorage not available during SSR

**Resolution Approach**:
1. Animation tool page is `'use client'` - no SSR for store-dependent UI
2. Gallery pages fetch data server-side, pass as props
3. Use Zustand `persist` middleware only in client components

---

## R-009: Image/Thumbnail Storage

**Status**: 🔶 Needs Decision

**Question**: Where to store animation thumbnail images?

**Options**:
| Approach | Pros | Cons |
|----------|------|------|
| **Supabase Storage** | Integrated, RLS policies | Extra config |
| **Base64 in DB** | Simple, no extra storage | DB bloat, slow queries |
| **Generate on-demand** | No storage needed | CPU cost, latency |

**Recommendation**: **Generate on-demand** for MVP. Thumbnails rendered client-side from first frame data. Future: cache to Supabase Storage.

---

## R-010: Email Service for Auth Emails

**Status**: ✅ Resolved

**Question**: How are verification/password reset emails sent?

**Resolution**: Supabase Auth handles all transactional emails:
- Email verification
- Password reset
- Magic links (if enabled later)

**Configuration**: Supabase dashboard → Authentication → Email Templates

**Custom Domain**: Optional - configure SMTP in Supabase for branded emails.

---

## Summary

| ID | Topic | Status | Blocking? |
|----|-------|--------|-----------|
| R-001 | Konva SSR | ✅ Resolved | No |
| R-002 | PWA Library | 🔶 Test in POC | Yes (Phase 1) |
| R-003 | Supabase SSR Auth | ✅ Resolved | No |
| R-004 | Rate Limiting | 🔶 Decision needed | No (Phase 2) |
| R-005 | Content Blocklist | 🔶 Decision needed | No (Phase 4) |
| R-006 | OG Images | ✅ Resolved | No |
| R-007 | GIF Export | 🔶 Verify in Phase 3 | No |
| R-008 | Zustand Hydration | 🔶 Monitor | No |
| R-009 | Thumbnail Storage | 🔶 Decision needed | No (Phase 5) |
| R-010 | Auth Emails | ✅ Resolved | No |

**Blocking items**: Only R-002 (PWA) needs resolution before Phase 1 implementation.
