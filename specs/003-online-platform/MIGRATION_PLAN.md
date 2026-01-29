# Migration Plan: Vite to Next.js + Online Platform

**Feature Branch**: `003-online-platform`  
**Created**: 2026-01-29  
**Status**: Ready for Implementation

## Overview

This plan migrates the existing Vite + React application to Next.js while adding user accounts, cloud storage, gallery features, and website pages. The migration is designed to be incremental and non-breaking.

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] Supabase project configured with Auth enabled
- [ ] Vercel account connected to repository
- [ ] Environment variables ready (`.env.local`)

---

## Phase 1: Next.js Foundation (Non-Breaking)

**Goal**: Set up Next.js alongside existing Vite code, verify build works.

### 1.1 Initialize Next.js

```bash
npm install next@latest
npm install @supabase/ssr
```

### 1.2 Create Next.js App Router Structure

```
app/
  layout.tsx           # Root layout with providers
  page.tsx             # Landing page (/)
  globals.css          # Import existing styles
  (auth)/
    login/page.tsx
    register/page.tsx
    forgot-password/page.tsx
  (legal)/
    terms/page.tsx
    privacy/page.tsx
    contact/page.tsx
  app/
    page.tsx           # Animation tool (/app)
  gallery/
    page.tsx           # Public gallery
    [id]/page.tsx      # Animation detail
  my-gallery/
    page.tsx           # User gallery (protected)
  replay/
    [id]/page.tsx      # Shareable replay
  admin/
    page.tsx           # Admin dashboard
  api/
    auth/callback/route.ts
    animations/route.ts
    share/route.ts
    report/route.ts
```

### 1.3 Configure next.config.js

- Security headers (CSP, X-Frame-Options, etc.)
- Image domains for Supabase
- Preserve Tailwind setup

### 1.4 Update package.json Scripts

- `dev`: next dev
- `build`: next build
- `start`: next start
- Keep `dev:vite` temporarily for comparison

### 1.5 Verification

- [ ] `npm run dev` starts Next.js
- [ ] Landing page renders at `/`
- [ ] No build errors
- [ ] Tailwind CSS works

### 1.6 PWA Configuration

**Goal**: Ensure app boots without network connection per Constitution V.1 (Sacred Offline).

**Tasks**:
1. Install PWA library: `npm install @serwist/next` (or `next-pwa`)
2. Configure `next.config.js` to enable service worker generation
3. Create `public/manifest.json` with app metadata:
   - App name, short name, description
   - Theme color (Pitch Green `#1A3D1A`)
   - Background color (Tactics White `#F8F9FA`)
   - Icons (192x192, 512x512)
   - Display mode: `standalone`
4. Configure caching strategy:
   - **App shell**: Cache HTML, CSS, JS on install
   - **Static assets**: Cache-first for images, fonts
   - **API routes**: Network-first with offline fallback
5. Add offline fallback page for network-dependent routes

**Verification**:
- [ ] App loads when offline (after first visit)
- [ ] Service worker registered successfully
- [ ] manifest.json accessible at `/manifest.json`
- [ ] App installable on mobile devices

---

## Phase 2: Authentication and API Routes

**Goal**: Set up Supabase Auth and migrate API routes.

### 2.1 Supabase SSR Setup

- Create `lib/supabase/server.ts` for server components
- Create `lib/supabase/client.ts` for client components
- Configure cookie-based session handling

### 2.2 Auth Callback Route

- Handle OAuth callback at `/api/auth/callback`
- Exchange code for session
- Redirect to app or error page

### 2.3 Auth Pages

- Login page with email/password form
- Register page with email verification
- Forgot password page
- Reset password page (from email link)

### 2.4 Migrate Share API

- Move `api/share.ts` to `app/api/share/route.ts`
- Convert to Next.js Route Handler format
- Keep existing logic

### 2.5 Verification

- [ ] User can register
- [ ] Email verification works
- [ ] User can log in/out
- [ ] Password reset works
- [ ] Session persists
- [ ] Share API works

---

## Phase 3: Animation Tool Migration (Critical)

**Goal**: Port animation tool to `/app` route preserving all functionality.

### 3.1 Strategy

Wrap existing Editor component in client boundary with dynamic import to avoid SSR issues with Konva.

### 3.2 Create Animation Tool Page

```typescript
'use client';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/components/Editor'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

export default function AnimationToolPage() {
  return <Editor />;
}
```

### 3.3 Extract Editor Component

- Move logic from `App.tsx` to `components/Editor.tsx`
- Keep all canvas, hooks, state management
- Keep LocalStorage persistence

### 3.4 Guest vs Authenticated

- Detect auth state
- Enforce 10 frame limit for guests
- Prompt registration on limit

### 3.5 Verification

- [ ] Canvas renders correctly
- [ ] Entity drag/drop works
- [ ] Timeline navigation works
- [ ] Playback works
- [ ] LocalStorage works
- [ ] GIF export works
- [ ] Offline mode preserved
- [ ] Guest limits enforced

---

## Phase 4: Database Schema and Cloud Storage

**Goal**: Create tables and implement save/load.

### 4.1 Database Tables

- `user_profiles` - extends auth.users
- `saved_animations` - user-owned animations
- `upvotes` - user-animation associations
- `content_reports` - moderation queue
- `follows` - foundation for Phase 2

### 4.2 Row Level Security

- Users view/edit own animations
- Public animations viewable by all
- Link-shared animations viewable with ID
- Admins view all reports

### 4.3 API Routes

- `POST /api/animations` - save new
- `GET /api/animations` - list user's
- `GET /api/animations/[id]` - get single
- `PUT /api/animations/[id]` - update
- `DELETE /api/animations/[id]` - delete

### 4.4 Verification

- [ ] Tables created
- [ ] RLS policies work
- [ ] Save to cloud works
- [ ] Load from cloud works
- [ ] Quota enforcement works

---

## Phase 5: Gallery Pages

**Goal**: Build personal and public galleries.

### 5.1 Personal Gallery (/my-gallery)

- List user's animations
- Sort by title, date, duration, type
- Thumbnail/list view
- Edit metadata modal
- Delete with confirmation
- Visibility toggle

### 5.2 Public Gallery (/gallery)

- SSR for SEO
- Search by title/description
- Filter by type and tags
- Sort: newest, popular
- Pagination

### 5.3 Animation Detail (/gallery/[id])

- Full animation replay
- Metadata display
- Upvote button
- Report button
- Share link copy
- SEO meta tags

### 5.4 Verification

- [ ] Personal gallery works
- [ ] Sorting works
- [ ] Public gallery works
- [ ] Search/filter works
- [ ] Detail page works
- [ ] Upvoting works
- [ ] Reporting works

---

## Phase 6: Static Pages and Polish

**Goal**: Build landing and content pages.

### 6.1 Landing Page

- Hero section
- Feature highlights
- Call-to-action
- Responsive design

### 6.2 Legal Pages

- Terms of Service
- Privacy Policy
- Community Guidelines

### 6.3 Contact Page

- Formspree integration
- Form validation

### 6.4 Verification

- [ ] Landing page renders
- [ ] Mobile responsive
- [ ] Legal pages render
- [ ] Contact form works

---

## Phase 7: Admin Dashboard

**Goal**: Build moderation tools.

### 7.1 Protected Route

- Check admin role
- Redirect non-admins

### 7.2 Moderation Queue

- List pending reports
- View animation + details
- Actions: dismiss, hide, delete
- User actions: warn, ban

### 7.3 Verification

- [ ] Admin-only access
- [ ] Report queue works
- [ ] Actions work

---

## Phase 8: Cleanup and Deploy

**Goal**: Finalize and deploy.

### 8.1 Remove Vite

```bash
npm uninstall vite @vitejs/plugin-react
rm vite.config.ts
```

### 8.2 Final Testing

- All pages render
- Auth flow complete
- Animation tool works
- Cloud storage works
- Galleries work
- Security headers present

### 8.3 Deploy

```bash
git add .
git commit -m "feat: migrate to Next.js with online platform"
git push origin 003-online-platform
```

---

## Risk Mitigations

| Risk | Mitigation |
|------|------------|
| Konva SSR issues | Dynamic import with ssr: false |
| State management | Keep Zustand (Next.js compatible) |
| Auth complexity | Follow Supabase SSR guide |
| Performance | Profile before/after |

---

## Estimated Timeline

| Phase | Effort | Dependencies |
|-------|--------|--------------|
| Phase 1: Foundation | 1 day | None |
| Phase 2: Auth | 2 days | Phase 1 |
| Phase 3: Animation Tool | 2 days | Phase 2 |
| Phase 4: Database | 2 days | Phase 2 |
| Phase 5: Galleries | 3 days | Phase 3, 4 |
| Phase 6: Static Pages | 1 day | Phase 1 |
| Phase 7: Admin | 2 days | Phase 4, 5 |
| Phase 8: Cleanup | 1 day | All |

**Total**: ~14 days of development

---

## Success Criteria

- [ ] All existing functionality preserved
- [ ] User registration and login working
- [ ] Cloud save/load working
- [ ] Personal gallery functional
- [ ] Public gallery with search functional
- [ ] Share link feature improved
- [ ] Landing page live
- [ ] Admin moderation functional
- [ ] No performance regression
- [ ] Security headers in place
