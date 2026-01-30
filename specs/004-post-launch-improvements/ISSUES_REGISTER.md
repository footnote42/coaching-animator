# Issue Register: Post-Launch Improvements

**Review Date**: 2026-01-30  
**Reviewer**: Technical Review (Systematic End-to-End Analysis)  
**Project State**: 111/111 tasks complete, production-ready  
**Review Scope**: Product/UX, Architecture, Media, Reliability, Scalability, Operations

---

## Executive Summary

This register documents 33 issues identified across 6 dimensions during a systematic post-launch review. The project is functionally complete with all 9 user stories implemented, but several critical reliability and architecture issues should be addressed before scaling to production traffic.

**Priority Breakdown**:
- **P0 (Critical)**: 3 issues - Must fix before public launch
- **P1 (High)**: 9 issues - Fix within 2 weeks of launch
- **P2 (Medium)**: 12 issues - Fix within 1 month
- **P3 (Low)**: 9 issues - Backlog for future iterations

**Top Risks**:
1. Data loss from failed API calls (no retry logic)
2. Security vulnerability from unvalidated animation payloads
3. Performance bottleneck from database-based rate limiting
4. Safari/iOS users cannot use video export (WebM-only)

---

## Issue Summary Table

| Priority | Count | Impact Areas |
|----------|-------|--------------|
| P0 | 3 | Reliability, Security, Performance |
| P1 | 9 | UX, Media Export, Scalability, Operations |
| P2 | 12 | UX Polish, Technical Debt, Monitoring |
| P3 | 9 | Advanced Features, Infrastructure, Analytics |

---

## 1. Product & User Experience

### UX-001: No onboarding or first-run experience
**Priority**: P1  
**Impact**: Medium | **Effort**: Medium

**Description**: New users land directly in the editor with no guidance on how to create their first animation. No tutorial, tooltips, welcome modal, or interactive walkthrough.

**Why it matters**: 
- First-time users don't know where to start
- Increases bounce rate and reduces activation
- Competitors with onboarding will have better conversion

**How to validate**:
1. Clear browser localStorage
2. Visit `/app` as new user
3. Observe: No guidance, tooltips, or tutorial prompts
4. Expected: Interactive tutorial or welcome modal explaining basic workflow

**Recommended action**: Add interactive tutorial on first visit (use localStorage flag to track). Include: "Add player → Position → Add frame → Play animation → Export" flow.

---

### UX-002: Guest mode limitations unclear until hit
**Priority**: P2  
**Impact**: Medium | **Effort**: Low

**Description**: Guests can add 9 frames without any warning, then suddenly blocked when attempting to add 11th frame. No proactive messaging about frame limits.

**Why it matters**:
- Frustrating user experience (surprise limitation)
- Missed conversion opportunity (should prompt registration earlier)
- Users may lose work if they don't understand limits

**How to validate**:
1. Use app without logging in
2. Add frames 1-9: No warnings or indicators
3. Try to add frame 11: Blocked with modal
4. Expected: Persistent banner showing "X/10 frames used (guest mode)"

**Recommended action**: Show persistent banner "X/10 frames used" for guests. Add "Unlock unlimited frames" CTA before hitting limit.

---

### UX-003: No animation preview in gallery cards
**Priority**: P1  
**Impact**: High | **Effort**: High

**Description**: Gallery cards show only text metadata (title, description, tags). No thumbnail or preview image of the animation.

**Why it matters**:
- Users can't visually browse animations
- Must click through to detail page to see what play looks like
- Reduces discoverability and engagement in public gallery

**How to validate**:
1. Check `components/PublicAnimationCard.tsx` - no image element
2. Check database schema - no thumbnail_url field
3. Visit `/gallery` - cards are text-only
4. Expected: Thumbnail showing first frame or key moment

**Recommended action**: Generate thumbnail on save (capture first frame as PNG), store in Supabase Storage, display in cards.

---

### UX-004: Search in gallery is basic text matching
**Priority**: P2  
**Impact**: Medium | **Effort**: Medium

**Description**: Gallery search uses simple `ilike` queries with no fuzzy search, typo tolerance, or relevance ranking.

**Why it matters**:
- Users must match exact terms (e.g., "lineout" won't find "line out")
- No ranking by relevance (all results equal weight)
- Poor search experience compared to modern apps

**How to validate**:
1. Check `app/api/gallery/route.ts:40-42` - uses `ilike` operator
2. Search for "lineout" - won't match "line out" or "line-out"
3. Search for "tactic" - results not ranked by relevance
4. Expected: Fuzzy matching, typo tolerance, relevance scoring

**Recommended action**: Upgrade to Postgres full-text search with `ts_rank`, or integrate Algolia/Meilisearch for advanced search.

---

### UX-005: No bulk operations in My Gallery
**Priority**: P3  
**Impact**: Low | **Effort**: Medium

**Description**: Users with many animations (up to 50) cannot delete or change visibility on multiple items at once. Must edit one-by-one.

**Why it matters**:
- Tedious for users with large libraries
- Common workflow: "Make all my old plays private"
- Quality-of-life improvement for power users

**How to validate**:
1. Check `app/my-gallery/page.tsx` - no multi-select UI
2. Create 10+ animations
3. Try to delete multiple: Must click each individually
4. Expected: Checkbox selection, bulk actions menu

**Recommended action**: Add checkbox multi-select and bulk actions (delete, change visibility, add tags) in My Gallery.

---

### UX-006: Mobile experience not optimized for canvas
**Priority**: P3  
**Impact**: Low | **Effort**: High

**Description**: Konva canvas drag-and-drop may not work well on touch devices. No touch-specific controls or responsive canvas sizing.

**Why it matters**:
- Coaches may want to create plays on tablets
- Touch interactions different from mouse (pinch, long-press)
- Mobile traffic could be 30%+ of users

**How to validate**:
1. Open `/app` on mobile device or Chrome DevTools mobile emulation
2. Try to drag player: May not work smoothly
3. Try to zoom canvas: No pinch-to-zoom
4. Expected: Touch-optimized controls, responsive canvas

**Recommended action**: Add touch event handlers, responsive canvas sizing, mobile-specific UI (larger touch targets).

---

### UX-007: No "Save as Draft" vs "Publish" workflow
**Priority**: P3  
**Impact**: Low | **Effort**: Low

**Description**: Users must set visibility at save time. Can't iterate privately then publish later. No draft state.

**Why it matters**:
- Users may want to save work-in-progress without publishing
- Current flow: Must remember to set "Private" every time
- Common pattern: Draft → Review → Publish

**How to validate**:
1. Check `components/SaveToCloudModal.tsx` - forces visibility choice immediately
2. No "Save as Draft" button
3. Expected: Default to draft/private, explicit "Publish" action

**Recommended action**: Add draft state, separate "Save Draft" and "Publish" buttons, or default to private with easy toggle.

---

### UX-008: Error messages are technical, not user-friendly
**Priority**: P2  
**Impact**: Medium | **Effort**: Low

**Description**: API errors return developer-focused codes like "DB_ERROR", "VALIDATION_ERROR", "RATE_LIMITED" without user-friendly explanations.

**Why it matters**:
- Users don't know how to fix issues
- "DB_ERROR" is meaningless to coaches
- Reduces trust and increases support burden

**How to validate**:
1. Check API error responses - codes are technical
2. Trigger quota error: "You have reached the maximum of 50 animations"
3. Trigger validation error: "VALIDATION_ERROR" with Zod message
4. Expected: "Something went wrong. Please try again." with actionable guidance

**Recommended action**: Map error codes to user-friendly messages in UI layer. Add help links for common errors.

---

## 2. Technical Architecture

### ARCH-001: Rate limiting stored in database, not cache
**Priority**: P0  
**Impact**: High | **Effort**: Medium

**Description**: Every API call requires 2-3 database queries for rate limit checks, adding 50-100ms latency per request.

**Why it matters**:
- Performance bottleneck under moderate load
- Database connections wasted on rate limit checks
- Will cause 429 errors when DB is slow
- Industry standard is Redis/memory cache

**How to validate**:
1. Check `lib/rate-limit.ts:28-82` - uses Supabase `rate_limits` table
2. Monitor API latency: 2-3 DB queries per request
3. Load test: Rate limit checks slow down under 100+ req/sec
4. Expected: <5ms rate limit check using in-memory cache

**Recommended action**: Migrate to Redis (Upstash), Vercel KV, or in-memory cache with TTL. Keep DB as fallback for distributed systems.

---

### ARCH-002: No database connection pooling configuration
**Priority**: P2  
**Impact**: Medium | **Effort**: Low

**Description**: Supabase client created per request with no explicit connection pool configuration. May exhaust connections under load.

**Why it matters**:
- Supabase has connection limits (varies by plan)
- Under load, may hit "too many connections" errors
- No control over pool size, timeout, or reuse

**How to validate**:
1. Check `lib/supabase/server.ts` - no pool size config
2. Load test with 50+ concurrent requests
3. Monitor Supabase dashboard for connection count
4. Expected: Connection pool configuration with max size

**Recommended action**: Configure connection pooling in Supabase client. Use Supabase pooler for serverless environments.

---

### ARCH-003: Animation payload stored as JSONB with no size validation
**Priority**: P2  
**Impact**: Medium | **Effort**: Low

**Description**: Database migration allows unlimited JSONB size. API only validates frame count and duration, not payload size.

**Why it matters**:
- Large animations (many entities, complex paths) could exceed Postgres limits
- No protection against malicious payloads
- Could cause slow queries or storage issues

**How to validate**:
1. Check migration: No size constraint on `payload` column
2. Check API: Only validates frame count/duration
3. Create animation with 1000+ entities: Accepted
4. Expected: Max payload size (e.g., 1MB) enforced

**Recommended action**: Add max payload size check (1MB) in API validation. Consider compression for large animations.

---

### ARCH-004: No CDN or static asset optimization
**Priority**: P2  
**Impact**: Medium | **Effort**: Medium

**Description**: Field images, icons, and static assets served from Next.js server instead of edge CDN.

**Why it matters**:
- Slower page loads for users far from server
- Wastes server resources on static files
- No cache headers or optimization

**How to validate**:
1. Check `next.config.js` - no image optimization config for local assets
2. Inspect network tab: Assets served from origin, not CDN
3. Check response headers: No long-term cache headers
4. Expected: Assets served from CDN with cache headers

**Recommended action**: Configure Next.js Image Optimization, use Vercel CDN, or move assets to Supabase Storage with CDN.

---

### ARCH-005: Client-side state not persisted during auth redirects
**Priority**: P2  
**Impact**: Medium | **Effort**: Medium

**Description**: User creates animation, clicks "Save to Cloud", redirected to login, loses work. No sessionStorage/localStorage backup before redirect.

**Why it matters**:
- Data loss during auth flow
- Frustrating user experience
- Reduces conversion (users abandon after losing work)

**How to validate**:
1. Create animation as guest
2. Click "Save to Cloud"
3. Redirected to login
4. After login: Animation lost
5. Expected: Animation restored after login

**Recommended action**: Save project to sessionStorage before auth redirect. Restore after successful login.

---

### ARCH-006: No API versioning strategy
**Priority**: P3  
**Impact**: Low | **Effort**: Low

**Description**: API routes have no version prefix (e.g., `/api/v1/animations`). Breaking changes will break existing clients.

**Why it matters**:
- Can't evolve API without breaking changes
- Mobile apps or external integrations will break
- No migration path for clients

**How to validate**:
1. Check API routes: `/api/animations`, not `/api/v1/animations`
2. No version header or query param
3. Expected: Versioned API with deprecation policy

**Recommended action**: Add `/api/v1` prefix to all routes. Document breaking change policy and deprecation timeline.

---

### ARCH-007: Middleware runs on every request including static assets
**Priority**: P2  
**Impact**: Low | **Effort**: Low

**Description**: Auth session refresh happens even for images, fonts, and static files, wasting resources.

**Why it matters**:
- Unnecessary overhead on static requests
- Increases latency for assets
- Wastes Supabase auth quota

**How to validate**:
1. Check `middleware.ts:9-18` - matcher excludes some but may catch more
2. Monitor middleware execution on static asset requests
3. Expected: Middleware only runs on dynamic routes

**Recommended action**: Refine middleware matcher to exclude all static assets, API routes, and public pages.

---

### ARCH-008: No database migration rollback strategy
**Priority**: P2  
**Impact**: Medium | **Effort**: Medium

**Description**: Single migration file with no down migrations. If migration fails in production, no automated way to revert.

**Why it matters**:
- Production migration failures are risky
- Manual rollback is error-prone
- No testing of rollback procedure

**How to validate**:
1. Check `supabase/migrations/` - single file, no down migration
2. No rollback script or procedure documented
3. Expected: Up/down migrations, rollback tested

**Recommended action**: Create down migration scripts. Use migration tool that supports rollback (e.g., Supabase CLI with versioning).

---

## 3. Animation & Media Handling

### MEDIA-001: Video export only supports WebM
**Priority**: P1  
**Impact**: High | **Effort**: High

**Description**: Export hardcodes `video/webm` format. Safari/iOS users cannot play exported videos natively.

**Why it matters**:
- 30%+ of coaches use iOS devices
- WebM not supported in Safari or iOS
- Broken core feature for large user segment
- Users must manually convert videos

**How to validate**:
1. Check `src/hooks/useExport.ts:114` - hardcoded `video/webm`
2. Export animation on Safari: Video doesn't play
3. Send WebM to iOS device: Cannot open
4. Expected: MP4 export option or automatic format detection

**Recommended action**: Add MP4 export fallback using FFmpeg.wasm (client-side) or server-side conversion API. Detect browser and choose format.

---

### MEDIA-002: No thumbnail generation for saved animations
**Priority**: P2  
**Impact**: Medium | **Effort**: Medium

**Description**: Database schema has no thumbnail URL field. No logic to capture and store animation preview images.

**Why it matters**:
- Gallery cards are text-only (see UX-003)
- No visual preview in My Gallery
- Reduces engagement and discoverability

**How to validate**:
1. Check migration: No `thumbnail_url` field in `saved_animations`
2. Check save flow: No canvas capture logic
3. Expected: Thumbnail generated on save, stored in Supabase Storage

**Recommended action**: Capture canvas snapshot (first frame or mid-point) on save. Upload to Supabase Storage, store URL in DB.

---

### MEDIA-003: Export resolution limited to 720p
**Priority**: P3  
**Impact**: Low | **Effort**: Low

**Description**: Validation constants limit export to 720p. No option for 1080p (presentations) or 480p (WhatsApp).

**Why it matters**:
- Coaches may want higher quality for presentations
- Lower quality useful for mobile sharing (smaller files)
- User preference not accommodated

**How to validate**:
1. Check validation constants - max resolution hardcoded
2. No UI to select resolution
3. Expected: Resolution selector (480p, 720p, 1080p)

**Recommended action**: Add resolution selector in export modal. Allow 480p, 720p, 1080p options.

---

### MEDIA-004: No animation compression or optimization
**Priority**: P3  
**Impact**: Low | **Effort**: Medium

**Description**: Animation payload stored as-is with no minification, compression, or delta encoding.

**Why it matters**:
- Complex animations may be slow to load/save
- Wastes bandwidth and storage
- Could hit payload size limits

**How to validate**:
1. Create animation with 50 frames, 30 entities
2. Check payload size: May be 100KB+ uncompressed
3. Expected: Compressed payload, delta encoding between frames

**Recommended action**: Implement delta encoding (store only changes between frames). Use gzip compression for payloads.

---

### MEDIA-005: GIF export mentioned but not implemented
**Priority**: P3  
**Impact**: Low | **Effort**: High

**Description**: README mentions GIF worker, but export only produces WebM. GIF export not functional.

**Why it matters**:
- GIFs more universally compatible than WebM
- Useful for social media, presentations
- Feature mentioned but not delivered

**How to validate**:
1. Check `public/gif-worker/gif.worker.js` - exists but not used
2. Check export flow: Only WebM option
3. Expected: GIF export option in UI

**Recommended action**: Implement GIF export using gif.js worker. Add as export format option alongside WebM/MP4.

---

### MEDIA-006: No progress indicator during video export
**Priority**: P3  
**Impact**: Low | **Effort**: Low

**Description**: Export hook has progress state but not connected to frame capture. Long animations show no progress.

**Why it matters**:
- 50-frame animations may take 30+ seconds
- Users don't know if export is working or frozen
- May click multiple times, causing issues

**How to validate**:
1. Export 50-frame animation
2. No progress bar or percentage shown
3. Check `useExport` hook: Progress state exists but not updated
4. Expected: Progress bar showing "Capturing frame 25/50..."

**Recommended action**: Connect export progress state to frame capture loop. Show progress bar with percentage and phase.

---

### MEDIA-007: Canvas rendering not optimized for low-end devices
**Priority**: P3  
**Impact**: Low | **Effort**: High

**Description**: 60 FPS playback hardcoded with no adaptive quality or FPS degradation for low-end devices.

**Why it matters**:
- Older phones/tablets may stutter during playback
- Wastes battery on mobile devices
- No fallback for performance issues

**How to validate**:
1. Test on low-end device (e.g., old Android phone)
2. Play 50-frame animation: May stutter or lag
3. Expected: Adaptive FPS based on device performance

**Recommended action**: Implement adaptive FPS (detect frame drops, reduce quality). Add performance mode toggle in settings.

---

## 4. Reliability & Edge Cases

### REL-001: No retry logic for failed API calls
**Priority**: P0  
**Impact**: High | **Effort**: Low

**Description**: Network blips cause permanent failures. SaveToCloudModal, gallery fetch, and other API calls have no retry logic or exponential backoff.

**Why it matters**:
- Data loss risk (user creates animation, save fails, work lost)
- Poor user experience on unstable connections
- Industry standard is 3 retries with backoff
- Critical for mobile users

**How to validate**:
1. Check `components/SaveToCloudModal.tsx:54-65` - single fetch, no retry
2. Simulate network failure (DevTools offline mode)
3. Try to save: Fails permanently, no retry
4. Expected: Automatic retry with exponential backoff

**Recommended action**: Add exponential backoff retry logic to all API calls. Use library like `ky` or custom retry wrapper.

---

### REL-002: Autosave can fail silently if quota exceeded
**Priority**: P2  
**Impact**: Medium | **Effort**: Low

**Description**: Autosave doesn't check localStorage quota before saving. If quota exceeded, save fails silently.

**Why it matters**:
- User thinks work is saved but it's not
- Data loss risk on quota-limited browsers
- No warning or fallback

**How to validate**:
1. Fill localStorage to near quota (5MB limit)
2. Create animation and wait for autosave
3. Check localStorage: Autosave may fail silently
4. Expected: Warning toast if quota near limit

**Recommended action**: Check localStorage quota before autosave. Show warning if near limit, prompt manual save.

---

### REL-003: Race condition in upvote toggle
**Priority**: P2  
**Impact**: Medium | **Effort**: Low

**Description**: Rapid clicks on upvote button may result in incorrect upvote count. No idempotency key or optimistic locking.

**Why it matters**:
- Upvote count may be incorrect
- Database integrity issue
- Poor user experience (button state flickers)

**How to validate**:
1. Click upvote button rapidly 5 times
2. Check final upvote count: May be incorrect
3. Check database: Multiple upvote records may exist
4. Expected: Idempotent upvote (toggle only)

**Recommended action**: Add optimistic locking (version field) or idempotency key. Debounce upvote button clicks.

---

### REL-004: No handling of concurrent edits to same animation
**Priority**: P3  
**Impact**: Low | **Effort**: Medium

**Description**: User edits animation on desktop and mobile simultaneously. Last write wins, no conflict detection.

**Why it matters**:
- Data loss if editing on multiple devices
- No warning about conflicts
- Confusing user experience

**How to validate**:
1. Open same animation on two devices
2. Edit on both, save on both
3. Last save wins, first save lost
4. Expected: Conflict detection, merge UI

**Recommended action**: Add `updated_at` version field. Check on save, warn if conflict detected. Offer merge or overwrite options.

---

### REL-005: Email verification link expiry not handled gracefully
**Priority**: P2  
**Impact**: Medium | **Effort**: Medium

**Description**: Spec mentions resend verification email option but not implemented. Expired links show generic error.

**Why it matters**:
- Users can't complete registration if link expires
- No way to resend verification email
- Increases support burden

**How to validate**:
1. Register new account
2. Wait for verification link to expire (check Supabase config)
3. Click expired link: Generic error
4. Expected: "Link expired. Resend verification email" option

**Recommended action**: Add resend verification email endpoint and UI. Show friendly error message with resend button.

---

### REL-006: Banned user can still view public gallery
**Priority**: P2  
**Impact**: Medium | **Effort**: Low

**Description**: Gallery API doesn't check ban status. Banned users can browse public gallery and view animations.

**Why it matters**:
- Banned users should be fully restricted
- Inconsistent enforcement (can't create but can view)
- Moderation policy not fully enforced

**How to validate**:
1. Ban a user account (set `banned_at` in DB)
2. Log in as banned user
3. Visit `/gallery`: Can browse animations
4. Expected: Redirect to banned notice page

**Recommended action**: Add ban check to gallery API and pages. Redirect banned users to account status page.

---

### REL-007: Deleted animation may still be cached in browser
**Priority**: P2  
**Impact**: Low | **Effort**: Low

**Description**: No cache invalidation headers or SWR revalidation after delete. User deletes animation, refreshes, sees stale data.

**Why it matters**:
- Confusing user experience
- User thinks delete failed
- Cache inconsistency

**How to validate**:
1. Load My Gallery page
2. Delete animation
3. Refresh page: Animation may still appear briefly
4. Expected: Immediate cache invalidation

**Recommended action**: Add cache invalidation headers. Use SWR or React Query with mutation callbacks to invalidate cache.

---

### REL-008: No graceful degradation if Supabase is down
**Priority**: P1  
**Impact**: High | **Effort**: High

**Description**: If Supabase is unavailable, entire app breaks. No fallback to localStorage-only mode for offline-capable features.

**Why it matters**:
- Core animation features should work offline
- Supabase outages happen (maintenance, incidents)
- App should degrade gracefully, not fail completely

**How to validate**:
1. Block Supabase domain in DevTools
2. Try to use animation editor: May break
3. Expected: Editor works offline, sync when online

**Recommended action**: Detect Supabase outage, switch to localStorage-only mode. Queue saves for sync when online. Show offline indicator.

---

### REL-009: Content moderation blocklist is hardcoded
**Priority**: P2  
**Impact**: Low | **Effort**: Low

**Description**: Profanity blocklist is static array in code. Can't update without redeploying.

**Why it matters**:
- Can't respond quickly to new abuse patterns
- No admin UI to manage blocklist
- Requires code change for content policy updates

**How to validate**:
1. Check `lib/moderation.ts:1-20` - static array
2. To add word: Must edit code and redeploy
3. Expected: Dynamic blocklist in database

**Recommended action**: Move blocklist to Supabase table. Add admin UI to manage blocked words. Cache in memory for performance.

---

### REL-010: No validation of animation payload structure
**Priority**: P0  
**Impact**: High | **Effort**: Medium

**Description**: API accepts any JSONB payload without schema validation. Malformed JSON could crash renderer or cause XSS.

**Why it matters**:
- Security vulnerability (XSS, injection attacks)
- Renderer may crash on malformed data
- No guarantee of data integrity
- Critical security issue

**How to validate**:
1. Check API: Only validates frame count/duration
2. Send malformed payload: Accepted by API
3. Load malformed animation: May crash renderer
4. Expected: Strict schema validation with Zod

**Recommended action**: Add Zod schema for animation payload structure. Validate entities, frames, annotations before DB insert. Sanitize user input.

---

## 5. Scalability & Maintainability

### SCALE-001: N+1 query problem in gallery endpoint
**Priority**: P1  
**Impact**: Medium | **Effort**: Low

**Description**: Gallery API fetches animations, then loops to get author names and upvotes. Separate queries per animation.

**Why it matters**:
- Performance degrades with more results
- 20 animations = 40+ database queries
- Will cause slow page loads at scale

**How to validate**:
1. Check `app/api/gallery/route.ts:86-96` - separate queries
2. Monitor DB query count: 2-3 queries per animation
3. Load gallery with 20 results: 40+ queries
4. Expected: Single query with JOINs or aggregations

**Recommended action**: Use JOIN or single query with aggregations for authors/upvotes. Reduce to 1-2 queries total.

---

### SCALE-002: No pagination on My Gallery
**Priority**: P2  
**Impact**: Medium | **Effort**: Low

**Description**: My Gallery page fetches all animations in single query. User with 50 animations loads all at once.

**Why it matters**:
- Slow page load for users with many animations
- Wastes bandwidth loading unused data
- Poor mobile experience

**How to validate**:
1. Check `app/my-gallery/page.tsx` - fetches all animations
2. Create 50 animations
3. Load My Gallery: All 50 loaded at once
4. Expected: Paginated or infinite scroll (20 per page)

**Recommended action**: Add pagination (20 per page) or infinite scroll. Use offset/limit in API query.

---

### SCALE-003: No database indexes on common query patterns
**Priority**: P2  
**Impact**: Medium | **Effort**: Low

**Description**: Migration has basic indexes but no composite indexes for multi-column filters (e.g., type + tags + visibility).

**Why it matters**:
- Gallery search by tags + type may be slow
- Full table scans on complex queries
- Performance degrades with 10K+ animations

**How to validate**:
1. Check migration: Single-column indexes only
2. Query gallery with type + tags filter
3. Check query plan: May use sequential scan
4. Expected: Composite indexes for common filters

**Recommended action**: Add composite indexes for common query patterns (visibility + created_at, type + tags, etc.).

---

### SCALE-004: Rate limit table will grow unbounded
**Priority**: P2  
**Impact**: Low | **Effort**: Low

**Description**: No cleanup job for old rate limit entries. Table will grow indefinitely.

**Why it matters**:
- Database bloat over time
- Slower queries as table grows
- Wasted storage

**How to validate**:
1. Check migration: No TTL or cleanup trigger on `rate_limits`
2. Simulate high traffic: Table grows
3. Expected: Automatic cleanup of old entries

**Recommended action**: Add TTL or scheduled cleanup job to delete rate limit entries older than 24 hours.

---

### SCALE-005: No monitoring or observability
**Priority**: P3  
**Impact**: Low | **Effort**: High

**Description**: No logging service, error tracking, metrics, or tracing. Can't detect performance issues or abuse patterns.

**Why it matters**:
- Can't diagnose production issues
- No visibility into user behavior
- Can't detect abuse or attacks

**How to validate**:
1. Check codebase: No Sentry, LogRocket, or similar
2. No structured logging
3. Expected: Error tracking, metrics, logs

**Recommended action**: Integrate Sentry (errors), Axiom (logs), Vercel Analytics (metrics). Add structured logging.

---

### SCALE-006: Hardcoded limits not configurable per environment
**Priority**: P2  
**Impact**: Low | **Effort**: Low

**Description**: Limits (50 animations, 10 frames guest) hardcoded in constants. Can't A/B test or adjust per environment.

**Why it matters**:
- Can't experiment with different quotas
- No flexibility for paid tiers
- Requires code change to adjust limits

**How to validate**:
1. Check constants: Hardcoded values
2. To change limit: Must edit code and redeploy
3. Expected: Environment variables for limits

**Recommended action**: Move limits to environment variables. Allow per-user overrides in database.

---

### SCALE-007: No code splitting for large dependencies
**Priority**: P3  
**Impact**: Low | **Effort**: Medium

**Description**: Konva, react-konva loaded even on landing page. Large dependencies not lazy-loaded.

**Why it matters**:
- Slow initial page load
- Wastes bandwidth for users who don't use editor
- Poor Lighthouse score

**How to validate**:
1. Check bundle size on landing page
2. Konva loaded even though not used
3. Expected: Lazy load editor dependencies

**Recommended action**: Use dynamic imports for editor components. Split landing page bundle from editor bundle.

---

### SCALE-008: Type definitions scattered across multiple files
**Priority**: P3  
**Impact**: Low | **Effort**: Medium

**Description**: Types defined in `src/types`, `lib/schemas`, and inline. Duplicate definitions lead to drift.

**Why it matters**:
- Type inconsistency across codebase
- Harder to maintain and refactor
- Duplicate definitions may diverge

**How to validate**:
1. Check type definitions: Scattered across files
2. Same types defined multiple times
3. Expected: Single source of truth for types

**Recommended action**: Consolidate types into single location. Use Zod schemas as source of truth, infer TypeScript types.

---

## 6. Operational Workflow

### OPS-001: No staging environment configuration
**Priority**: P2  
**Impact**: Medium | **Effort**: Low

**Description**: Single `.env.local.example` with no staging-specific configuration. Can't test migrations or features before production.

**Why it matters**:
- Risky to test in production
- No safe environment for QA
- Can't validate migrations before deploy

**How to validate**:
1. Check `.env.local.example` - single environment
2. No staging Supabase project configured
3. Expected: Separate staging environment

**Recommended action**: Create staging Supabase project. Add `.env.staging` configuration. Document staging deployment process.

---

### OPS-002: Database migration must be run manually
**Priority**: P2  
**Impact**: Medium | **Effort**: Medium

**Description**: README instructs to run migration in Supabase dashboard manually. Not automated in CI/CD.

**Why it matters**:
- Easy to forget during deployment
- Causes production errors if missed
- No audit trail of migrations

**How to validate**:
1. Check deployment process: No automated migration
2. README says "run migration in Supabase dashboard"
3. Expected: Automated migration in CI/CD

**Recommended action**: Use Supabase CLI in CI/CD to auto-apply migrations on deploy. Add migration status check.

---

### OPS-003: No health check endpoint
**Priority**: P1  
**Impact**: Medium | **Effort**: Low

**Description**: No `/api/health` or `/api/status` endpoint to monitor uptime or detect partial outages.

**Why it matters**:
- Can't monitor production health
- No way to detect database connection issues
- Uptime monitoring services need health check

**How to validate**:
1. Check API routes: No health check endpoint
2. Try to ping `/api/health`: 404
3. Expected: Health check with DB connection status

**Recommended action**: Create `/api/health` endpoint that checks DB connection, returns status. Use for uptime monitoring.

---

### OPS-004: No automated testing
**Priority**: P2  
**Impact**: Medium | **Effort**: High

**Description**: Test files exist but no CI/CD integration. Regressions can slip through.

**Why it matters**:
- No automated regression testing
- Manual testing is error-prone
- Can't confidently deploy changes

**How to validate**:
1. Check CI/CD config: No test step
2. Tests exist but not run automatically
3. Expected: Automated tests in CI/CD

**Recommended action**: Add test step to CI/CD pipeline. Run unit tests, integration tests, E2E tests on every PR.

---

### OPS-005: No error tracking or alerting
**Priority**: P3  
**Impact**: Low | **Effort**: Medium

**Description**: Console.error used but no external error service. Production errors go unnoticed.

**Why it matters**:
- Can't detect production issues proactively
- Users encounter errors before team knows
- No error context or stack traces

**How to validate**:
1. Check codebase: console.error only
2. No Sentry or similar integration
3. Expected: Error tracking with alerts

**Recommended action**: Integrate Sentry or similar. Add error boundaries with reporting. Set up alerts for critical errors.

---

### OPS-006: No analytics or usage tracking
**Priority**: P3  
**Impact**: Low | **Effort**: Medium

**Description**: No analytics integration. Can't measure feature adoption, conversion, or retention.

**Why it matters**:
- Can't make data-driven decisions
- Don't know which features are used
- Can't measure success metrics

**How to validate**:
1. Check codebase: No analytics calls
2. No PostHog, Mixpanel, or similar
3. Expected: Event tracking for key actions

**Recommended action**: Integrate PostHog or Mixpanel. Track key events (animation created, saved, shared, etc.).

---

### OPS-007: No backup or disaster recovery plan
**Priority**: P2  
**Impact**: Medium | **Effort**: Low

**Description**: No documented backup schedule or restore procedure. Database corruption could lose all data.

**Why it matters**:
- Data loss risk
- No recovery plan if disaster occurs
- Supabase backups may not be sufficient

**How to validate**:
1. Check documentation: No backup plan
2. Supabase backups: Check retention policy
3. Expected: Documented backup and restore procedure

**Recommended action**: Document Supabase backup schedule. Test restore procedure. Consider additional backups for critical data.

---

### OPS-008: No feature flags or gradual rollout
**Priority**: P3  
**Impact**: Low | **Effort**: High

**Description**: No feature flag system. Can't test new features with subset of users or roll back quickly.

**Why it matters**:
- Risky to deploy new features to all users
- Can't A/B test features
- No quick rollback mechanism

**How to validate**:
1. Check codebase: No feature flag system
2. All features deployed to all users
3. Expected: Feature flag system (LaunchDarkly, etc.)

**Recommended action**: Integrate feature flag system. Use for risky features, A/B tests, gradual rollouts.

---

### OPS-009: No performance budgets or monitoring
**Priority**: P3  
**Impact**: Low | **Effort**: Medium

**Description**: No Lighthouse CI, Web Vitals tracking, or APM. Page load time and API latency may degrade over time.

**Why it matters**:
- Can't detect performance regressions
- No baseline for performance
- User experience may degrade unnoticed

**How to validate**:
1. Check CI/CD: No Lighthouse step
2. No Web Vitals tracking
3. Expected: Performance monitoring and budgets

**Recommended action**: Add Lighthouse CI to check performance on every PR. Track Web Vitals in production. Set performance budgets.

---

## Appendix: Validation Commands

### Quick Validation Checklist

```bash
# Test rate limiting performance
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/animations

# Check database indexes
psql $DATABASE_URL -c "\d saved_animations"

# Test guest mode limits
# (Manual: Create 10 frames as guest, try to add 11th)

# Test WebM export on Safari
# (Manual: Export animation, try to play in Safari)

# Load test gallery endpoint
ab -n 100 -c 10 http://localhost:3000/api/gallery

# Check bundle size
npm run build && du -sh .next/static/chunks/*

# Test offline mode
# (DevTools: Set offline, try to use editor)
```

---

## Next Steps

1. **Triage with stakeholders**: Review P0/P1 issues, confirm priorities
2. **Create task list**: Break down issues into implementable tasks (see `tasks.md`)
3. **Set up monitoring**: Implement OPS-003 (health check) first
4. **Fix P0 issues**: REL-001, REL-010, ARCH-001 before public launch
5. **Plan P1 sprint**: Address within 2 weeks of launch
6. **Track progress**: Use `PROGRESS.md` to log fixes and validation

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-30  
**Status**: Initial Review Complete
